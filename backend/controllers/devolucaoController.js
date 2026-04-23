/**
 * ------------------------------------------------------------------------
 * File: devolucaoController.js
 * Author: Marina Silva
 * Date: 2026-04-18
 * Version: 1.0
 * Description:
 * Controller para as rotas de devolucao, ocorrencia e orcamento.
 * ------------------------------------------------------------------------
 */

const service = require("../services/devolucaoService");

const parseId = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// Valida uma string de data: deve ser parseable e não pode ser futura (para datas de entrega/devolucao)
const parseDataPassada = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  if (d > new Date()) return null;
  return d;
};

// Valida qualquer data (passada ou futura)
const parseData = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const responderErro = (res, error) => {
  if (error.code === "NOT_FOUND") {
    return res.status(404).json({ error: error.message });
  }
  if (error.code === "CONFLICT") {
    return res.status(409).json({ error: error.message });
  }
  if (error.code === "INVALID_TYPE") {
    return res.status(422).json({ error: error.message });
  }
  if (error.code === "MISSING_DEVOLUCAO") {
    return res.status(422).json({ error: error.message });
  }
  if (error.code === "NO_DAMAGE") {
    return res.status(422).json({ error: error.message });
  }
  if (error.code === "P2025") {
    return res.status(404).json({ error: "Registo nao encontrado." });
  }
  return res.status(500).json({ error: "Erro interno do servidor." });
};

//#region devolucoes

// GET /devolucoes
exports.getDevolucoes = async (req, res) => {
  try {
    const data = await service.obterDevolucoes();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar devolucoes." });
  }
};

// GET /devolucoes/:id
exports.getDevolucaoById = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const devolucao = await service.obterDevolucaoPorId(id);
    if (!devolucao) {
      return res.status(404).json({ error: "Devolucao nao encontrada." });
    }

    return res.status(200).json(devolucao);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar devolucao." });
  }
};

// POST /devolucoes
exports.createDevolucao = async (req, res) => {
  try {
    const { id_linha_reserva, id_checklist, datadevolucao } = req.body;

    if (!id_linha_reserva || !id_checklist) {
      return res.status(400).json({ error: "Campos 'id_linha_reserva' e 'id_checklist' sao obrigatorios." });
    }

    const idLinhaReserva = parseId(id_linha_reserva);
    const idChecklist = parseId(id_checklist);

    if (!idLinhaReserva || !idChecklist) {
      return res.status(400).json({ error: "Os campos 'id_linha_reserva' e 'id_checklist' devem ser numeros inteiros positivos." });
    }

    // datadevolucao é opcional; se fornecida tem de ser válida e não futura
    if (datadevolucao !== undefined && datadevolucao !== null && datadevolucao !== "") {
      if (!parseDataPassada(datadevolucao)) {
        return res.status(400).json({ error: "Campo 'datadevolucao' invalido. Deve ser uma data valida nao futura (ex: '2026-04-18')." });
      }
    }

    const nova = await service.criarDevolucao({
      id_linha_reserva: idLinhaReserva,
      id_checklist: idChecklist,
      datadevolucao: datadevolucao || undefined,
    });

    return res.status(201).json(nova);
  } catch (error) {
    return responderErro(res, error);
  }
};

//#endregion devolucoes

//#region ocorrencias

// GET /ocorrencias
exports.getOcorrencias = async (req, res) => {
  try {
    const data = await service.obterOcorrencias();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar ocorrencias." });
  }
};

// GET /ocorrencias/:id
exports.getOcorrenciaById = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const ocorrencia = await service.obterOcorrenciaPorId(id);
    if (!ocorrencia) {
      return res.status(404).json({ error: "Ocorrencia nao encontrada." });
    }

    return res.status(200).json(ocorrencia);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar ocorrencia." });
  }
};

