/**
 * ------------------------------------------------------------
 * File: contestacaoController.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.0
 * 
 * Description:
 * Controller responsável pelas operações relacionadas com
 * contestações.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const contestacaoService = require('../services/contestacaoService.js');
const propostaCobrancaService = require('../services/propostaCobrancaService.js');


// Obter todas as contestações
const obterTodasContestacoes = async (req, res) => {
    try {
        const contestacoes = await contestacaoService.obterTodasContestacoes();

        if (contestacoes.length === 0) {
            return res.status(200).json({ mensagem: 'Sem contestações.' });
        }

        return res.status(200).json(contestacoes);

    } catch (erro) {
        console.error('Erro ao obter contestações:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Obter contestação por ID
const obterContestacao = async (req, res) => {
    try {
        const idContestacao = parseInt(req.params.id);

        if (isNaN(idContestacao)) {
            return res.status(400).json({ erro: 'O ID da contestação tem que ser numérico.' });
        }

        const contestacao = await contestacaoService.obterContestacao(idContestacao);

        if (!contestacao) {
            return res.status(404).json({ erro: 'Contestação não encontrada.' });
        }

        return res.status(200).json(contestacao);

    } catch (erro) {
        console.error('Erro ao obter contestação:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Criar contestação
const criarContestacao = async (req, res) => {
    try {
        const {
            id_proposta_cobranca,
            descricao,
            valorcontraproposta,
            data
        } = req.body;

        if (id_proposta_cobranca === undefined || id_proposta_cobranca === null || isNaN(parseInt(id_proposta_cobranca))) {
            return res.status(400).json({ erro: "O campo 'id_proposta_cobranca' é obrigatório e tem que ser numérico." });
        }

        if (!descricao || descricao.trim() === '') {
            return res.status(400).json({ erro: "O campo 'descricao' é obrigatório." });
        }

        const proposta = await propostaCobrancaService.obterPropostaCobranca(parseInt(id_proposta_cobranca));

        if (!proposta) {
            return res.status(404).json({ erro: 'A proposta de cobrança indicada não existe.' });
        }

        const dadosContestacao = {
            id_proposta_cobranca: parseInt(id_proposta_cobranca),
            descricao: descricao.trim(),
            valorcontraproposta: valorcontraproposta !== undefined && valorcontraproposta !== null
                ? parseFloat(valorcontraproposta)
                : null,
            data: data ? new Date(data) : new Date(),
            id_utilizador: req.user.id
        };

        if (dadosContestacao.valorcontraproposta !== null && isNaN(dadosContestacao.valorcontraproposta)) {
            return res.status(400).json({ erro: "O campo 'valorcontraproposta' tem que ser numérico." });
        }

        const contestacao = await contestacaoService.criarContestacao(dadosContestacao);

        return res.status(201).json(contestacao);

    } catch (erro) {
        console.error('Erro ao criar contestação:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Obter contestações por proposta
const obterContestacoesPorProposta = async (req, res) => {
    try {
        const idProposta = parseInt(req.params.idProposta);

        if (isNaN(idProposta)) {
            return res.status(400).json({ erro: 'O ID da proposta tem que ser numérico.' });
        }

        const contestacoes = await contestacaoService.obterContestacoesPorProposta(idProposta);

        if (contestacoes.length === 0) {
            return res.status(200).json({ mensagem: 'Sem contestações para esta proposta.' });
        }

        return res.status(200).json(contestacoes);

    } catch (erro) {
        console.error('Erro ao obter contestações por proposta:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


module.exports = {
    obterTodasContestacoes,
    obterContestacao,
    criarContestacao,
    obterContestacoesPorProposta
};