/**
 * ------------------------------------------------------------
 * File: auth.routes.js
 * Author: Nelson Cruz
 * Date: 2026-03-29
 * Version: 1.0
 * Description:
 * Rotas relacionadas com a autenticação.
 * Aqui definimos os endpoints de registo, login
 * e obtenção do utilizador autenticado.
 * ------------------------------------------------------------
 */

// Importar dependências
const express = require("express");

// Criar router do Express
const router = express.Router();

// Importar controller de autenticação
const authController = require("../controllers/authController");

// Importar middleware de autenticação
const authMiddleware = require("../middleware/authMiddleware");


// ROTAS PÚBLICAS
// Registar novo utilizador
router.post("/register", authController.register);

// Fazer login
router.post("/login", authController.login);


// ROTAS PROTEGIDAS
// Obter dados do utilizador autenticado
router.get("/me", authMiddleware, authController.me);


// EXPORTAR ROUTER
module.exports = router;