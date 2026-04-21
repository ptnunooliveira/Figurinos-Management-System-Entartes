/**
 * ------------------------------------------------------------
 * File: figurinoController.js
 * Author: Ricardo
 * Date: 2026-04-11
 * Version: 1.0
 * 
 * Description:
 * Controller responsável por gerir as operações relacionadas
 * com figurinos. Recebe os pedidos HTTP das routes e delega
 * a lógica de negócio ao service.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const figurinoService = require('../services/figurinoService.js');


// Obter todos os figurinos
const obterTodosFigurinos = async (req, res) => {

    try {

        const figurinos = await figurinoService.obterTodosFigurinos();

        if (figurinos.length === 0) {
            return res.status(200).json({ mensagem: "Sem figurinos." });
        }

        return res.status(200).json(figurinos);

    } catch (erro) {

        console.error("Erro ao obter figurinos:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


// Obter figurino por ID
const obterFigurino = async (req, res) => {

    try {

        const idFigurino = parseInt(req.params.id);

        if (isNaN(idFigurino)) {
            return res.status(400).json({ erro: "O ID do figurino tem que ser um número válido." });
        }

        const figurino = await figurinoService.obterFigurino(idFigurino);

        if (!figurino) {
            return res.status(404).json({ erro: "Figurino não encontrado." });
        }

        return res.status(200).json(figurino);

    } catch (erro) {

        console.error("Erro ao obter figurino:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


// Criar figurino
const criarFigurino = async (req, res) => {

    try {

        const {
            id,
            descricao,
            tamanho,
            localizacao,
            id_categoria,
            id_tipo,
            id_sexo,
            id_estado_figurino
        } = req.body;

        // Como o schema NÃO tem autoincrement no figurino.id,
        // o id tem de ser enviado manualmente.
        if (id === undefined || id === null || isNaN(parseInt(id))) {
            return res.status(400).json({ erro: "O campo 'id' é obrigatório e tem que ser numérico." });
        }

        const dadosFigurino = {
            id: parseInt(id),
            descricao: descricao ?? null,
            tamanho: tamanho ?? null,
            localizacao: localizacao ?? null,
            id_categoria: id_categoria !== undefined && id_categoria !== null ? parseInt(id_categoria) : null,
            id_tipo: id_tipo !== undefined && id_tipo !== null ? parseInt(id_tipo) : null,
            id_sexo: id_sexo !== undefined && id_sexo !== null ? parseInt(id_sexo) : null,
            id_estado_figurino: id_estado_figurino !== undefined && id_estado_figurino !== null ? parseInt(id_estado_figurino) : null
        };

        const novoFigurino = await figurinoService.criarFigurino(dadosFigurino);

        return res.status(201).json(novoFigurino);

    } catch (erro) {

        console.error("Erro ao criar figurino:", erro);

        if (erro.code === 'P2002') {
            return res.status(409).json({ erro: "Já existe um figurino com esse ID." });
        }

        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


// Atualizar figurino
const atualizarFigurino = async (req, res) => {

    try {

        const idFigurino = parseInt(req.params.id);

        if (isNaN(idFigurino)) {
            return res.status(400).json({ erro: "O ID do figurino tem que ser um número válido." });
        }

        const figurinoExistente = await figurinoService.obterFigurino(idFigurino);

        if (!figurinoExistente) {
            return res.status(404).json({ erro: "Figurino não encontrado." });
        }

        const {
            descricao,
            tamanho,
            localizacao,
            id_categoria,
            id_tipo,
            id_sexo,
            id_estado_figurino
        } = req.body;

        const dadosFigurino = {};

        if (descricao !== undefined) dadosFigurino.descricao = descricao;
        if (tamanho !== undefined) dadosFigurino.tamanho = tamanho;
        if (localizacao !== undefined) dadosFigurino.localizacao = localizacao;
        if (id_categoria !== undefined) dadosFigurino.id_categoria = id_categoria === null ? null : parseInt(id_categoria);
        if (id_tipo !== undefined) dadosFigurino.id_tipo = id_tipo === null ? null : parseInt(id_tipo);
        if (id_sexo !== undefined) dadosFigurino.id_sexo = id_sexo === null ? null : parseInt(id_sexo);
        if (id_estado_figurino !== undefined) dadosFigurino.id_estado_figurino = id_estado_figurino === null ? null : parseInt(id_estado_figurino);

        if (Object.keys(dadosFigurino).length === 0) {
            return res.status(400).json({ erro: "Não foram enviados dados para atualizar." });
        }

        const figurinoAtualizado = await figurinoService.atualizarFigurino(idFigurino, dadosFigurino);

        return res.status(200).json(figurinoAtualizado);

    } catch (erro) {

        console.error("Erro ao atualizar figurino:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


// Obter disponibilidade do figurino
const obterDisponibilidadeFigurino = async (req, res) => {

    try {

        const idFigurino = parseInt(req.params.id);

        if (isNaN(idFigurino)) {
            return res.status(400).json({ erro: "O ID do figurino tem que ser um número válido." });
        }

        const disponibilidade = await figurinoService.obterDisponibilidadeFigurino(idFigurino);

        if (!disponibilidade) {
            return res.status(404).json({ erro: "Figurino não encontrado." });
        }

        return res.status(200).json(disponibilidade);

    } catch (erro) {

        console.error("Erro ao obter disponibilidade do figurino:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


module.exports = {
    obterTodosFigurinos,
    obterFigurino,
    criarFigurino,
    atualizarFigurino,
    obterDisponibilidadeFigurino
};