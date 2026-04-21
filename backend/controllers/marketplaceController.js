/**
* ------------------------------------------------------------------------
* File: marketplaceController.js
* Author: Tiago Gonçalves
* Date: 2026-04-20
* Version: 1.0
* Description:
* Controller para o marketplace
* ------------------------------------------------------------------------
*/

const service = require("../services/marketplaceService");

const parseId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const normalizarTexto = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const texto = value.trim().replace(/\s+/g, " ");
  return texto || null;
};

const mapearErro = (res, error, mensagemGenerica) => {
  if (error.code === "P2025") {
    return res.status(404).json({ error: error.message });
  }

  if (error.code === "ESTADO_NAO_ENCONTRADO") {
    return res.status(404).json({ error: error.message });
  }

  if (error.code === "FORBIDDEN_OWNER") {
    return res.status(403).json({ error: error.message });
  }

  if (
    error.code === "ANUNCIO_NAO_PENDENTE" ||
    error.code === "ESTADO_SUBMETIDO_NAO_ENCONTRADO" ||
    error.code === "ESTADO_APROVADO_NAO_ENCONTRADO" ||
    error.code === "ESTADO_REJEITADO_NAO_ENCONTRADO" ||
    error.code === "ESTADO_ARQUIVADO_NAO_ENCONTRADO" ||
    error.code === "ANUNCIO_JA_ARQUIVADO"
  ) {
    return res.status(409).json({ error: error.message });
  }

  return res.status(500).json({ error: mensagemGenerica });
};

// POST /marketplace
exports.newMarketplace = async (req, res) => {
  try {
    const titulo = normalizarTexto(req.body.titulo);
    const descricao = normalizarTexto(req.body.descricao);
    const tamanho = normalizarTexto(req.body.tamanho);
    const idCategoria = req.body.id_categoria == null ? null : parseId(req.body.id_categoria);
    const idTipo = req.body.id_tipo == null ? null : parseId(req.body.id_tipo);
    const idSexo = req.body.id_sexo == null ? null : parseId(req.body.id_sexo);

    if (!titulo || !descricao || !tamanho) {
      return res.status(400).json({ error: "Campos 'titulo', 'descricao' e 'tamanho' sao obrigatorios." });
    }

    if (req.body.id_categoria != null && !idCategoria) {
      return res.status(400).json({ error: "Campo 'id_categoria' invalido." });
    }

    if (req.body.id_tipo != null && !idTipo) {
      return res.status(400).json({ error: "Campo 'id_tipo' invalido." });
    }

    if (req.body.id_sexo != null && !idSexo) {
      return res.status(400).json({ error: "Campo 'id_sexo' invalido." });
    }

    const novo = await service.criarAnuncioMarketplace({
      titulo,
      descricao,
      tamanho,
      id_categoria: idCategoria,
      id_tipo: idTipo,
      id_sexo: idSexo,
      id_utilizador: req.user.id,
    });

    return res.status(201).json(novo);
  } catch (error) {
    return mapearErro(res, error, "Erro ao criar anuncio de marketplace.");
  }
};

// GET /marketplace
exports.getMarketplace = async (req, res) => {
  try {
    const data = await service.obterAnunciosMarketplace();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao obter anuncios de marketplace." });
  }
};

// GET /marketplace/gestao
exports.getMarketplaceGestao = async (req, res) => {
  try {
    const estado = req.query.estado === undefined ? null : normalizarTexto(req.query.estado);

    if (req.query.estado !== undefined && !estado) {
      return res.status(400).json({ error: "Query param 'estado' invalido." });
    }

    const data = await service.obterAnunciosMarketplaceGestao(estado);
    return res.status(200).json(data);
  } catch (error) {
    return mapearErro(res, error, "Erro ao obter anuncios de marketplace para gestao.");
  }
};

