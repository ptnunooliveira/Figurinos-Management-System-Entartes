/**
 * ------------------------------------------------------------
 * File: contaCorrenteRoute.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.0
 * 
 * Description:
 * Definição das rotas HTTP relacionadas com conta corrente.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

const contaCorrenteController = require('../controllers/contaCorrenteController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const perfilMiddleware = require('../middleware/perfilMiddleware.js');


// GET /api/conta-corrente
router.get('/', authMiddleware, perfilMiddleware('FUNCIONARIO'), contaCorrenteController.obterTodosMovimentosContaCorrente);

// GET /api/conta-corrente/me
router.get('/me', authMiddleware, perfilMiddleware('ALUNO'), contaCorrenteController.obterMinhaContaCorrente);

// GET /api/conta-corrente/:id
router.get('/:id', authMiddleware, perfilMiddleware('FUNCIONARIO'), contaCorrenteController.obterMovimentoContaCorrente);

// GET /api/conta-corrente/utilizador/:idUtilizador
router.get('/utilizador/:idUtilizador', authMiddleware, perfilMiddleware('FUNCIONARIO'), contaCorrenteController.obterContaCorrentePorUtilizador);

// PATCH /api/conta-corrente/:id/exportar
router.patch('/:id/exportar', authMiddleware, perfilMiddleware('FUNCIONARIO'), contaCorrenteController.marcarMovimentoComoExportado);

// POST /api/conta-corrente/sincronizar-alugueres
router.post('/sincronizar-alugueres', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), contaCorrenteController.sincronizarMovimentosAluguer);

module.exports = router;