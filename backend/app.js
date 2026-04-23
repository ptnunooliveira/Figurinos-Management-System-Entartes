/**
 * ------------------------------------------------------------
 * File: app.js
 * Authors: Nelson Cruz, Tiago Goncalves, Nuno Oliveira
 * Date: 2026-04-10
 * Version: 4.0
 * Description:
 * Configuracao principal da aplicacao Express.
 * Aqui definimos middlewares globais e registamos as rotas.
 * ------------------------------------------------------------
 */

// Importar dependências
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Importar rotas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require('./routes/userRoutes');
const reservasRoutes = require('./routes/reservaRoutes');
const figurinosRoutes = require('./routes/figurinoRoute.js');
const auxiliaresRoutes = require("./routes/auxiliaresRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const devolucaoRoutes = require("./routes/devolucaoRoutes");
const anunciosEscolaRoutes = require('./routes/anunciosEscolaRoutes');

// Adicionado Nelson em 19-04-2026: Rota para gerir dados especificos dos perfis
const perfilRoutes = require("./routes/perfilRoutes");


// Inicializar variáveis de ambiente (.env)
dotenv.config();

// Criar aplicação Express
const app = express();


// MIDDLEWARES GLOBAIS
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));
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
app.use('/figurinos', figurinosRoutes);

// Rotas de anúncios da escola
app.use('/anuncios-escola', anunciosEscolaRoutes);

// Rotas de tabelas auxiliares
app.use('/pesquisa', auxiliaresRoutes);

// Rotas do marketplace
app.use('/marketplace', marketplaceRoutes);

// Rotas de perfis
app.use('/perfis', perfilRoutes);

// Rotas de devoluções, ocorrências e orçamentos
app.use('/', devolucaoRoutes);

// EXPORTAR APP, sempre no final do ficheiro
module.exports = app;
