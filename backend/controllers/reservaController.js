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



/////////////////////////////////////////////////////////////////////////////////
//                                  GET                                        //
/////////////////////////////////////////////////////////////////////////////////


// Função do controller responsável por obter todas as reservas
const obterTodasReservas = async (req, res) => {

    try {

        const { estado, ordem } = req.query;

        const filtros = {
            estado: estado,
            ordenarPorData: ordem
        };

        // Chama o método do service // "await" aguarda a resposta da operação
        const reservas = await reservaService.obterTodasReservas(filtros);

        return res.status(200).json(reservas);

    } catch (erro) {

        console.error("Erro no controller de reservas:", erro);
        return res.status(500).json({ erro: "Ocorreu um erro ao processar o pedido das reservas." });
    }
};


// Função do controller responsável por obter as reservas do próprio utilizador
const obterReservasDoUtilizador = async (req, res) => {

    try {

        const { estado, ordem } = req.query;

        const filtros = {

            estado: estado,
            ordenarPorData: ordem
        };

        const reservas = await reservaService.obterReservasDoUtilizador(req.user.id, filtros);

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
const obterReservaPorID = async (req, res) => {

    try {

        const idReserva = parseInt(req.params.id);
        if (isNaN(idReserva)) {

            return res.status(400).json({ erro: "O ID da Reserva tem que ser um número válido." });
        }

        const reserva = await reservaService.obterReservaPorID(idReserva);
        if (!reserva) {

            return res.status(404).json({ erro: "Reserva não encontrada." });
        }

        if (req.user.perfil !== 'FUNCIONARIO' && req.user.id !== reserva.id_utilizador) {

            return res.status(403).json({ erro: "Acesso negado. Não tens permissões para ver a reserva." });
        }

        return res.status(200).json(reserva);

    } catch (erro) {

        console.error("Erro ao obter detalhes da reserva:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


const obterDetalhesReserva = async (req, res) => {

    try{
        
        const idReserva = parseInt(req.params.id);
        if (isNaN(idReserva)) {

            return res.status(400).json({ erro: "O ID da Reserva tem que ser um número válido." });
        }

        const reservaDetalhada = await reservaService.obterDetalhesReserva(idReserva);
        if(!reservaDetalhada){

            return res.status(404).json({ erro: "Reserva não encontrada." });
        }

        if(req.user.perfil !== 'FUNCIONARIO' && req.user.id !== reserva.id_utilizador){

            return res.status(403).json({ erro: "Acesso negado. Sem permissões para visualizar esta reserva." });
        }

        return res.status(200).json(reservaDetalhada);

    } catch(erro){

        console.error("Erro ao obter detalhes da reserva:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


/////////////////////////////////////////////////////////////////////////////////
//                                  CREATE                                     //
/////////////////////////////////////////////////////////////////////////////////


const criarReserva = async (req, res) => {

    try{

        let idUtilizador = req.user.id;
        let idFuncionario = null;
        const dadosBody = req.body;

        if(req.user.perfil === 'FUNCIONARIO' || req.user.perfil === 'ADMIN'){

            idFuncionario = req.user.id;

            if(!dadosBody.id_aluno) {

                return res.status(400).json({ erro: "Pedido inválido. O Funcionário tem de enviar o ID do aluno no pedido." });
            }

            idUtilizador = parseInt(dadosBody.id_aluno);

            if (isNaN(idUtilizador)) {

                return res.status(400).json({ erro: "Pedido invÃ¡lido. O ID do aluno tem que ser um nÃºmero vÃ¡lido." });
            }
        }

        if(!dadosBody.linhas || dadosBody.linhas.length === 0){

            return res.status(400).json({ erro: "Pedido inválido. A reserva tem que conter pelo menos uma linha. "});
        }

        const novaReserva = await reservaService.criarReserva(idUtilizador, idFuncionario, dadosBody);
    
        return res.status(200).json(novaReserva);

    } catch(erro){
        
        console.log("Erro ao criar reserva.", erro);

        if (erro.status) {

            return res.status(erro.status).json({ erro: erro.message });
        }

        return res.status(500).json({ erro: "Erro interno ao processar a reserva." });
    }
};


/////////////////////////////////////////////////////////////////////////////////
//                                  UPDATE                                     //
/////////////////////////////////////////////////////////////////////////////////


const atualizarEstadoReserva = async (req, res) => {

    try{

        const dadosBody = req.body;
        const idReserva = parseInt(req.params.id);
        if(isNaN(idReserva)){

            return res.status(400).json({ erro: "O ID da Reserva tem que ser um número válido." });
        }

        const idFuncionario = req.user.id;

        if(!dadosBody || !dadosBody.id_estado){

                return res.status(400).json({ erro: "Pedido inválido. O Pedido tem de conter um novo estado. "});
            }


        if(req.user.perfil !== 'FUNCIONARIO' && req.user.perfil !== 'ADMIN'){

            return res.status(403).json({ erro: "Acesso negado. Sem permissões para editar esta Reserva." });
        }

        const reserva = await reservaService.atualizarEstadoReserva(idReserva, dadosBody.id_estado, idFuncionario);

        return res.status(200).json(reserva);

    } catch(erro){

        console.log("Erro ao editar a reserva", erro);

        if (erro.status) {

            return res.status(erro.status).json({ erro: erro.message });
        }

        return res.status(500).json({ erro: "Erro interno ao processar a atualização do estado da reserva." });
    }
};


const atualizarEstadoLinhaReserva = async (req, res) => {

    try {

        const idReserva = parseInt(req.params.id);
        const idLinha = parseInt(req.params.idLinha);
        const { id_estado } = req.body;

        if (isNaN(idReserva) || isNaN(idLinha)) {
            return res.status(400).json({ erro: "IDs inválidos." });
        }

        if (!id_estado) {
            return res.status(400).json({ erro: "O novo estado é obrigatório." });
        }

        const linhaAtualizada = await reservaService.atualizarEstadoLinhaReserva(idReserva, idLinha, id_estado, req.user.id);

        return res.status(200).json(linhaAtualizada);

    } catch (erro) {

        if (erro.status) {
            return res.status(erro.status).json({ erro: erro.message });
        }
        return res.status(500).json({ erro: "Erro interno ao processar a atualização da linha de reserva." });
    }
};


const cancelarReserva = async (req, res) => {

    try {

        const idUtilizador = req.user.id;
        const idReserva = parseInt(req.params.id);

        if(isNaN(idReserva)) {

            return res.status(400).json({ erro: "O ID da reserva inválido." });
        }

        const reservaCancelada = await reservaService.cancelarReserva(idReserva, idUtilizador);

        return res.status(200).json({ mensagem: "Reserva cancelada com sucesso.", reserva: reservaCancelada});

    } catch(erro){

        console.log("Erro ao editar a reserva", erro);

        if (erro.status === 400 || erro.status === 403) {
            return res.status(erro.status).json({ erro: erro.message });
        }
        if (erro.code === 'P2025') {
            return res.status(404).json({ erro: "Reserva não encontrada." });
        }

        return res.status(500).json({ erro: "Erro interno ao processar a atualização do estado da reserva." });
    }
};


module.exports = {
    obterTodasReservas,
    obterReservasDoUtilizador,
    obterReservasDoAluno,
    obterReservaPorID,
    obterDetalhesReserva,
    criarReserva,
    atualizarEstadoReserva,
    atualizarEstadoLinhaReserva,
    cancelarReserva
};
