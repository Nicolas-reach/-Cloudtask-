const express = require('express');
const cors = require('cors');
const { ScanCommand, PutCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
// Importa a conexão na pasta src
const { dynamoDB } = require('./src/dynamoClient'); 

const app = express();
const PORT = 3000;
const TABLE_NAME = "Tasks"; // Nome da tabela na AWS

app.use(express.json());
app.use(cors());

// 1: Listar Tarefas (GET)
app.get('/tasks', async (req, res) => {
    try {
        const params = { TableName: TABLE_NAME };
        const command = new ScanCommand(params);
        const result = await dynamoDB.send(command);
        
        res.json(result.Items);
    } catch (error) {
        console.error("Erro ao buscar:", error);
        res.status(500).json({ error: "Erro ao buscar tarefas" });
    }
});

// 2: Criar Tarefa (POST)
app.post('/tasks', async (req, res) => {
    try {
        const newTask = {
            id: Date.now().toString(),
            title: req.body.title,
            completed: false
        };

        const params = {
            TableName: TABLE_NAME,
            Item: newTask
        };

        const command = new PutCommand(params);
        await dynamoDB.send(command);

        res.status(201).json(newTask);
    } catch (error) {
        console.error("Erro ao salvar:", error);
        res.status(500).json({ error: "Erro ao salvar tarefa" });
    }
});

//3: Deletar Tarefa (DELETE)
app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID que veio na URL

        const params = {
            TableName: TABLE_NAME,
            Key: {
                id: id // A chave para encontrar o item na AWS
            }
        };

        const command = new DeleteCommand(params);
        await dynamoDB.send(command);

        res.json({ message: "Tarefa deletada com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar:", error);
        res.status(500).json({ error: "Erro ao deletar tarefa" });
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

app.listen(PORT, () => {
    console.log(`🔥 Servidor CloudTask rodando na porta ${PORT}`);
});