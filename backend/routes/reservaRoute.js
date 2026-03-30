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
 * Arquitetura: Route -> Controller -> Service
 * ------------------------------------------------------------
 */

// Importa o módulo Express para criar rotas
const express = require('express');
// Cria um objeto router do Express para definir as rotas
const router = express.Router();
// Importa o controlador das reservas
const reservaController = require('../controllers/reservaController.js');

// Define a rota GET para o caminho raiz "/"
router.get('/', reservaController.listarReservas);  

module.exports = router;