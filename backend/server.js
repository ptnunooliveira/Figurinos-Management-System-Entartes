<<<<<<< HEAD
const express = require('express');
const app = express();

app.use(express.json());

const anunciosEscolaRoutes = require('./routes/anunciosEscola.routes');
app.use('/anuncios-escola', anunciosEscolaRoutes);

app.listen(3000, () => {
  console.log('Servidor a correr em http://localhost:3000');
});
=======
/**
 * ------------------------------------------------------------
 * File: server.js
 * Author: Nelson Cruz
 * Date: 2026-03-29
 * Version: 1.0
 * Description:
 * Ficheiro responsável por arrancar o servidor.
 * Importa a app e coloca-a a escutar numa porta.
 * ------------------------------------------------------------
 */

// Importar a aplicação configurada
const app = require("./app");


// CONFIGURAÇÃO DA PORTA

// Porta definida no .env ou fallback para 3000
const PORT = process.env.PORT || 3000;


// ARRANCAR SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
}); 
>>>>>>> 4ea0fdf9fa1abd92840ae19308f96367794a2dde