// GET /marketplace/:userid
exports.getMarketplaceById = async (req, res) => {
  try {
    const userId = parseId(req.params.userid);

    if (!userId) {
      return res.status(400).json({ error: "Parametro 'userid' invalido." });
    }

    const data = await service.obterAnunciosMarketplacePorUtilizador(userId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao obter anuncios do utilizador." });
  }
};

// PATCH /marketplace/:id
exports.editMarketplace = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const dados = {};
    if (req.body.titulo !== undefined) {
      dados.titulo = normalizarTexto(req.body.titulo);
      if (!dados.titulo) {
        return res.status(400).json({ error: "Campo 'titulo' invalido." });
      }
    }

    if (req.body.descricao !== undefined) {
      dados.descricao = normalizarTexto(req.body.descricao);
      if (!dados.descricao) {
        return res.status(400).json({ error: "Campo 'descricao' invalido." });
      }
    }

    if (req.body.tamanho !== undefined) {
      dados.tamanho = normalizarTexto(req.body.tamanho);
      if (!dados.tamanho) {
        return res.status(400).json({ error: "Campo 'tamanho' invalido." });
      }
    }

    if (req.body.id_categoria !== undefined) {
      dados.id_categoria = req.body.id_categoria === null ? null : parseId(req.body.id_categoria);
      if (req.body.id_categoria !== null && !dados.id_categoria) {
        return res.status(400).json({ error: "Campo 'id_categoria' invalido." });
      }
    }

    if (req.body.id_tipo !== undefined) {
      dados.id_tipo = req.body.id_tipo === null ? null : parseId(req.body.id_tipo);
      if (req.body.id_tipo !== null && !dados.id_tipo) {
        return res.status(400).json({ error: "Campo 'id_tipo' invalido." });
      }
    }

    if (req.body.id_sexo !== undefined) {
      dados.id_sexo = req.body.id_sexo === null ? null : parseId(req.body.id_sexo);
      if (req.body.id_sexo !== null && !dados.id_sexo) {
        return res.status(400).json({ error: "Campo 'id_sexo' invalido." });
      }
    }

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({ error: "Nenhum campo valido para atualizar." });
    }

    const atualizado = await service.atualizarAnuncioMarketplace(id, req.user.id, dados);
    return res.status(200).json(atualizado);
  } catch (error) {
    return mapearErro(res, error, "Erro ao atualizar anuncio de marketplace.");
  }
};

// PATCH /marketplace/:id/aprovar
exports.updateMarketplaceStatus = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const { aprovado } = req.body;
    const motivorejeicao = normalizarTexto(req.body.motivorejeicao);

    if (typeof aprovado !== "boolean") {
      return res.status(400).json({ error: "Campo 'aprovado' deve ser booleano." });
    }

    if (!aprovado && !motivorejeicao) {
      return res.status(400).json({ error: "Campo 'motivorejeicao' e obrigatorio ao rejeitar." });
    }

    const atualizado = await service.atualizarEstadoAnuncioMarketplace(
      id,
      aprovado,
      aprovado ? null : motivorejeicao
    );

    return res.status(200).json(atualizado);
  } catch (error) {
    return mapearErro(res, error, "Erro ao atualizar estado do anuncio.");
  }
};

// DELETE /marketplace/:id
exports.deleteMarketplace = async (req, res) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    await service.eliminarAnuncioMarketplace(id, req.user.id);
    return res.status(204).send();
  } catch (error) {
    return mapearErro(res, error, "Erro ao eliminar anuncio de marketplace.");
  }
};

module.exports = {
  newMarketplace: exports.newMarketplace,
  getMarketplace: exports.getMarketplace,
  getMarketplaceGestao: exports.getMarketplaceGestao,
  getMarketplaceById: exports.getMarketplaceById,
  editMarketplace: exports.editMarketplace,
  updateMarketplaceStatus: exports.updateMarketplaceStatus,
  deleteMarketplace: exports.deleteMarketplace,
};
