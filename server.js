const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { ScanCommand, PutCommand, DeleteCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

// --- MIDDLEWARE DE AUTENTICAÇÃO (O "Segurança") ---
function verificarToken(req, res, next) {
    // 1. Pega o token que vem no cabeçalho da requisição
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader && tokenHeader.split(' ')[1]; // Tira a palavra "Bearer " e pega só o código

    // 2. Se não tiver token, barra na porta
    if (!token) {
        return res.status(401).json({ error: "Acesso negado. Token não fornecido!" });
    }

    try {
        // 3. Verifica se o token é válido e não é falsificado
        // Lembra que o segredo tem que ser o mesmo que você usou na rota de login!
        const usuarioVerificado = jwt.verify(token, process.env.JWT_SECRET || "segredo_do_jwt_super_seguro");
        
        // 4. Se deu tudo certo, anota quem é o usuário e deixa ele passar (next)
        req.user = usuarioVerificado;
        next();
    } catch (error) {
        res.status(403).json({ error: "Token inválido ou expirado!" });
    }
}

// Importa a conexão na pasta src
const { dynamoDB } = require('./src/dynamoClient'); 

const app = express();
const PORT = 3000;
const TABLE_NAME = "Tasks"; // Nome da tabela na AWS

app.use(express.json());
app.use(cors());

// 1: Listar Tarefas (GET)
app.get('/tasks', verificarToken, async (req, res) => {
    try {
        const params = { 
            TableName: "Tasks",
            FilterExpression: "userEmail = :emailLogado",
            ExpressionAttributeValues: {
            ":emailLogado": req.user.email
          }
        };
        const command = new ScanCommand(params);
        const result = await dynamoDB.send(command); // Busca todas as tarefas na tabela
        
        res.json(result.Items);
    } catch (error) {
        console.error("Erro ao buscar:", error);
        res.status(500).json({ error: "Erro ao buscar tarefas" });
    }
});

// --- ROTA DE REGISTRO DE USUÁRIO ---
app.post('/register', async (req, res) => {
    // 1. Pegamos os dados que o usuário digitou no site/Postman
    const { name, email, password } = req.body;

    // 2. Verificamos se ele não esqueceu de preencher nada
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Nome, email e senha são obrigatórios!" });
    }

    try {
        // 3. A MÁGICA DA SEGURANÇA (bcrypt)
        // O "salt" é um tempero extra pra deixar a senha mais indecifrável
        const salt = await bcrypt.genSalt(10);
        // Aqui transformamos "senha123" em "$2a$10$EixZaYVK1fs..."
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Preparamos o pacote para enviar pra AWS
        const params = {
            TableName: "Users", // O nome exato da tabela que você criou
            Item: {
                email: email, // Nossa Chave Primária!
                name: name,
                password: hashedPassword, // Salvamos a senha embaralhada! NUNCA a original.
                createdAt: new Date().toISOString()
            }
        };

        // 5. Enviamos para o DynamoDB
        const command = new PutCommand(params); // Usa o mesmo comando que você já usava pras tarefas
        await dynamoDB.send(command);

        // 6. Devolvemos a resposta de sucesso
        res.status(201).json({ message: "Usuário criado com sucesso!" });

    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        res.status(500).json({ error: "Erro ao criar usuário no banco de dados." });
    }
});

// --- ROTA DE LOGIN DE UTILIZADOR ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // 1. Verificamos se o utilizador enviou o e-mail e a palavra-passe
    if (!email || !password) {
        return res.status(400).json({ error: "E-mail e palavra-passe são obrigatórios!" });
    }

    try {
        // 2. Procuramos o utilizador na AWS usando a Chave Primária (email)
        const params = {
            TableName: "Users",
            Key: {
                email: email
            }
        };
        const command = new GetCommand(params);
        const response = await dynamoDB.send(command);
        const user = response.Item;

        // Se a AWS não devolver nada, o e-mail não existe
        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado!" });
        }

        // 3. Comparamos a palavra-passe digitada com o Hash guardado na base de dados
        // O bcrypt.compare faz a matemática para saber se correspondem
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Palavra-passe incorreta!" });
        }

        // 4. Se a palavra-passe estiver correta, geramos o TOKEN (O Crachá JWT)
        // Nota: Numa aplicação real, o 'segredo_do_jwt' ficaria no ficheiro .env
        const token = jwt.sign(
            { email: user.email, name: user.name }, 
            process.env.JWT_SECRET || "segredo_do_jwt_super_seguro", 
            { expiresIn: "2h" } // O token expira em 2 horas
        );

        // 5. Devolvemos sucesso e o token ao utilizador!
        res.status(200).json({ 
            message: "Login efetuado com sucesso!", 
            token: token 
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: "Erro interno ao tentar efetuar o login." });
    }
});

// 2: Criar Tarefa (POST) 
app.post('/tasks', verificarToken, async (req, res) => {
    try {
        const params = {
            TableName: "Tasks", // Tem que ser exatamente o mesmo nome que está no GET!
            Item: {
                id: req.body.id || Date.now().toString(), 
                title: req.body.title,
                completed: req.body.completed || false,
                userEmail: req.user.email // <--- A MÁGICA ESTÁ AQUI! O carimbo de quem criou.
            }
        };

        const command = new PutCommand(params);
        await dynamoDB.send(command);

        res.status(201).json({ message: "Tarefa criada com sucesso e vinculada ao usuário!" });
    } catch (error) {
        console.error("Erro ao criar:", error);
        res.status(500).json({ error: "Erro ao criar tarefa" });
    }
});

// ---3: ROTA (DELETE): Apagar tarefa (PROTEGIDA POR DONO) ---
app.delete('/tasks/:id', verificarToken, async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME,
            Key: {
                id: req.params.id 
            },
            // Só deleta se o dono da tarefa for quem está logado
            ConditionExpression: "userEmail = :emailLogado",
            ExpressionAttributeValues: {
                ":emailLogado": req.user.email
            }
        };

        const command = new DeleteCommand(params);
        await dynamoDB.send(command);

        res.status(200).json({ message: "Tarefa apagada com sucesso!" });

    } catch (error) {
        // Se a tarefa não for dele (ou não existir), a AWS devolve um erro de "ConditionalCheckFailed"
        if (error.name === "ConditionalCheckFailedException") {
            return res.status(403).json({ error: "Você não tem permissão para apagar esta tarefa." });
        }
        console.error("Erro ao apagar tarefa:", error);
        res.status(500).json({ error: "Erro interno ao apagar a tarefa." });
    }
});

// 4: Atualizar Tarefa (PUT) - Marcar como feita/não feita
app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body; // Recebe true ou false do site

        const params = {
            TableName: TABLE_NAME,
            Key: { id: id },
            // Essa é a linguagem da AWS para: "Atualize o campo 'completed' com o valor ':c'"
            UpdateExpression: "set completed = :c",
            ExpressionAttributeValues: {
                ":c": completed
            },
            ReturnValues: "ALL_NEW"
        };

        const command = new UpdateCommand(params);
        const result = await dynamoDB.send(command);

        res.json(result.Attributes);
    } catch (error) {
        console.error("Erro ao atualizar:", error);
        res.status(500).json({ error: "Erro ao atualizar tarefa" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🔥 Servidor CloudTask rodando na porta ${PORT}`);
});

