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
const marketplaceService = require("./services/marketplaceService");


// CONFIGURAÇÃO DA PORTA

// Porta definida no .env ou fallback para 3000
const PORT = process.env.PORT || 3000;


// ARRANCAR SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
}); 

const INTERVALO_VERIFICACAO_MARKETPLACE_MS = 5 * 60 * 1000;

const executarVerificacaoMarketplace = async () => {
    try {
        await marketplaceService.processarTransicoesTemporaisMarketplace();
    } catch (error) {
        console.error("Erro ao processar transicoes temporais do marketplace:", error.message);
    }
};

executarVerificacaoMarketplace();
setInterval(executarVerificacaoMarketplace, INTERVALO_VERIFICACAO_MARKETPLACE_MS);
