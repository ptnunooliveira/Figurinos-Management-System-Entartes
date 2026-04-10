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
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */


// Importa o service responsável pela lógica de negócio das reservas
const reservaService = require('../services/reservaService.js');


// Função do controller responsável por obter todas as reservas
const obterTodasReservas = async (req, res) => {

    try {

        // Chama o método do service // "await" aguarda a resposta da operação
        const reservas = await reservaService.obterTodasReservas();
        res.json(reservas);

    } catch (erro) {

        console.error("Erro no controller de reservas:", erro);
        res.status(500).json({ erro: "Ocorreu um erro ao processar o pedido das reservas." });
    }
};


// Função do controller responsável por obter as reservas do próprio utilizador
const obterReservasDoUtilizador = async (req, res) => {

    try {

        const reservas = await reservaService.obterReservasDoUtilizador(req.user.id);

        if (reservas.length === 0) {

            return res.status(200).json({ mensagem: "Sem reservas." });
        }

        return res.status(200).json(reservas);

    } catch (erro) {

        console.error("Erro ao listar as reservas do utilizador:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


// Função do controller responsável por obter todas as reservas de um utilizador
const obterReservasDoAluno = async (req, res) => {

    try {

        const idAluno = parseInt(req.params.id);
        if (isNaN(idAluno)) {

            return res.status(400).json({ erro: "O ID do Aluno tem que ser um número válido." });
        }

        const reservas = await reservaService.obterReservasDoUtilizador(idAluno);
        if (reservas.length === 0) {

            return res.status(200).json({ mensagem: "Sem reservas." });
        }

        return res.status(200).json(reservas);
    }

    catch(erro){

        console.error("Erro ao obter detalhes da reserva:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


// Função do controller responsável por obter uma reserva específica
const obterReserva = async (req, res) => {

    try {

        const idReserva = parseInt(req.params.id);
        if (isNaN(idReserva)) {

            return res.status(400).json({ erro: "O ID do Aluno tem que ser um número válido." });
        }

        const reserva = await reservaService.obterReserva(idReserva);
        if (!reserva) {

            return res.status(404).json({ erro: "Reserva não encontrada." });
        }

        if (req.user.perfil !== 'FUNCIONARIO' && req.user.id !== reserva.id_utilizador) {

            return res.status(403).json({ erro: "Acesso negado. Não tens permissões para ver os detalhes da reserva." });
        }

        return res.status(200).json(reserva);

    } catch (erro) {

        console.error("Erro ao obter detalhes da reserva:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


module.exports = {
    obterTodasReservas,
    obterReservasDoUtilizador,
    obterReservasDoAluno,
    obterReserva
};