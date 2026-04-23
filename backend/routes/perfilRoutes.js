/**
 * ------------------------------------------------------------
 * File: perfilRoutes.js
 * Author: Nelson Cruz
 * Date: 2026-04-19
 * Version: 1.0
 * Description:
 * Rotas para gerir dados especificos dos perfis.
 * ------------------------------------------------------------
 */

const express = require("express");
const router = express.Router();

const perfilController = require("../controllers/perfilController");
const authMiddleware = require("../middleware/authMiddleware");
const perfilMiddleware = require("../middleware/perfilMiddleware");

router.patch(
    "/alunos/:idUtilizador",
    authMiddleware,
    perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
    perfilController.preencherDadosAluno
);

// Apenas ADMIN pode preencher dados especificos de funcionarios.
router.patch(
    "/funcionarios/:idUtilizador",
    authMiddleware,
    perfilMiddleware(["ADMIN"]),
    perfilController.preencherDadosFuncionario
);

module.exports = router;
