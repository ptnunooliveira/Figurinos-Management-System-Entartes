/**
 * ------------------------------------------------------------------------
 * File: devolucaoService.js
 * Author: Marina Silva
 * Date: 2026-04-18
 * Version: 1.0
 * Description:
 * Service responsável pela lógica de acesso às tabelas devolucao,
 * ocorrencia e orcamento.
 * Arquitetura: Route -> Controller -> Service -> Database
 * ------------------------------------------------------------------------
 */

const prisma = require("../prisma/client");

//#region devolucoes

// Listar todas as devoluções
const obterDevolucoes = async () => {
  return prisma.devolucao.findMany({
    include: {
      linha_reserva: true,
      checklist: true,
    },
    orderBy: { id: "desc" },
  });
};

// Obter devolução por ID
const obterDevolucaoPorId = async (id) => {
  return prisma.devolucao.findUnique({
    where: { id },
    include: {
      linha_reserva: true,
      checklist: {
        include: { checklist_item: true },
      },
    },
  });
};

// Compara o estado do figurino da linha_reserva entre a checklist de levantamento e a de devolução.
// Retorna true se o id_estado da devolução for superior (condição pior) ao do levantamento.
const figurinoTemDanoPorComparacao = async (id_linha_reserva, id_checklist_devolucao) => {
  const linhaReserva = await prisma.linha_reserva.findUnique({
    where: { id: id_linha_reserva },
    include: { anuncio_escola: true },
  });
  if (!linhaReserva) return false;

  const idfigurino = linhaReserva.anuncio_escola?.id_figurino;
  if (!idfigurino) return false;

  const checklistLevantamento = await prisma.checklist.findFirst({
    where: { id_reserva: linhaReserva.id_reserva, id_tipo_checklist: 1 },
    include: { checklist_item: { where: { idfigurino } } },
  });

  const itemLevantamento = checklistLevantamento?.checklist_item[0];

  const itemDevolucao = await prisma.checklist_item.findFirst({
    where: { id_checklist: id_checklist_devolucao, idfigurino },
  });
  if (!itemDevolucao) return false;

  if (!itemLevantamento) {
    // Sem checklist de levantamento: compara com o estado atual do figurino em BD
    const figurino = await prisma.figurino.findUnique({
      where: { id: idfigurino },
      select: { id_estado_figurino: true },
    });
    if (figurino?.id_estado_figurino == null) return false;
    return (itemDevolucao.id_estado ?? 0) > figurino.id_estado_figurino;
  }

  return (itemDevolucao.id_estado ?? 0) > (itemLevantamento.id_estado ?? 0);
};

// Criar nova devolução
// Oficializa a entrega de uma linha_reserva e liga-a à checklist de entrada.
// Se o estado do figurino piorou face ao levantamento, cria automaticamente uma ocorrência.
const criarDevolucao = async ({ id_linha_reserva, id_checklist, datadevolucao }) => {
  // Verificar se a linha_reserva existe (inclui anuncio para obter o figurino)
  const linhaReserva = await prisma.linha_reserva.findUnique({
    where: { id: id_linha_reserva },
    include: { anuncio_escola: true },
  });
  if (!linhaReserva) {
    const err = new Error("Linha de reserva nao encontrada.");
    err.code = "NOT_FOUND";
    throw err;
  }

  // Verificar se a checklist existe e incluir o tipo
  const checklist = await prisma.checklist.findUnique({
    where: { id: id_checklist },
    include: { tipo_checklist: true },
  });
  if (!checklist) {
    const err = new Error("Checklist nao encontrada.");
    err.code = "NOT_FOUND";
    throw err;
  }

  // Validar que o tipo da checklist é Devolução (id 2) // do tipo Devolução
  if (checklist.id_tipo_checklist !== 2) {
    const err = new Error(
      `Tipo de checklist invalido ('${checklist.tipo_checklist?.nome ?? "?"}'). So e permitido usar uma checklist do tipo Devolucao.`
    );
    err.code = "INVALID_TYPE";
    throw err;
  }

  // Validar que a checklist pertence à mesma reserva que a linha_reserva
  if (checklist.id_reserva !== linhaReserva.id_reserva) {
    const err = new Error(
      "A checklist nao pertence a mesma reserva que a linha de reserva indicada."
    );
    err.code = "INVALID_TYPE";
    throw err;
  }

  // Verificar se já existe devolução para esta linha_reserva
  const existente = await prisma.devolucao.findFirst({
    where: { id_linha_reserva },
  });
  if (existente) {
    const err = new Error("Ja existe uma devolucao registada para esta linha de reserva.");
    err.code = "CONFLICT";
    throw err;
  }

  const devolucao = await prisma.devolucao.create({
    data: {
      datadevolucao: datadevolucao ? new Date(datadevolucao) : new Date(),
      id_linha_reserva,
      id_checklist,
    },
    include: {
      linha_reserva: true,
      checklist: true,
    },
  });

  // Comparar estado do figurino: se piorou face ao levantamento, cria ocorrência automaticamente
  let ocorrencia = null;
  const temDano = await figurinoTemDanoPorComparacao(id_linha_reserva, id_checklist);
  if (temDano) {
    ocorrencia = await prisma.ocorrencia.create({
      data: {
        descricao: "Figurino devolvido com estado de condicao inferior ao registado no levantamento.",
        valor: null,
        dataregisto: new Date(),
        id_estado: 1,
        id_linha_reserva,
      },
      include: {
        estado_ocorrencia: true,
        linha_reserva: true,
      },
    });
  }

  return { ...devolucao, ocorrencia };
};