// POST /ocorrencias
exports.createOcorrencia = async (req, res) => {
  try {
    const { descricao, valor, id_linha_reserva, id_estado } = req.body;

    if (!id_linha_reserva) {
      return res.status(400).json({ error: "Campo 'id_linha_reserva' e obrigatorio." });
    }

    const descricaoTrimmed = typeof descricao === "string" ? descricao.trim() : "";
    if (!descricaoTrimmed) {
      return res.status(400).json({ error: "Campo 'descricao' e obrigatorio e nao pode ser vazio." });
    }

    const idLinhaReserva = parseId(id_linha_reserva);
    if (!idLinhaReserva) {
      return res.status(400).json({ error: "Campo 'id_linha_reserva' deve ser um numero inteiro positivo." });
    }

    const idEstado = id_estado ? parseId(id_estado) : null;
    if (id_estado && !idEstado) {
      return res.status(400).json({ error: "Campo 'id_estado' deve ser um numero inteiro positivo." });
    }

    if (valor !== undefined && valor !== null) {
      const valorNum = Number(valor);
      if (isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: "Campo 'valor' deve ser um numero positivo." });
      }
    }

    const nova = await service.criarOcorrencia({
      descricao: descricaoTrimmed,
      valor: valor != null ? Number(valor) : null,
      id_linha_reserva: idLinhaReserva,
      id_estado: idEstado,
    });

    return res.status(201).json(nova);
  } catch (error) {
    return responderErro(res, error);
  }
};

// PATCH /ocorrencias/:id/estado
exports.updateEstadoOcorrencia = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const { id_estado } = req.body;
    if (!id_estado) {
      return res.status(400).json({ error: "Campo 'id_estado' e obrigatorio." });
    }

    const idEstado = parseId(id_estado);
    if (!idEstado) {
      return res.status(400).json({ error: "Campo 'id_estado' deve ser um numero inteiro positivo." });
    }

    const atualizada = await service.atualizarEstadoOcorrencia(id, idEstado);
    return res.status(200).json(atualizada);
  } catch (error) {
    return responderErro(res, error);
  }
};

//#endregion ocorrencias

//#region orcamentos

// GET /ocorrencias/:id/orcamentos
exports.getOrcamentosByOcorrencia = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const ocorrencia = await service.obterOcorrenciaPorId(id);
    if (!ocorrencia) {
      return res.status(404).json({ error: "Ocorrencia nao encontrada." });
    }

    const data = await service.obterOrcamentosPorOcorrencia(id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao procurar orcamentos." });
  }
};

// POST /ocorrencias/:id/orcamentos
exports.createOrcamento = async (req, res) => {
  try {
    const id_ocorrencia = parseId(req.params.id);
    if (!id_ocorrencia) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const { fornecedor, descricao, valor, dataorcamento } = req.body;

    const fornecedorTrimmed = typeof fornecedor === "string" ? fornecedor.trim() : "";
    if (!fornecedorTrimmed) {
      return res.status(400).json({ error: "Campo 'fornecedor' e obrigatorio e nao pode ser vazio." });
    }

    // descricao é opcional mas, se enviada, não pode ser string vazia
    const descricaoTrimmed = typeof descricao === "string" ? descricao.trim() : null;
    if (typeof descricao === "string" && !descricaoTrimmed) {
      return res.status(400).json({ error: "Campo 'descricao' nao pode ser uma string vazia." });
    }

    if (valor !== undefined && valor !== null) {
      const valorNum = Number(valor);
      if (isNaN(valorNum) || valorNum <= 0) {
        return res.status(400).json({ error: "Campo 'valor' deve ser um numero positivo." });
      }
    }

    // dataorcamento é opcional; se fornecida tem de ser uma data válida
    if (dataorcamento !== undefined && dataorcamento !== null && dataorcamento !== "") {
      if (!parseData(dataorcamento)) {
        return res.status(400).json({ error: "Campo 'dataorcamento' invalido. Deve ser uma data valida (ex: '2026-04-18')." });
      }
    }

    const novo = await service.criarOrcamento({
      id_ocorrencia,
      fornecedor: fornecedorTrimmed,
      descricao: descricaoTrimmed,
      valor: valor != null ? Number(valor) : null,
      dataorcamento: dataorcamento || undefined,
    });

    return res.status(201).json(novo);
  } catch (error) {
    return responderErro(res, error);
  }
};

// PATCH /orcamentos/:id/aprovar
exports.updateAprovacaoOrcamento = async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "Parametro 'id' invalido." });
    }

    const { aprovado } = req.body;
    if (typeof aprovado !== "boolean") {
      return res.status(400).json({ error: "Campo 'aprovado' e obrigatorio e deve ser true ou false." });
    }

    const atualizado = await service.atualizarAprovacaoOrcamento(id, aprovado);
    return res.status(200).json(atualizado);
  } catch (error) {
    return responderErro(res, error);
  }
};

//#endregion orcamentos
