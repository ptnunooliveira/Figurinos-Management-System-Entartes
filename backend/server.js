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
