/**
 * ------------------------------------------------------------
 * File: reservasRoutes.js
 * Author: Nuno Oliveira
 * Date: 2026-03-29
 * Version: 3.0
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


/////////////////////////////////////////////////////////////////////////////////
//////////////////// IMPORTAR CONTROLLERS & MIDDLEWARES /////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const reservaController = require('../controllers/reservaController.js');
const checklistController = require('../controllers/checklistController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const perfilMiddleware = require('../middleware/perfilMiddleware.js');


/////////////////////////////////////////////////////////////////////////////////
////////////////////////////// ROTAS DA RESERVA /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

router.get('/', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), reservaController.obterTodasReservas);
router.get('/mine', authMiddleware, perfilMiddleware('ALUNO'), reservaController.obterReservasDoUtilizador);
router.get('/aluno/:id', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), reservaController.obterReservasDoAluno);
router.get('/:id', authMiddleware, reservaController.obterDetalhesReserva);

router.post('/', authMiddleware, perfilMiddleware(["FUNCIONARIO", "ALUNO"]), reservaController.criarReserva);

router.patch('/:id/estado', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), reservaController.atualizarEstadoReserva);
router.patch('/:id/linhas/:idLinha/estado', authMiddleware, perfilMiddleware(['FUNCIONARIO', 'ADMIN']), reservaController.atualizarEstadoLinhaReserva);
router.patch('/mine/:id/cancelar', authMiddleware, perfilMiddleware('ALUNO'), reservaController.cancelarReserva);


/////////////////////////////////////////////////////////////////////////////////
////////////////////////////// ROTAS DA CHECKLIST /////////////////////&/////////
/////////////////////////////////////////////////////////////////////////////////

router.get('/:id/checklists', authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), checklistController.obterChecklistReserva);
router.post('/:id/checklists', authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), checklistController.criarChecklist);



module.exports = router;