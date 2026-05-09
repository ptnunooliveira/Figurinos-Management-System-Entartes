/**
 * ------------------------------------------------------------
 * File: figurinosRoute.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.2
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

// GET /api/figurinos/:id/historico
router.get('/:id/historico', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), figurinoController.obterHistoricoFigurino);

// GET /api/figurinos/:id/disponibilidade?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
router.get('/:id/disponibilidade', authMiddleware, figurinoController.obterDisponibilidadeFigurino);

// POST /api/figurinos
router.post('/', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), figurinoController.criarFigurino);

// POST /api/figurinos/:id/acessorios
router.post('/:id/acessorios', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), figurinoController.associarAcessorio);

// PUT /api/figurinos/:id
router.put('/:id', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), figurinoController.atualizarFigurino);

// DELETE /api/figurinos/:id
router.delete('/:id', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), figurinoController.eliminarFigurino);

// PATCH /api/figurinos/:id/desativar
router.patch('/:id/desativar', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), figurinoController.desativarFigurino);

module.exports = router;
