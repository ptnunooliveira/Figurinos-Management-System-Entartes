/**
 * ------------------------------------------------------------------------
 * File: auxiliaresController.js
 * Author: Tiago Gonçalves
 * Date: 2026-03-30
 * Version: 1.0
 * Description:
 * Controller para as tabelas auxiliares
 * ------------------------------------------------------------------------
 */

const service = require("../services/auxiliaresService");

//#region api/categorias

// GET /api/categorias
exports.getCategorias = async (req, res) => {
  try {
    const data = await service.obterCategorias();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar categorias" });
  }
};

// POST /api/categorias
exports.createCategoria = async (req, res) => {
  try {
    const { nomecategoria } = req.body;

    if (!nomecategoria || typeof nomecategoria !== "string" || !nomecategoria.trim()) {
      return res.status(400).json({ error: "Campo 'nomecategoria' é obrigatório." });
    }

    const nova = await service.criarCategoria(nomecategoria.trim());
    return res.status(201).json(nova);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Categoria já existe." });
    }

    return res.status(500).json({ error: "Erro ao criar categoria." });
  }
};

// GET /api/categorias/:nome
exports.getCategoriaByNome = async (req, res) => {
  try {
    const nome = req.params.nome?.trim();

    if (!nome) {
      return res.status(400).json({ error: "Parâmetro 'nome' é obrigatório." });
    }

    const categoria = await service.obterCategoriaPorNome(nome);

    if (!categoria) {
      return res.status(404).json({ error: "Categoria não encontrada." });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar categoria por nome." });
  }
};

//#endregion

//#region /api/tipos-figurino

// GET /api/tipos-figurino
exports.getTiposFigurino = async (req, res) => {
  try {
    const data = await service.obterTiposFigurino();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar tipos de figurino" });
  }
};

//#endregion /api/tipos-figurino

//#region /api/sexos

// GET /api/sexos
exports.getSexos = async (req, res) => {
  try {
    const data = await service.obterSexos();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar sexos" });
  }
};

//#endregion /api/sexos

//#region /api/acessorios

// GET /api/acessorios
exports.getAcessorios = async (req, res) => {
  try {
    const data = await service.obterAcessorios();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar acessórios" });
  }
};

//#endregion /api/acessorios

//#region /api/estados-condicao

// GET /api/estados-condicao
exports.getEstadosCondicao = async (req, res) => {
  try {
    const data = await service.obterEstadosCondicao();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar estados de condição" });
  }
};

//#endregion /api/estados-condicao