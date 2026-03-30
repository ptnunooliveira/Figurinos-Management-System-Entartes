/**
 * ------------------------------------------------------------
 * File: reservaController.js
 * Author: Nuno Oliveira
 * Date: 2026-03-29
 * Version: 1.0
 * 
 * Description:
 * Controller responsável por gerir as operações relacionadas
 * com reservas. Recebe os pedidos HTTP das routes e delega
 * a lógica de negócio ao service.
 * Arquitetura: Route -> Controller -> Service
 * ------------------------------------------------------------
 */


// Importa o service responsável pela lógica de negócio das reservas
const reservaService = require('../services/reservaService.js');

// Função do controller responsável por listar todas as reservas
const listarReservas = async(req, res) => {

    try{

        // Chama o método do service // "await" aguarda a resposta da operação
        const reservas = await reservaService.obterTodasReservas();
        res.json(reservas);
    } catch (erro){

        console.error("Erro no controller de reservas:", erro);
        res.status(500).json({erro: "Ocorreu um erro ao processar o pedido das reservas."});
    }
};

module.exports = {
    listarReservas
};