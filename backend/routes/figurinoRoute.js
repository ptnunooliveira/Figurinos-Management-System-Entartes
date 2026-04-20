/**
 * ------------------------------------------------------------
 * File: figurinosRoute.js
 * Author: Ricardo
 * Date: 2026-04-12
 * Version: 1.0
 * 
 * Description:
 * Definição das rotas HTTP relacionadas com Figurinos.
 * A route apenas recebe o pedido e encaminha para o controller.
 * O controller será responsável por chamar o service onde
 * está a lógica de negócio.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

const figurinoController = require('../controllers/figurinoController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const perfilMiddleware = require('../middleware/perfilMiddleware.js');


// GET /api/figurinos
router.get('/', authMiddleware, figurinoController.obterTodosFigurinos);

// GET /api/figurinos/:id
router.get('/:id', authMiddleware, figurinoController.obterFigurino);

// GET /api/figurinos/:id/disponibilidade
router.get('/:id/disponibilidade', authMiddleware, figurinoController.obterDisponibilidadeFigurino);

// POST /api/figurinos
router.post('/', authMiddleware, perfilMiddleware('FUNCIONARIO'), figurinoController.criarFigurino);

// PUT /api/figurinos/:id
router.put('/:id', authMiddleware, perfilMiddleware('FUNCIONARIO'), figurinoController.atualizarFigurino);

module.exports = router;