//#endregion devolucoes

//#region ocorrencias

// Listar todas as ocorrências
const obterOcorrencias = async () => {
  return prisma.ocorrencia.findMany({
    include: {
      estado_ocorrencia: true,
      linha_reserva: true,
    },
    orderBy: { id: "desc" },
  });
};

// Obter ocorrência por ID
const obterOcorrenciaPorId = async (id) => {
  return prisma.ocorrencia.findUnique({
    where: { id },
    include: {
      estado_ocorrencia: true,
      linha_reserva: true,
      orcamento: true,
    },
  });
};

// Criar nova ocorrência (incidente de dano)
const criarOcorrencia = async ({ descricao, valor, id_linha_reserva, id_estado }) => {
  // Verificar se a linha_reserva existe
  const linhaReserva = await prisma.linha_reserva.findUnique({
    where: { id: id_linha_reserva },
  });
  if (!linhaReserva) {
    const err = new Error("Linha de reserva nao encontrada.");
    err.code = "NOT_FOUND";
    throw err;
  }

  // Verificar que existe uma devolução registada para esta linha_reserva
  const devolucao = await prisma.devolucao.findFirst({
    where: { id_linha_reserva },
  });
  if (!devolucao) {
    const err = new Error(
      "Nao existe devolucao registada para esta linha de reserva. Registe primeiro a devolucao."
    );
    err.code = "MISSING_DEVOLUCAO";
    throw err;
  }

  // Verificar que o estado do figurino piorou face ao levantamento
  const temDano = await figurinoTemDanoPorComparacao(id_linha_reserva, devolucao.id_checklist);
  if (!temDano) {
    const err = new Error(
      "O estado do figurino na devolucao nao e inferior ao registado no levantamento. Nao e possivel criar uma ocorrencia."
    );
    err.code = "NO_DAMAGE";
    throw err;
  }

  // Se id_estado fornecido, verificar se existe
  if (id_estado) {
    const estado = await prisma.estado_ocorrencia.findUnique({
      where: { id: id_estado },
    });
    if (!estado) {
      const err = new Error("Estado de ocorrencia nao encontrado.");
      err.code = "NOT_FOUND";
      throw err;
    }
  }

  return prisma.ocorrencia.create({
    data: {
      descricao,
      valor: valor ?? null,
      dataregisto: new Date(),
      id_estado: id_estado ?? 1,
      id_linha_reserva,
    },
    include: {
      estado_ocorrencia: true,
      linha_reserva: true,
    },
  });
};

// Atualizar estado de uma ocorrência
const atualizarEstadoOcorrencia = async (id, id_estado) => {
  const estado = await prisma.estado_ocorrencia.findUnique({
    where: { id: id_estado },
  });
  if (!estado) {
    const err = new Error("Estado de ocorrencia nao encontrado.");
    err.code = "NOT_FOUND";
    throw err;
  }

  return prisma.ocorrencia.update({
    where: { id },
    data: { id_estado },
    include: {
      estado_ocorrencia: true,
      linha_reserva: true,
    },
  });
};

//#endregion ocorrencias

//#region orcamentos

// Listar orçamentos de uma ocorrência
const obterOrcamentosPorOcorrencia = async (id_ocorrencia) => {
  return prisma.orcamento.findMany({
    where: { id_ocorrencia },
    orderBy: { id: "desc" },
  });
};

// Criar orçamento para uma ocorrência (pedido à costureira/fornecedor)
const criarOrcamento = async ({ id_ocorrencia, fornecedor, descricao, valor, dataorcamento }) => {
  // Verificar se a ocorrência existe
  const ocorrencia = await prisma.ocorrencia.findUnique({
    where: { id: id_ocorrencia },
  });
  if (!ocorrencia) {
    const err = new Error("Ocorrencia nao encontrada.");
    err.code = "NOT_FOUND";
    throw err;
  }

  return prisma.orcamento.create({
    data: {
      id_ocorrencia,
      fornecedor: fornecedor ?? null,
      descricao: descricao ?? null,
      valor: valor ?? null,
      dataorcamento: dataorcamento ? new Date(dataorcamento) : new Date(),
      aprovado: null,
    },
  });
};

// Aprovar ou rejeitar um orçamento
const atualizarAprovacaoOrcamento = async (id, aprovado) => {
  return prisma.orcamento.update({
    where: { id },
    data: { aprovado },
  });
};

//#endregion orcamentos

module.exports = {
  obterDevolucoes,
  obterDevolucaoPorId,
  criarDevolucao,
  obterOcorrencias,
  obterOcorrenciaPorId,
  criarOcorrencia,
  atualizarEstadoOcorrencia,
  obterOrcamentosPorOcorrencia,
  criarOrcamento,
  atualizarAprovacaoOrcamento,
};
