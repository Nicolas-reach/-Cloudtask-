☁️ CloudTask: API REST Segura e Multiusuário
Desenvolvedor: Nicolas Forcione e Oliveira e Souza
Objetivo: Desenvolvimento Full-Stack de um gerenciador de tarefas em Node.js com arquitetura REST, banco de dados na nuvem (AWS DynamoDB) e sistema completo de autenticação JWT.

## 1. Minhas Contribuições Técnicas
Este projeto evoluiu de um modelo de dados público para uma aplicação isolada e segura. Minhas principais implementações incluem:

Autenticação e Criptografia: Criação de rotas de Cadastro e Login do zero, utilizando ```bcrypt``` para não armazenar senhas em texto puro.

Sessões Stateless (JWT): Implementação de JSON Web Tokens para gerenciar acessos sem necessidade de guardar estado no servidor.

Middleware de Proteção: Desenvolvimento de um "guarda de rota" que intercepta requisições, valida o token do usuário e bloqueia acessos não autorizados.

Isolamento de Dados (Multijogador): Modelagem no AWS DynamoDB vinculando cada tarefa ao e-mail do seu criador. Filtros no backend garantem que um usuário não possa visualizar, alterar ou excluir tarefas de terceiros.

Integração Frontend: Adaptação da interface para gerenciar o login, salvar o token no ```localStorage``` do navegador e injetá-lo dinamicamente no cabeçalho (Headers) de todas as requisições ```fetch```.

## 2. Stack Tecnológica
Backend: Node.js, Express

Banco de Dados: AWS DynamoDB (us-east-1), ```@aws-sdk/client-dynamodb```

Segurança: ```jsonwebtoken``` (JWT), ```bcrypt```, ```dotenv``` (Gestão de variáveis de ambiente)

Frontend: HTML5, CSS3 tradicional, Vanilla JavaScript (Fetch API)

## 3. Endpoints da API
Autenticação (Rotas Públicas)
```POST /cadastro```: Recebe e-mail e senha, aplica o hash na senha e salva no banco de Usuários.

```POST /login```: Verifica credenciais e retorna um Token JWT válido.

Gerenciamento de Tarefas (Rotas Protegidas)
Requerem Header: ```Authorization: Bearer <token>```

GET /tasks: Busca no DynamoDB e retorna apenas as tarefas atreladas ao e-mail do usuário autenticado.

```POST /tasks```: Cria uma nova tarefa, gerando um ID único e carimbando automaticamente o e-mail do criador no registro.

```PUT /tasks/:id```: Atualiza o status (concluída/pendente) da tarefa.

```DELETE /tasks/:id```: Remove a tarefa da AWS (protegido por ConditionExpression para garantir que apenas o dono possa deletá-la).

## 4. Testes e Validação (Postman)
A validação das rotas protegidas exige a configuração de dois Headers no cliente HTTP:

```Content-Type```: ```application/json```

```Authorization```: ```Bearer SEU_TOKEN_AQUI```

## 5. Banco de Dados e Cloud Computing (AWS)
O sistema utiliza duas tabelas no DynamoDB (NoSQL):

Users: Armazena e-mails e senhas criptografadas.

Tasks: Armazena as tarefas contendo um ID gerado via timestamp, o título, o status e a chave estrangeira lógica (```userEmail```) para relacionamento com o dono.
Os dados persistem fisicamente nos Data Centers da AWS, sobrevivendo a reinicializações do servidor.

## 6. Segurança e Integração
Variáveis de Ambiente (```.env```): As credenciais da AWS (```AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY```) e o segredo do token (```JWT_SECRET```) estão isolados. O arquivo ```.env``` está no ```.gitignore``` para prevenir vazamento de chaves no repositório.

CORS -: Middleware configurado no Express para permitir requisições cross-origin do Frontend para a API.

## 7. Consumo pelo Frontend (Navegador)
A interface captura as credenciais, envia ao endpoint de login e armazena o token recebido no ```localStorage```. Funções assíncronas (```async/await```) utilizam o Fetch API para enviar o token ao backend, receber os dados filtrados e construir o DOM dinamicamente, garantindo uma transição fluida entre o estado "Deslogado" (Tela de Login) e "Logado" (Dashboard de Tarefas).
