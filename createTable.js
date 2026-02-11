const { CreateTableCommand } = require("@aws-sdk/client-dynamodb");
const { client } = require("./src/dynamoClient");

async function createTable() {
  const command = new CreateTableCommand({
    TableName: "Tasks",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }], // Chave Primária (ID)
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }], // S = String
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  });

  try {
    console.log("⏳ Criando tabela 'Tasks' na AWS...");
    const response = await client.send(command);
    console.log("✅ Sucesso! Tabela criada:", response.TableDescription.TableName);
  } catch (error) {
    if (error.name === "ResourceInUseException") {
      console.log("⚠️ A tabela 'Tasks' já existe! Pode seguir em frente.");
    } else {
      console.error("❌ Erro ao criar tabela:", error);
    }
  }
}

createTable();