/**
 * ------------------------------------------------------------
 * File: app.js
 * Authors: Nelson Cruz, Tiago Goncalves
 * Date: 2026-04-10
 * Version: 1.0
 * Description:
 * Configuracao principal da aplicacao Express.
 * Aqui definimos middlewares globais e registamos as rotas.
 * ------------------------------------------------------------
 */

// Importar dependências
const express = require("express");
const dotenv = require("dotenv");

// Importar rotas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require('./routes/userRoutes');
const reservasRoutes = require('./routes/reservaRoute');
const auxiliaresRoutes = require("./routes/auxiliaresRoutes");

// Inicializar variáveis de ambiente (.env)
dotenv.config();

// Criar aplicação Express
const app = express();


// MIDDLEWARES GLOBAIS
// Permite receber JSON no body das requests
app.use(express.json());


// ROTAS

// Rota base de teste (para verificar se o servidor está a correr)
app.get("/", (req, res) => {
    res.send("API de Gestão de Figurinos está a funcionar.");
});

// Rotas de autenticação
app.use("/auth", authRoutes);

// Rotas de utilizadores
app.use('/users', userRoutes);

// Rotas de reservas
app.use('/reservas', reservasRoutes);

// Rotas de tabelas auxiliares
app.use('/api', auxiliaresRoutes);

// EXPORTAR APP, sempre no final do ficheiro
module.exports = app;
