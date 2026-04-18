/**
 * ------------------------------------------------------------
 * File: reservasRoute.js
 * Author: Nuno Oliveira
 * Date: 2026-03-29
 * Version: 1.0
 * 
 * Description:
 * Definição das rotas HTTP relacionadas com Reservas.
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

// Importa o controlador das reservas
const reservaController = require('../controllers/reservaController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const perfilMiddleware = require('../middleware/perfilMiddleware.js');
const verificarPerfil = require('../middleware/perfilMiddleware.js');


// Definição das rotas GET
router.get('/teste-db', reservaController.obterTodasReservas);
router.get('/', authMiddleware, perfilMiddleware('FUNCIONARIO'), reservaController.obterTodasReservas);
router.get('/mine', authMiddleware, perfilMiddleware('ALUNO'), reservaController.obterReservasDoUtilizador);
router.get('/aluno/:id', authMiddleware, perfilMiddleware('FUNCIONARIO'), reservaController.obterReservasDoAluno);
router.get('/:id', authMiddleware, reservaController.obterDetalhesReserva);

// Definição das rotas POST
router.post('/', authMiddleware, perfilMiddleware(["FUNCIONARIO", "ALUNO"]), reservaController.criarReserva);

// Definição das rotas PATCH
router.patch('/:id/estado', authMiddleware, verificarPerfil('FUNCIONARIO'), reservaController.atualizarEstadoReserva);
router.patch('/mine/:id/cancelar', authMiddleware, perfilMiddleware('ALUNO'), reservaController.cancelarReserva);


module.exports = router;