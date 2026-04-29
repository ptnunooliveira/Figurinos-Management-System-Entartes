/**
 * ------------------------------------------------------------
 * File: propostaCobrancaController.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.0
 * 
 * Description:
 * Controller responsável pelas operações relacionadas com
 * propostas de cobrança.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const propostaCobrancaService = require('../services/propostaCobrancaService.js');


// Obter todas as propostas
const obterTodasPropostasCobranca = async (req, res) => {
    try {
        const propostas = await propostaCobrancaService.obterTodasPropostasCobranca();

        if (propostas.length === 0) {
            return res.status(200).json({ mensagem: 'Sem propostas de cobrança.' });
        }

        return res.status(200).json(propostas);

    } catch (erro) {
        console.error('Erro ao obter propostas de cobrança:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Obter proposta por ID
const obterPropostaCobranca = async (req, res) => {
    try {
        const idProposta = parseInt(req.params.id);

        if (isNaN(idProposta)) {
            return res.status(400).json({ erro: 'O ID da proposta de cobrança tem que ser numérico.' });
        }

        const proposta = await propostaCobrancaService.obterPropostaCobranca(idProposta);

        if (!proposta) {
            return res.status(404).json({ erro: 'Proposta de cobrança não encontrada.' });
        }

        return res.status(200).json(proposta);

    } catch (erro) {
        console.error('Erro ao obter proposta de cobrança:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Criar proposta de cobrança
const criarPropostaCobranca = async (req, res) => {
    try {
        const {
            id_ocorrencia,
            valor,
            dataproposta,
            id_estadopropostacobranca
        } = req.body;

        if (id_ocorrencia === undefined || id_ocorrencia === null || isNaN(parseInt(id_ocorrencia))) {
            return res.status(400).json({ erro: "O campo 'id_ocorrencia' é obrigatório e tem que ser numérico." });
        }

        if (valor === undefined || valor === null || isNaN(parseFloat(valor))) {
            return res.status(400).json({ erro: "O campo 'valor' é obrigatório e tem que ser numérico." });
        }

        // id_estadopropostacobranca é opcional; se não for indicado usa 1 (estado inicial)
        const idEstadoProposta =
            id_estadopropostacobranca !== undefined && id_estadopropostacobranca !== null && !isNaN(parseInt(id_estadopropostacobranca))
                ? parseInt(id_estadopropostacobranca)
                : 1;

        const dadosProposta = {
            id_ocorrencia: parseInt(id_ocorrencia),
            valor: parseFloat(valor),
            dataproposta: dataproposta ? new Date(dataproposta) : new Date(),
            id_estadopropostacobranca: idEstadoProposta
        };

        const proposta = await propostaCobrancaService.criarPropostaCobranca(dadosProposta);

        return res.status(201).json(proposta);

    } catch (erro) {
        console.error('Erro ao criar proposta de cobrança:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Atualizar estado da proposta
const atualizarEstadoPropostaCobranca = async (req, res) => {
    try {
        const idProposta = parseInt(req.params.id);
        const { id_estadopropostacobranca } = req.body;

        if (isNaN(idProposta)) {
            return res.status(400).json({ erro: 'O ID da proposta de cobrança tem que ser numérico.' });
        }

        if (id_estadopropostacobranca === undefined || id_estadopropostacobranca === null || isNaN(parseInt(id_estadopropostacobranca))) {
            return res.status(400).json({ erro: "O campo 'id_estadopropostacobranca' é obrigatório e tem que ser numérico." });
        }

        const propostaExistente = await propostaCobrancaService.obterPropostaCobranca(idProposta);

        if (!propostaExistente) {
            return res.status(404).json({ erro: 'Proposta de cobrança não encontrada.' });
        }

        const propostaAtualizada = await propostaCobrancaService.atualizarEstadoPropostaCobranca(
            idProposta,
            parseInt(id_estadopropostacobranca)
        );

        return res.status(200).json(propostaAtualizada);

    } catch (erro) {
        console.error('Erro ao atualizar estado da proposta de cobrança:', erro);
        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


// Finalizar proposta com lançamento em conta corrente
const finalizarPropostaEmContaCorrente = async (req, res) => {
    try {
        const idProposta = parseInt(req.params.id);
        const { id_tipo_movimento, id_estadopropostacobranca } = req.body;

        if (isNaN(idProposta)) {
            return res.status(400).json({ erro: 'O ID da proposta de cobrança tem que ser numérico.' });
        }

        if (id_tipo_movimento === undefined || id_tipo_movimento === null || isNaN(parseInt(id_tipo_movimento))) {
            return res.status(400).json({ erro: "O campo 'id_tipo_movimento' é obrigatório e tem que ser numérico." });
        }

        const resultado = await propostaCobrancaService.finalizarPropostaEmContaCorrente(idProposta, {
            id_tipo_movimento: parseInt(id_tipo_movimento),
            id_estadopropostacobranca: id_estadopropostacobranca !== undefined && id_estadopropostacobranca !== null
                ? parseInt(id_estadopropostacobranca)
                : null
        });

        if (!resultado) {
            return res.status(404).json({ erro: 'Proposta de cobrança não encontrada.' });
        }

        return res.status(201).json(resultado);

    } catch (erro) {
        console.error('Erro ao finalizar proposta em conta corrente:', erro);

        if (erro.statusCode) {
            return res.status(erro.statusCode).json({ erro: erro.message });
        }

        return res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
};


module.exports = {
    obterTodasPropostasCobranca,
    obterPropostaCobranca,
    criarPropostaCobranca,
    atualizarEstadoPropostaCobranca,
    finalizarPropostaEmContaCorrente
};