/**
 * ------------------------------------------------------------
 * File: app.js
 * Author: Nelson Cruz
 * Date: 2026-03-29
 * Version: 1.0
 * Description:
 * Configuração principal da aplicação Express.
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
const figurinosRoute = require('./routes/figurinoRoute.js');

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

// Rotas de figurinos
app.use('/figurinos', figurinosRoute);

// EXPORTAR APP, sempre no final do ficheiro
module.exports = app;