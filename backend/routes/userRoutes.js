/**
 * ------------------------------------------------------------
 * File: userRoutes.js
 * Author: Nelson Cruz
 * Date: 2026-04-03
 * Version: 1.0
 * Description:
 * Definição das rotas relacionadas com utilizadores.
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); 
const isAdmin = require("../middleware/isAdmin");

// LISTAR UTILIZADORES (apenas admin)
router.get("/", authMiddleware, isAdmin, userController.getAllUsers);

// OBTER UTILIZADOR POR ID
router.get('/:id', authMiddleware, userController.getUserById);

// ATUALIZAR UTILIZADOR
router.put('/:id', authMiddleware, userController.updateUser);

// DESATIVAR UTILIZADOR (apenas admin)
router.delete("/:id", authMiddleware, isAdmin, userController.disableUser);

module.exports = router;