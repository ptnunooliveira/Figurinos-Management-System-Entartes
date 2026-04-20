/**
 * ------------------------------------------------------------
 * File: checklistRoutes.js
 * Author: Nuno Oliveira
 * Date: 2026-04-20
 * Version: 1.0
 * 
 * Description:
 * Definição das rotas HTTP relacionadas com as Checklists.
 * A route apenas recebe o pedido e encaminha para o controller.
 * O controller será responsável por chamar o service onde
 * está a lógica de negócio.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

// Importa o módulo Express para criar rotas
const express = require('express');

// Cria um objeto router do Express para definir as rotas
const router = express.Router();

// Importar o controller de checklists e middlewares
const checklistController = require('../controllers/checklistController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const perfilMiddleware = require('../middleware/perfilMiddleware.js');