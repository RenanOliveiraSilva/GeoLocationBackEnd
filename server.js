const express = require('express');
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

const app = express();
const PORT = 3000;

app.use(express.json());
require('dotenv').config();


const mongoConnectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/usuarios';

// Conexão com MongoDB
mongoose.connect('mongodb+srv://Renan:123@cluster0.g6lw1jc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Conectado ao MongoDB'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB', err));

// Endpoint para criar usuário
app.post('/usuarios', async (req, res) => {
  const { nome, endereco, latitude, longitude } = req.body;

  if (!nome || !endereco || latitude == null || longitude == null) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
  }

  const usuarioExistente = await Usuario.findOne({ nome, endereco, latitude, longitude });
  if (usuarioExistente) {
    return res.status(400).json({ erro: 'Usuário já existe.' });
  }

  const nomeExiste = await Usuario.findOne({ nome });
  if (nomeExiste) {
    return res.status(400).json({ erro: 'Nome já existe.' });
  }

  try {
    const usuario = new Usuario({ nome, endereco, latitude, longitude });
    await usuario.save();
    res.status(201).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao salvar usuário.' });
  }
});

// Endpoint para listar todos os usuários
app.get('/usuarios', async (req, res) => {
    try {
      const usuarios = await Usuario.find();
      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: 'Erro ao buscar usuários.' });
    }
  });

app.delete('/usuarios', async (req, res) => {
  try {
    const { id } = req.query;
    console.log(id);

    if (!id) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório.' });
    }

    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json({ mensagem: 'Usuário deletado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar usuário.' });
  }
})
  

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
