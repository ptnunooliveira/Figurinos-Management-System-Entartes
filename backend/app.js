/**
 * ------------------------------------------------------------------------
 * File: app.js
 * Author: Tiago Gonçalves
 * Date: 2026-03-30
 * Version: 1.0
 * Description: 
 * Configuração do API
 * ------------------------------------------------------------------------
 */

// Importar objeto da api express
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const auxiliaresRoutes = require("./routes/auxiliaresRoutes");

// Criar a variavel app que irá ser utilizado no resto do codigo
const app = express();

// Porta que irá ser utilizada
const PORT = 5500;

app.use(express.json());

// Routes tabelas auxiliares
app.use("/api", auxiliaresRoutes);

app.get("/", (req, res) => {
  res.send("API a funcionar 🚀");
});

////////////////////////////////////
// configuração do API (app.listen)//
////////////////////////////////////
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
});