# 📘 Documentação de Estudo: API REST com Node.js (Projeto CloudTask)

**Objetivo:** Desenvolvimento de uma API para gerenciamento de tarefas utilizando JavaScript no backend, seguindo a arquitetura REST e integração com Cloud Computing.

## 1. Stack Tecnológica

### Node.js
Ambiente de execução (Runtime) que permite rodar JavaScript no servidor.
* **Características:** Utiliza um modelo de I/O não bloqueante (Assíncrono), ideal para lidar com múltiplas requisições simultâneas.

### Express
Framework web para Node.js.
* **Função:** Abstrai a complexidade de criar servidores HTTP puros, gerenciando roteamento (URLs), requisições e respostas.

### JSON (JavaScript Object Notation)
Formato padrão para intercâmbio de dados, escolhido por ser leve e legível.

---

## 2. Estrutura e Configuração

### Inicialização
O comando `npm init -y` cria o arquivo `package.json`, que serve como manifesto do projeto.

### Dependências Instaladas
* `express`: Framework principal da API.
* `nodemon`: Dependência de desenvolvimento (-D) para reinício automático do servidor.
* `@aws-sdk/client-dynamodb`: Cliente AWS para conexão com banco de dados.
* `dotenv`: Gerenciamento de variáveis de ambiente.
* `cors`: Liberação de acesso para o Frontend.

```bash
npm install express cors dotenv @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install nodemon -D 
```
---
 3. Implementação da API (Endpoints)
O servidor roda na porta 3000 e utiliza o middleware express.json() para interpretar o corpo das requisições.

**A. Listar Dados (GET)**
Rota: /tasks

Lógica: Busca a lista completa de tarefas diretamente do banco de dados AWS DynamoDB.

Status HTTP: 200 OK

**B. Criar Dados (POST)**
Rota: /tasks

Entrada: Recebe um objeto JSON no body.

Lógica: Gera um ID único (Timestamp), cria o objeto e envia o comando PutCommand para salvar na AWS.

Status HTTP: 201 Created

**C. Remover Dados (DELETE)**
Rota: /tasks/:id

Conceito (req.params): O :id indica um Parâmetro de Rota, capturando valores dinâmicos da URL.

Lógica: Envia comando de deleção para a tabela no DynamoDB baseada na chave primária (ID).

**D. Atualizar Dados (PUT)**
Rota: /tasks/:id

Lógica: Atualiza o status de conclusão (completed) da tarefa sem apagar o registro.

Status HTTP: 200 OK

---

## 4. Testes e Validação (Postman)
A validação simula um cliente HTTP externo.

Configuração de Header (POST/PUT):

Content-Type: application/json

Body: configurado como raw > JSON.

---

## 5. Versionamento (Git)
Arquivo .gitignore configurado para ignorar a pasta node_modules e arquivos sensíveis.

Motivo: Dependências devem ser instaladas via npm install e chaves de segurança não devem ser versionadas.

---

## 6. Integração com Banco de Dados em Nuvem (AWS DynamoDB)
Substituição da memória volátil (Array local) por um banco de dados NoSQL gerenciado pela Amazon Web Services (AWS).

Bibliotecas AWS SDK v3:

@aws-sdk/client-dynamodb: Cliente de baixo nível para conexão com a AWS.

@aws-sdk/lib-dynamodb: Cliente de alto nível ("DocumentClient") que simplifica a conversão de objetos JavaScript para o formato do banco.

Conceito de Persistência: Os dados agora sobrevivem ao reinício do servidor, sendo armazenados fisicamente nos Data Centers da AWS (Região us-east-1).

---

## 7. Segurança e Variáveis de Ambiente (.env)
Gerenciamento de credenciais sensíveis (Chaves de Acesso AWS) fora do código-fonte.

Biblioteca dotenv: Carrega as variáveis definidas no arquivo .env para dentro do process.env do Node.js.

Boas Práticas de Segurança:

Arquivo .env: Contém AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY.

Arquivo .gitignore: Atualizado para incluir .env.

Motivo Crítico: Chaves de acesso nunca devem ser versionadas no Git/GitHub para evitar roubo de credenciais e cobranças indevidas na nuvem.

---

## 8. Integração Backend x Frontend (CORS)
Configuração necessária para permitir que o navegador acesse a API.

Middleware CORS (Cross-Origin Resource Sharing):

Problema: Por segurança, navegadores bloqueiam requisições feitas de origens diferentes (ex: um arquivo HTML local tentando acessar o localhost:3000).

Solução: Instalação do pacote cors e uso do app.use(cors()).

Função: Libera o acesso para que o Frontend (site) consiga fazer fetch nos dados do Backend.

---

## 9. Consumo da API (Frontend Simples)
Criação de interface visual (index.html) para interação com o usuário.

Fetch API (JavaScript do Navegador):

Método Async/Await: Utilizado para fazer requisições HTTP assíncronas ao servidor Node.js sem travar a tela.

Manipulação do DOM: O JavaScript recebe o JSON do backend e cria dinamicamente os elementos HTML (<li>, <span>, <button>) para exibir, concluir e excluir tarefas na tela.
