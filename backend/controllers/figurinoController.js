/**
 * ------------------------------------------------------------
 * File: figurinoController.js
 * Author: Ricardo
 * Date: 2026-04-11
 * Version: 2.0
 * 
 * Description:
 * Controller responsável por gerir as operações relacionadas
 * com figurinos. Recebe os pedidos HTTP das routes e delega
 * a lógica de negócio ao service.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const figurinoService = require('../services/figurinoService.js');

// Adicionado Nelson em 20-04-2026: converte parametros/body para IDs inteiros positivos.
const parseId = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// Adicionado Nelson em 20-04-2026: controller do POST /figurinos/:id/acessorios.
const associarAcessorio = async (req, res) => {
    try {
        const idFigurino = parseId(req.params.id);
        const idAcessorio = parseId(req.body.id_acessorio ?? req.body.idAcessorio);

        if (!idFigurino) {
            return res.status(400).json({
                message: "Parametro id do figurino invalido."
            });
        }

        if (!idAcessorio) {
            return res.status(400).json({
                message: "Campo id_acessorio e obrigatorio e deve ser numerico."
            });
        }

        const associacao = await figurinoService.associarAcessorio(idFigurino, idAcessorio);

        return res.status(201).json({
            message: "Acessorio associado ao figurino com sucesso.",
            associacao
        });
    } catch (error) {
        if (error.code === "INVALID_ID") {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.code === "FIGURINO_NOT_FOUND") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.code === "ACESSORIO_NOT_FOUND") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.code === "ASSOCIATION_ALREADY_EXISTS" || error.code === "P2002") {
            return res.status(409).json({
                message: "Acessorio ja associado ao figurino."
            });
        }

        return res.status(500).json({
            message: "Erro ao associar acessorio ao figurino."
        });
    }
};

// Obter todos os figurinos
const obterTodosFigurinos = async (req, res) => {
    try {
        const filtros = {};

        if (req.query.descricao !== undefined) {
            filtros.descricao = req.query.descricao;
        }

        if (req.query.tamanho !== undefined) {
            filtros.tamanho = req.query.tamanho;
        }

        if (req.query.localizacao !== undefined) {
            filtros.localizacao = req.query.localizacao;
        }

        if (req.query.id_categoria !== undefined) {
            const idCategoria = parseInt(req.query.id_categoria);

            if (isNaN(idCategoria)) {
                return res.status(400).json({ erro: "O parâmetro 'id_categoria' tem que ser numérico." });
            }

            filtros.id_categoria = idCategoria;
        }

        if (req.query.id_tipo !== undefined) {
            const idTipo = parseInt(req.query.id_tipo);

            if (isNaN(idTipo)) {
                return res.status(400).json({ erro: "O parâmetro 'id_tipo' tem que ser numérico." });
            }

            filtros.id_tipo = idTipo;
        }

        if (req.query.id_sexo !== undefined) {
            const idSexo = parseInt(req.query.id_sexo);

            if (isNaN(idSexo)) {
                return res.status(400).json({ erro: "O parâmetro 'id_sexo' tem que ser numérico." });
            }

            filtros.id_sexo = idSexo;
        }

        if (req.query.id_estado_figurino !== undefined) {
            const idEstadoFigurino = parseInt(req.query.id_estado_figurino);

            if (isNaN(idEstadoFigurino)) {
                return res.status(400).json({ erro: "O parâmetro 'id_estado_figurino' tem que ser numérico." });
            }

            filtros.id_estado_figurino = idEstadoFigurino;
        }

        const figurinos = await figurinoService.obterTodosFigurinos(filtros);

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


// Obter histórico do figurino
const obterHistoricoFigurino = async (req, res) => {
    try {
        const idFigurino = parseInt(req.params.id);

        if (isNaN(idFigurino)) {
            return res.status(400).json({ erro: "O ID do figurino tem que ser um número válido." });
        }

        const historico = await figurinoService.obterHistoricoFigurino(idFigurino);

        if (!historico) {
            return res.status(404).json({ erro: "Figurino não encontrado." });
        }

        return res.status(200).json(historico);

    } catch (erro) {
        console.error("Erro ao obter histórico do figurino:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};


// Criar figurino
const criarFigurino = async (req, res) => {
    try {
        const {
            descricao,
            tamanho,
            localizacao,
            id_categoria,
            id_tipo,
            id_sexo,
            id_estado_figurino
        } = req.body;

        const dadosFigurino = {
            descricao: descricao ?? null,
            tamanho: tamanho ?? null,
            localizacao: localizacao ?? null,
            id_categoria: id_categoria !== undefined && id_categoria !== null ? parseInt(id_categoria) : null,
            id_tipo: id_tipo !== undefined && id_tipo !== null ? parseInt(id_tipo) : null,
            id_sexo: id_sexo !== undefined && id_sexo !== null ? parseInt(id_sexo) : null,
            id_estado_figurino: id_estado_figurino !== undefined && id_estado_figurino !== null ? parseInt(id_estado_figurino) : null
        };

        if (dadosFigurino.id_categoria !== null && isNaN(dadosFigurino.id_categoria)) {
            return res.status(400).json({ erro: "O campo 'id_categoria' tem que ser numérico." });
        }

        if (dadosFigurino.id_tipo !== null && isNaN(dadosFigurino.id_tipo)) {
            return res.status(400).json({ erro: "O campo 'id_tipo' tem que ser numérico." });
        }

        if (dadosFigurino.id_sexo !== null && isNaN(dadosFigurino.id_sexo)) {
            return res.status(400).json({ erro: "O campo 'id_sexo' tem que ser numérico." });
        }

        if (dadosFigurino.id_estado_figurino !== null && isNaN(dadosFigurino.id_estado_figurino)) {
            return res.status(400).json({ erro: "O campo 'id_estado_figurino' tem que ser numérico." });
        }

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

        if (dadosFigurino.id_categoria !== undefined && dadosFigurino.id_categoria !== null && isNaN(dadosFigurino.id_categoria)) {
            return res.status(400).json({ erro: "O campo 'id_categoria' tem que ser numérico." });
        }

        if (dadosFigurino.id_tipo !== undefined && dadosFigurino.id_tipo !== null && isNaN(dadosFigurino.id_tipo)) {
            return res.status(400).json({ erro: "O campo 'id_tipo' tem que ser numérico." });
        }

        if (dadosFigurino.id_sexo !== undefined && dadosFigurino.id_sexo !== null && isNaN(dadosFigurino.id_sexo)) {
            return res.status(400).json({ erro: "O campo 'id_sexo' tem que ser numérico." });
        }

        if (dadosFigurino.id_estado_figurino !== undefined && dadosFigurino.id_estado_figurino !== null && isNaN(dadosFigurino.id_estado_figurino)) {
            return res.status(400).json({ erro: "O campo 'id_estado_figurino' tem que ser numérico." });
        }

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
        const { dataInicio, dataFim } = req.query;

        if (isNaN(idFigurino)) {
            return res.status(400).json({ erro: "O ID do figurino tem que ser um número válido." });
        }

        if (!dataInicio || !dataFim) {
            return res.status(400).json({
                erro: "Os parâmetros 'dataInicio' e 'dataFim' são obrigatórios."
            });
        }

        const disponibilidade = await figurinoService.obterDisponibilidadeFigurino(
            idFigurino,
            dataInicio,
            dataFim
        );

        if (!disponibilidade) {
            return res.status(404).json({ erro: "Figurino não encontrado." });
        }

        return res.status(200).json(disponibilidade);

    } catch (erro) {
        console.error("Erro ao obter disponibilidade do figurino:", erro);

        if (erro.statusCode) {
            return res.status(erro.statusCode).json({ erro: erro.message });
        }

        return res.status(500).json({ erro: "Erro interno do servidor." });
    }
};

const desativarFigurino = async (req, res) => {
    try {
        const idFigurino = parseInt(req.params.id);
        if (isNaN(idFigurino)) {
            return res.status(400).json({ erro: "O ID do figurino tem que ser um número válido." });
        }

        const figurino = await figurinoService.desativarFigurino(idFigurino);
        return res.status(200).json(figurino);
    } catch (erro) {
        console.error("Erro ao desativar figurino:", erro);
        console.error("Stack:", erro.stack);
        console.error("Message:", erro.message);
        if (erro.status) {
            return res.status(erro.status).json({ erro: erro.message });
        }
        return res.status(500).json({ erro: erro.message || "Erro interno do servidor." });
    }
};

module.exports = {
    associarAcessorio,
    obterTodosFigurinos,
    obterFigurino,
    obterHistoricoFigurino,
    criarFigurino,
    atualizarFigurino,
    obterDisponibilidadeFigurino,
    desativarFigurino
};
