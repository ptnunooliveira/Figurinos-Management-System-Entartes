/**
 * ------------------------------------------------------------
 * File: contestacaoRoute.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.0
 * 
 * Description:
 * Definição das rotas HTTP relacionadas com contestações.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

const contestacaoController = require('../controllers/contestacaoController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const perfilMiddleware = require('../middleware/perfilMiddleware.js');


// GET /api/contestacoes
router.get('/', authMiddleware, perfilMiddleware('FUNCIONARIO'), contestacaoController.obterTodasContestacoes);

// GET /api/contestacoes/:id
router.get('/:id', authMiddleware, contestacaoController.obterContestacao);

// GET /api/contestacoes/proposta/:idProposta
router.get('/proposta/:idProposta', authMiddleware, contestacaoController.obterContestacoesPorProposta);

// POST /api/contestacoes
router.post('/', authMiddleware, perfilMiddleware('ALUNO'), contestacaoController.criarContestacao);

module.exports = router;