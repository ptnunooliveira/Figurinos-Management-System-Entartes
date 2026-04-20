/**
 * ------------------------------------------------------------
 * File: app.js
 * Authors: Nelson Cruz, Tiago Goncalves, Nuno Oliveira
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
// Adicionado Nelson em 19-04-2026: Rota para gerir dados especificos dos perfis
const perfilRoutes = require("./routes/perfilRoutes");
// Adicionado Nelson em 20-04-2026: Rota para gerir operacoes de figurinos, incluindo acessorios.
const figurinoRoutes = require("./routes/figurinoRoutes");


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
app.use('/pesquisa', auxiliaresRoutes);

// Rotas de perfis
app.use('/perfis', perfilRoutes);

// Adicionado Nelson em 20-04-2026: Rotas de figurinos.
app.use('/figurinos', figurinoRoutes);

// EXPORTAR APP, sempre no final do ficheiro
module.exports = app;
