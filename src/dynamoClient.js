const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
require("dotenv").config(); // Carrega as chaves do .env

// 1. Configura a conexão bruta
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 2. Cria o cliente simplificado (para lidar com JSON fácil)
const dynamoDB = DynamoDBDocumentClient.from(client);

// Exporta para usar no resto do projeto
module.exports = { client, dynamoDB };