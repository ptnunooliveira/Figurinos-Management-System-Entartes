/**
 * ------------------------------------------------------------------------
 * File: auxiliaresController.js
 * Author: Tiago Goncalves
 * Date: 2026-03-30
 * Version: 1.0
 * Description:
 * Controller para as tabelas auxiliares
 * ------------------------------------------------------------------------
 */

const service = require("../services/auxiliaresService");

const parseId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizarNome = (...candidatos) => {
  for (const candidato of candidatos) {
    if (typeof candidato === "string") {
      const normalizado = candidato.trim().replace(/\s+/g, " ");
      if (normalizado) {
        return normalizado;
      }
    }
  }

  return null;
};

const responderErroEscrita = (res, error, mensagens) => {
  if (error.code === "P2002") {
    return res.status(409).json({ error: mensagens.duplicado });
  }

  if (error.code === "P2025") {
    return res.status(404).json({ error: mensagens.naoEncontrado });
  }

  return res.status(500).json({ error: mensagens.generico });
};

//#region pesquisa/categorias

// GET /pesquisa/categorias
exports.getCategorias = async (req, res) => {
  try {
    const data = await service.obterCategorias();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar categorias." });
  }
};

// POST /pesquisa/categorias
exports.createCategoria = async (req, res) => {
  try {
    const nomecategoria = normalizarNome(req.body.nomecategoria, req.body.nome);

    if (!nomecategoria) {
      return res.status(400).json({ error: "Campo 'nomecategoria' e obrigatorio." });
    }

    const nova = await service.criarCategoria(nomecategoria);
    return res.status(201).json(nova);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Categoria ja existe.",
      naoEncontrado: "Categoria nao encontrada.",
      generico: "Erro ao criar categoria.",
    });
  }
};

// PATCH /pesquisa/categorias/:id
exports.updateCategoria = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const nomecategoria = normalizarNome(req.body.nomecategoria, req.body.nome);

    if (!nomecategoria) {
      return res.status(400).json({ error: "Campo 'nomecategoria' e obrigatorio." });
    }

    const atualizada = await service.atualizarCategoria(id, nomecategoria);
    return res.status(200).json(atualizada);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Categoria ja existe.",
      naoEncontrado: "Categoria nao encontrada.",
      generico: "Erro ao atualizar categoria.",
    });
  }
};

// GET /pesquisa/categorias/:nome
exports.getCategoriaByNome = async (req, res) => {
  try {
    const nome = normalizarNome(req.params.nome);

    if (!nome) {
      return res.status(400).json({ error: "Categoria nao selecionada." });
    }

    const categoria = await service.obterCategoriaPorNome(nome);

    if (!categoria) {
      return res.status(404).json({ error: "Categoria nao encontrada." });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar categoria." });
  }
};

//#endregion

//#region pesquisa/tipos-figurino

// GET /pesquisa/tipos-figurino
exports.getTiposFigurino = async (req, res) => {
  try {
    const data = await service.obterTiposFigurino();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar tipos de figurino." });
  }
};

// POST /pesquisa/tipos-figurino
exports.createTipoFigurino = async (req, res) => {
  try {
    const nome = normalizarNome(req.body.nome, req.body.tipofigurino);

    if (!nome) {
      return res.status(400).json({ error: "Campo 'nome' e obrigatorio." });
    }

    const novo = await service.criarTipoFigurino(nome);
    return res.status(201).json(novo);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Tipo de figurino ja existe.",
      naoEncontrado: "Tipo de figurino nao encontrado.",
      generico: "Erro ao criar tipo de figurino.",
    });
  }
};

// PATCH /pesquisa/tipos-figurino/:id
exports.updateTipoFigurino = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const nome = normalizarNome(req.body.nome, req.body.tipofigurino);

    if (!nome) {
      return res.status(400).json({ error: "Campo 'nome' e obrigatorio." });
    }

    const atualizado = await service.atualizarTipoFigurino(id, nome);
    return res.status(200).json(atualizado);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Tipo de figurino ja existe.",
      naoEncontrado: "Tipo de figurino nao encontrado.",
      generico: "Erro ao atualizar tipo de figurino.",
    });
  }
};

// GET /pesquisa/tipos-figurino/:tipofigurino
exports.getTipoFigurinoByNome = async (req, res) => {
  try {
    const nome = normalizarNome(req.params.tipofigurino);

    if (!nome) {
      return res.status(400).json({ error: "Tipo de figurino nao selecionado." });
    }

    const tipo = await service.obterTipoFigurinoPorNome(nome);

    if (!tipo) {
      return res.status(404).json({ error: "Tipo de figurino nao encontrado." });
    }

    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar tipo de figurino." });
  }
};

//#endregion

//#region pesquisa/sexos

// GET /pesquisa/sexos
exports.getSexos = async (req, res) => {
  try {
    const data = await service.obterSexos();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar sexos." });
  }
};

