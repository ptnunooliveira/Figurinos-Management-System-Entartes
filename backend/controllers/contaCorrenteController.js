/**
 * ------------------------------------------------------------
 * File: contaCorrenteController.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.0
 * 
 * Description:
 * Controller responsável pelas operações relacionadas com
 * conta corrente.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const contaCorrenteService = require('../services/contaCorrenteService.js');


// Obter todos os movimentos
const obterTodosMovimentosContaCorrente = async (req, res) => {
    try {
        const movimentos = await contaCorrenteService.obterTodosMovimentosContaCorrente();

        if (movimentos.length === 0) {
            return res.status(200).json({ mensagem: 'Sem movimentos de conta corrente.' });
        }

        return res.status(200).json(movimentos);

    } catch (erro) {
        console.error('Erro ao obter movimentos de conta corrente:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Obter movimento por ID
const obterMovimentoContaCorrente = async (req, res) => {
    try {
        const idMovimento = parseInt(req.params.id);

        if (isNaN(idMovimento)) {
            return res.status(400).json({ erro: 'O ID do movimento tem que ser numérico.' });
        }

        const movimento = await contaCorrenteService.obterMovimentoContaCorrente(idMovimento);

        if (!movimento) {
            return res.status(404).json({ erro: 'Movimento de conta corrente não encontrado.' });
        }

        return res.status(200).json(movimento);

    } catch (erro) {
        console.error('Erro ao obter movimento de conta corrente:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Obter conta corrente do utilizador autenticado
const obterMinhaContaCorrente = async (req, res) => {
    try {
        const idUtilizador = req.user.id;

        const contaCorrente = await contaCorrenteService.obterContaCorrentePorUtilizador(idUtilizador);

        return res.status(200).json(contaCorrente);

    } catch (erro) {
        console.error('Erro ao obter a minha conta corrente:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Obter conta corrente por utilizador
const obterContaCorrentePorUtilizador = async (req, res) => {
    try {
        const idUtilizador = parseInt(req.params.idUtilizador);

        if (isNaN(idUtilizador)) {
            return res.status(400).json({ erro: 'O ID do utilizador tem que ser numérico.' });
        }

        const contaCorrente = await contaCorrenteService.obterContaCorrentePorUtilizador(idUtilizador);

        return res.status(200).json(contaCorrente);

    } catch (erro) {
        console.error('Erro ao obter conta corrente por utilizador:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Marcar movimento como exportado
const marcarMovimentoComoExportado = async (req, res) => {
    try {
        const idMovimento = parseInt(req.params.id);

        if (isNaN(idMovimento)) {
            return res.status(400).json({ erro: 'O ID do movimento tem que ser numérico.' });
        }

        const movimentoExistente = await contaCorrenteService.obterMovimentoContaCorrente(idMovimento);

        if (!movimentoExistente) {
            return res.status(404).json({ erro: 'Movimento de conta corrente não encontrado.' });
        }

        const movimento = await contaCorrenteService.marcarMovimentoComoExportado(idMovimento);

        return res.status(200).json(movimento);

    } catch (erro) {
        console.error('Erro ao marcar movimento como exportado:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


module.exports = {
    obterTodosMovimentosContaCorrente,
    obterMovimentoContaCorrente,
    obterMinhaContaCorrente,
    obterContaCorrentePorUtilizador,
    marcarMovimentoComoExportado
};