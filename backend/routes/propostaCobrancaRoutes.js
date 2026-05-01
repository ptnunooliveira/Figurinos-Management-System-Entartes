/**
 * ------------------------------------------------------------
 * File: propostaCobrancaRoute.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.0
 * 
 * Description:
 * Definição das rotas HTTP relacionadas com propostas de cobrança.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

const propostaCobrancaController = require('../controllers/propostaCobrancaController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const perfilMiddleware = require('../middleware/perfilMiddleware.js');


// GET /api/propostas-cobranca
router.get('/', authMiddleware, perfilMiddleware('FUNCIONARIO'), propostaCobrancaController.obterTodasPropostasCobranca);

// GET /api/propostas-cobranca/:id
router.get('/:id', authMiddleware, propostaCobrancaController.obterPropostaCobranca);

// POST /api/propostas-cobranca
router.post('/', authMiddleware, perfilMiddleware('FUNCIONARIO'), propostaCobrancaController.criarPropostaCobranca);

// PATCH /api/propostas-cobranca/:id/estado
router.patch('/:id/estado', authMiddleware, perfilMiddleware('FUNCIONARIO'), propostaCobrancaController.atualizarEstadoPropostaCobranca);

// POST /api/propostas-cobranca/:id/finalizar-conta-corrente
router.post('/:id/finalizar-conta-corrente', authMiddleware, perfilMiddleware('FUNCIONARIO'), propostaCobrancaController.finalizarPropostaEmContaCorrente);

// POST /api/propostas-cobranca/:id/aceitar (aluno aceita a proposta)
router.post('/:id/aceitar', authMiddleware, propostaCobrancaController.aceitarPropostaAluno);

// POST /api/propostas-cobranca/ocorrencia/:idOcorrencia/resolver-contraproposta (funcionário aceita valor do aluno)
router.post('/ocorrencia/:idOcorrencia/resolver-contraproposta', authMiddleware, perfilMiddleware('FUNCIONARIO'), propostaCobrancaController.resolverComContraproposta);

module.exports = router;