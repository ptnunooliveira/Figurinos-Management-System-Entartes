/**
 * ------------------------------------------------------------
 * File: figurinoRoutes.js
 * Author: Nelson Cruz
 * Date: 2026-04-20
 * Version: 1.0
 * Description:
 * Rotas relacionadas com figurinos.
 * ------------------------------------------------------------
 */

const express = require("express");
const router = express.Router();

const figurinoController = require("../controllers/figurinoController");
const authMiddleware = require("../middleware/authMiddleware");
const perfilMiddleware = require("../middleware/perfilMiddleware");

// Adicionado Nelson em 20-04-2026: endpoint para associar um acessorio a um figurino.
router.post(
    "/:id/acessorios",
    authMiddleware,
    perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
    figurinoController.associarAcessorio
);

module.exports = router;