// POST /pesquisa/sexos
exports.createSexo = async (req, res) => {
  try {
    const nome = normalizarNome(req.body.nome, req.body.genero);

    if (!nome) {
      return res.status(400).json({ error: "Campo 'nome' e obrigatorio." });
    }

    const novo = await service.criarSexo(nome);
    return res.status(201).json(novo);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Sexo ja existe.",
      naoEncontrado: "Sexo nao encontrado.",
      generico: "Erro ao criar sexo.",
    });
  }
};

// PATCH /pesquisa/sexos/:id
exports.updateSexo = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const nome = normalizarNome(req.body.nome, req.body.genero);

    if (!nome) {
      return res.status(400).json({ error: "Campo 'nome' e obrigatorio." });
    }

    const atualizado = await service.atualizarSexo(id, nome);
    return res.status(200).json(atualizado);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Sexo ja existe.",
      naoEncontrado: "Sexo nao encontrado.",
      generico: "Erro ao atualizar sexo.",
    });
  }
};

// GET /pesquisa/sexos/:genero
exports.getSexoByNome = async (req, res) => {
  try {
    const nome = normalizarNome(req.params.genero);

    if (!nome) {
      return res.status(400).json({ error: "Sexo nao selecionado." });
    }

    const tipo = await service.obterSexoPorNome(nome);

    if (!tipo) {
      return res.status(404).json({ error: "Sexo nao encontrado." });
    }

    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar sexo." });
  }
};

//#endregion

//#region pesquisa/acessorios

// GET /pesquisa/acessorios
exports.getAcessorios = async (req, res) => {
  try {
    const data = await service.obterAcessorios();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar acessorios." });
  }
};

// POST /pesquisa/acessorios
exports.createAcessorio = async (req, res) => {
  try {
    const nome = normalizarNome(req.body.nome, req.body.acessorio);

    if (!nome) {
      return res.status(400).json({ error: "Campo 'nome' e obrigatorio." });
    }

    const novo = await service.criarAcessorio(nome);
    return res.status(201).json(novo);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Acessorio ja existe.",
      naoEncontrado: "Acessorio nao encontrado.",
      generico: "Erro ao criar acessorio.",
    });
  }
};

// PATCH /pesquisa/acessorios/:id
exports.updateAcessorio = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const nome = normalizarNome(req.body.nome, req.body.acessorio);

    if (!nome) {
      return res.status(400).json({ error: "Campo 'nome' e obrigatorio." });
    }

    const atualizado = await service.atualizarAcessorio(id, nome);
    return res.status(200).json(atualizado);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Acessorio ja existe.",
      naoEncontrado: "Acessorio nao encontrado.",
      generico: "Erro ao atualizar acessorio.",
    });
  }
};

// GET /pesquisa/acessorios/:nome
exports.getAcessorioByNome = async (req, res) => {
  try {
    const nome = normalizarNome(req.params.nome);

    if (!nome) {
      return res.status(400).json({ error: "Acessorio nao selecionado." });
    }

    const tipo = await service.obterAcessorioPorNome(nome);

    if (!tipo) {
      return res.status(404).json({ error: "Acessorio nao encontrado." });
    }

    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar acessorio." });
  }
};

//#endregion

//#region pesquisa/estados-condicao

// GET /pesquisa/estados-condicao
exports.getEstadosCondicao = async (req, res) => {
  try {
    const data = await service.obterEstadosCondicao();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar estados de condicao." });
  }
};

// POST /pesquisa/estados-condicao
exports.createEstadoCondicao = async (req, res) => {
  try {
    const nome = normalizarNome(req.body.nome, req.body.estado_condicao);

    if (!nome) {
      return res.status(400).json({ error: "Campo 'nome' e obrigatorio." });
    }

    const novo = await service.criarEstadoCondicao(nome);
    return res.status(201).json(novo);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Estado de condicao ja existe.",
      naoEncontrado: "Estado de condicao nao encontrado.",
      generico: "Erro ao criar estado de condicao.",
    });
  }
};

// PATCH /pesquisa/estados-condicao/:id
exports.updateEstadoCondicao = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const nome = normalizarNome(req.body.nome, req.body.estado_condicao);

    if (!nome) {
      return res.status(400).json({ error: "Campo 'nome' e obrigatorio." });
    }

    const atualizado = await service.atualizarEstadoCondicao(id, nome);
    return res.status(200).json(atualizado);
  } catch (error) {
    return responderErroEscrita(res, error, {
      duplicado: "Estado de condicao ja existe.",
      naoEncontrado: "Estado de condicao nao encontrado.",
      generico: "Erro ao atualizar estado de condicao.",
    });
  }
};

// GET /pesquisa/estados-condicao/:nome
exports.getEstadoCondicaoByNome = async (req, res) => {
  try {
    const nome = normalizarNome(req.params.nome);

    if (!nome) {
      return res.status(400).json({ error: "Estado de condicao nao selecionado." });
    }

    const tipo = await service.obterEstadoCondicaoPorNome(nome);

    if (!tipo) {
      return res.status(404).json({ error: "Estado de condicao nao encontrado." });
    }

    return res.status(200).json(tipo);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar estado de condicao." });
  }
};

//#endregion
