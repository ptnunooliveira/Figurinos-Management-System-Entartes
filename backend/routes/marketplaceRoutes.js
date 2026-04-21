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

// Routes para marketplace
route.post("/", authMiddleware, perfilMiddleware(["ALUNO"]), controller.newMarketplace);
route.get("/", authMiddleware, controller.getMarketplace);
route.get("/gestao", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.getMarketplaceGestao);
route.get("/:userid", authMiddleware, controller.getMarketplaceById);
route.patch("/:id", authMiddleware, perfilMiddleware(["ALUNO"]), controller.editMarketplace);
route.patch("/:id/aprovar", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateMarketplaceStatus);
route.delete("/:id", authMiddleware, perfilMiddleware(["ALUNO"]), controller.deleteMarketplace);

// Exportar routes
module.exports = route;
