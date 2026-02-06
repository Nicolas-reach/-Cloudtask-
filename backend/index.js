const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Memória temporária (enquanto o servidor estiver ligado)
let tarefas = [
    { id: 1, titulo: "Minha primeira tarefa", status: "pendente" }
];

// Rota para LISTAR tarefas (GET)
app.get('/tarefas', (req, res) => {
    res.json(tarefas);
});

// Rota para CRIAR tarefa (POST)
app.post('/tarefas', (req, res) => {
    const novaTarefa = {
        id: tarefas.length + 1,
        titulo: req.body.titulo, // Pega o que enviar no Postman
        status: "pendente"
    };
    tarefas.push(novaTarefa);
    res.status(201).json(novaTarefa);
});

// Rota para DELETAR tarefa (DELETE)
app.delete('/tarefas/:id', (req, res) => {
    const id = parseInt(req.params.id); // Pega o número da URL
    
    // Filtra a lista, mantendo apenas quem tem ID diferente do solicitado
    const tarefasRestantes = tarefas.filter(t => t.id !== id);
    
    if (tarefas.length === tarefasRestantes.length) {
        return res.status(404).json({ erro: "Tarefa não encontrada" });
    }

    tarefas = tarefasRestantes; // Atualiza a lista principal
    res.status(200).json({ mensagem: "Tarefa removida com sucesso!" });
});


app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});