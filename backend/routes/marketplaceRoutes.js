/**
* ------------------------------------------------------------------------
* File: marketplaceRoutes.js
* Author: Tiago Gonçalves
* Date: 2026-04-20
* Version: 1.0
* Description:
* Routes para o marketplace
* ------------------------------------------------------------------------
*/

// Importar objetos
const express = require("express");
const route = express.Router();
const controller = require("../controllers/marketplaceController");
const authMiddleware = require("../middleware/authMiddleware");
const perfilMiddleware = require("../middleware/perfilMiddleware");
const { uploadMarketplaceImages } = require("../middleware/uploadMarketplaceImages");

// Routes para marketplace
// criar novo anuncio
route.post("/", authMiddleware, perfilMiddleware(["ALUNO"]), uploadMarketplaceImages, controller.newMarketplace);
// obter anuncios do marketplace
route.get("/", authMiddleware, controller.getMarketplace);
// visualizar anuncios do marketplace para gestao (todos os anuncios, incluindo os rejeitados e arquivados)
route.get("/gestao", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.getMarketplaceGestao);
// obter anuncio do marketplace por id (visualizar histórico de um anuncio, incluindo os rejeitados e arquivados, sendo que o aluno só pode visualizar os seus anuncios)
route.get("/:userid", authMiddleware, controller.getMarketplaceById);
// editar anuncio do marketplace (apenas se estiver pendente)
route.patch("/:id", authMiddleware, perfilMiddleware(["ALUNO"]), controller.editMarketplace);
// ressubmeter anuncio rejeitado (no prazo de 3 dias)
route.post("/:id/ressubmeter", authMiddleware, perfilMiddleware(["ALUNO"]), controller.resubmitMarketplace);
// aprovar ou rejeitar anuncio do marketplace (apenas se estiver pendente)
route.patch("/:id/aprovar", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateMarketplaceStatus);
// mudar para arquivado um anuncio do marketplace (apenas se estiver aprovado)
route.delete("/:id", authMiddleware, perfilMiddleware(["ALUNO"]), controller.deleteMarketplace);
// continuar anuncio pendente de renovacao
route.post("/:id/continuar", authMiddleware, perfilMiddleware(["ALUNO"]), controller.continueMarketplace);

// Exportar routes
module.exports = route;
