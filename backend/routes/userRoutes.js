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
const perfilMiddleware = require("../middleware/perfilMiddleware");

// LISTAR UTILIZADORES (apenas admin)
router.get("/", authMiddleware, perfilMiddleware('FUNCIONARIO'), userController.getAllUsers);

// OBTER UTILIZADOR POR ID
router.get('/:id', authMiddleware, userController.getUserById);

// ATUALIZAR UTILIZADOR
router.put('/:id', authMiddleware, userController.updateUser);

// DESATIVAR UTILIZADOR (apenas admin)
router.delete("/:id", authMiddleware, perfilMiddleware('FUNCIONARIO'), userController.disableUser);

module.exports = router;