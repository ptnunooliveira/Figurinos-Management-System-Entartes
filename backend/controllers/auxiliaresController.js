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

//#region pesquisa/categorias

// GET /pesquisa/categorias
exports.getCategorias = async (req, res) => {
  try {
    const data = await service.obterCategorias();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar categorias" });
  }
};

// POST /pesquisa/categorias
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

// GET /pesquisa/categorias/:nome
exports.getCategoriaByNome = async (req, res) => {
  try {
    const nome = req.params.nome?.trim();

    if (!nome) {
      return res.status(400).json({ error: "Categoria não selecionada." });
    }

    const categoria = await service.obterCategoriaPorNome(nome);

    if (!categoria) {
      return res.status(404).json({ error: "Categoria não encontrada." });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar categoria." });
  }
};

//#endregion

//#region /pesquisa/tipos-figurino

// GET /pesquisa/tipos-figurino
exports.getTiposFigurino = async (req, res) => {
  try {
    const data = await service.obterTiposFigurino();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar tipos de figurino" });
  }
};

// POST /pesquisa/tipos-figurino
exports.createTipoFigurino = async (req, res) => {
  try {
    const { tipofigurino } = req.body;

    if (!tipofigurino || typeof tipofigurino !== "string" || !tipofigurino.trim()) {
      return res.status(400).json({ error: "Campo 'tipofigurino' é obrigatório." });
    }

    const nova = await service.criarTipoFigurino(tipofigurino.trim());
    return res.status(201).json(nova);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Esse tipo de figurino já existe." });
    }

    return res.status(500).json({ error: "Erro ao criar tipo de figurino." });
  }
};

// GET /pesquisa/tipos-figurino/:tipofigurino
exports.getTipoFigurinoByNome = async (req, res) => {
  try {
    const nome = req.params.tipofigurino?.trim();

    if (!nome) {
      return res.status(400).json({ error: "Tipo de figurino não selecionado." });
    }

    const tipo = await service.obterTipoFigurinoPorNome(nome);

    if (!tipo) {
      return res.status(404).json({ error: "Tipo de figurino não encontrado." });
    }

    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar tipo de figurino." });
  }
};

//#endregion /pesquisa/tipos-figurino

//#region /pesquisa/sexos

// GET /pesquisa/sexos
exports.getSexos = async (req, res) => {
  try {
    const data = await service.obterSexos();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar sexos" });
  }
};

// POST /pesquisa/sexos
exports.createSexo = async (req, res) => {
  try {
    const { genero } = req.body;

    if (!genero || typeof genero !== "string" || !genero.trim()) {
      return res.status(400).json({ error: "Campo 'genero' é obrigatório." });
    }

    const nova = await service.criarSexo(genero.trim());
    return res.status(201).json(nova);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Esse gênero já existe." });
    }

    return res.status(500).json({ error: "Erro ao criar gênero." });
  }
};

// GET /pesquisa/sexos/:genero
exports.getSexoByNome = async (req, res) => {
  try {
    const nome = req.params.genero?.trim();

    if (!nome) {
      return res.status(400).json({ error: "Gênero não selecionado." });
    }

    const tipo = await service.obterSexoPorNome(nome);

    if (!tipo) {
      return res.status(404).json({ error: "Gênero não encontrado." });
    }

    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar gênero." });
  }
};

//#endregion /pesquisa/sexos

//#region /pesquisa/acessorios

// GET /pesquisa/acessorios
exports.getAcessorios = async (req, res) => {
  try {
    const data = await service.obterAcessorios();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar acessórios" });
  }
};

// POST /pesquisa/acessorios
exports.createAcessorio = async (req, res) => {
  try {
    const { acessorio } = req.body;

    if (!acessorio || typeof acessorio !== "string" || !acessorio.trim()) {
      return res.status(400).json({ error: "Campo 'acessorio' é obrigatório." });
    }

    const nova = await service.criarAcessorio(acessorio.trim());
    return res.status(201).json(nova);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Esse acessório já existe." });
    }

    return res.status(500).json({ error: "Erro ao criar acessório." });
  }
};

// GET /pesquisa/acessorios/:nome
exports.getAcessorioByNome = async (req, res) => {
  try {
    const nome = req.params.nome?.trim();

    if (!nome) {
      return res.status(400).json({ error: "Acessório não selecionado." });
    }

    const tipo = await service.obterAcessorioPorNome(nome);

    if (!tipo) {
      return res.status(404).json({ error: "Acessório não encontrado." });
    }

    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar acessório." });
  }
};

//#endregion /pesquisa/acessorios

//#region /pesquisa/estados-condicao

// GET /pesquisa/estados-condicao
exports.getEstadosCondicao = async (req, res) => {
  try {
    const data = await service.obterEstadosCondicao();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar estados de condição" });
  }
};

// POST /pesquisa/estados-condicao
exports.createEstadoCondicao = async (req, res) => {
  try {
    const { estado_condicao } = req.body;

    if (!estado_condicao || typeof estado_condicao !== "string" || !estado_condicao.trim()) {
      return res.status(400).json({ error: "Campo 'estado_condicao' é obrigatório." });
    }

    const nova = await service.criarEstadoCondicao(estado_condicao.trim());
    return res.status(201).json(nova);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Esse estado de condição já existe." });
    }

    return res.status(500).json({ error: "Erro ao criar estado de condição." });
  }
};

// GET /pesquisa/estados-condicao/:nome
exports.getEstadoCondicaoByNome = async (req, res) => {
  try {
    const nome = req.params.nome?.trim();

    if (!nome) {
      return res.status(400).json({ error: "Estado de condição não selecionado." });
    }

    const tipo = await service.obterEstadoCondicaoPorNome(nome);

    if (!tipo) {
      return res.status(404).json({ error: "Estado de condição não encontrado." });
    }

    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar estado de condição." });
  }
};

//#endregion /pesquisa/estados-condicao
