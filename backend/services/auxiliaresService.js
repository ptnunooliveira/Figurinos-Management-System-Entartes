/**
 * ------------------------------------------------------------------------
 * File: auxiliaresService.js
 * Author: Tiago Gonçalves
 * Date: 2026-04-04
 * Version: 1.0
 * Description:
 * Service responsável pela lógica de acesso às tabelas auxiliares.
 * Arquitetura: Route -> Controller -> Service -> Database
 * ------------------------------------------------------------------------
 */

// Importar Prisma Client
const { PrismaClient } = require("@prisma/client");

// Instanciar cliente Prisma
const prisma = new PrismaClient();

//#region categoria

// Obter lista de categorias
const obterCategorias = async () => {
  return prisma.categoria.findMany({
    orderBy: { nomecategoria: "asc" },
  });
};

// Obter categoria por nome (case-insensitive)
const obterCategoriaPorNome = async (nome) => {
  return prisma.categoria.findFirst({
    where: {
      nomecategoria: {
        equals: nome,
        mode: "insensitive",
      },
    },
  });
};

// Criar nova categoria
const criarCategoria = async (nomecategoria) => {
  // Evita nomes duplicados (case-insensitive)
  const existente = await prisma.categoria.findFirst({
    where: {
      nomecategoria: {
        equals: nomecategoria,
        mode: "insensitive",
      },
    },
  });

  if (existente) {
    const err = new Error("Categoria já existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.categoria.create({
    data: {
      nomecategoria,
    },
  });
};

// Atualizar nome de categoria por ID
const atualizarCategoria = async (id, nomecategoria) => {
  // Verificar duplicado ignorando o proprio registo
  const existente = await prisma.categoria.findFirst({
    where: {
      nomecategoria: {
        equals: nomecategoria,
        mode: "insensitive",
      },
      NOT: { id },
    },
  });

  if (existente) {
    const err = new Error("Categoria ja existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.categoria.update({
    where: { id },
    data: { nomecategoria },
  });
};

//#endregion categoria

//#region tipo-figurino

// Obter lista de tipos de figurino
const obterTiposFigurino = async () => {
  return prisma.tipo_figurino.findMany({
    orderBy: { nome: "asc" },
  });
};

// Obter tipo de figurino por nome (case-insensitive)
const obterTipoFigurinoPorNome = async (nome) => {
  return prisma.tipo_figurino.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
  });
};

// Criar novo tipo de figurino
const criarTipoFigurino = async (nome) => {
  const existente = await obterTipoFigurinoPorNome(nome);

  if (existente) {
    const err = new Error("Tipo de figurino já existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.tipo_figurino.create({
    data: {
      nome,
    },
  });
};

// Atualizar nome de tipo de figurino por ID
const atualizarTipoFigurino = async (id, nome) => {
  // Verificar duplicado ignorando o proprio registo
  const existente = await prisma.tipo_figurino.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
      NOT: { id },
    },
  });

  if (existente) {
    const err = new Error("Tipo de figurino ja existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.tipo_figurino.update({
    where: { id },
    data: { nome },
  });
};

//#endregion tipo-figurino

//#region sexos

// Obter lista de sexos
const obterSexos = async () => {
  return prisma.sexo.findMany({
    orderBy: { nome: "asc" },
  });
};

// Obter sexo por nome (case-insensitive)
const obterSexoPorNome = async (nome) => {
  return prisma.sexo.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
  });
};

// Criar novo sexo
const criarSexo = async (nome) => {
  const existente = await obterSexoPorNome(nome);

  if (existente) {
    const err = new Error("Genero já existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.sexo.create({
    data: {
      nome,
    },
  });
};

// Atualizar nome de sexo por ID
const atualizarSexo = async (id, nome) => {
  // Verificar duplicado ignorando o proprio registo
  const existente = await prisma.sexo.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
      NOT: { id },
    },
  });

  if (existente) {
    const err = new Error("Sexo ja existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.sexo.update({
    where: { id },
    data: { nome },
  });
};

//#endregion sexos

//#region acessorios

// Obter lista de acessorios
const obterAcessorios = async () => {
  return prisma.acessorio.findMany({
    orderBy: { nome: "asc" },
  });
};

// Obter acessorio por nome (case-insensitive)
const obterAcessorioPorNome = async (nome) => {
  return prisma.acessorio.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
  });
};

// Criar novo acessorio
const criarAcessorio = async (nome) => {
  const existente = await obterAcessorioPorNome(nome);

  if (existente) {
    const err = new Error("Acessorio já existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.acessorio.create({
    data: {
      nome,
    },
  });
};

// Atualizar nome de acessorio por ID
const atualizarAcessorio = async (id, nome) => {
  // Verificar duplicado ignorando o proprio registo
  const existente = await prisma.acessorio.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
      NOT: { id },
    },
  });

  if (existente) {
    const err = new Error("Acessorio ja existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.acessorio.update({
    where: { id },
    data: { nome },
  });
};

//#endregion acessorios

//#region estados-condicao

// Obter lista de estados de condicao
const obterEstadosCondicao = async () => {
  return prisma.estado_condicao.findMany({
    orderBy: { nome: "asc" },
  });
};

// Obter estado de condicao por nome (case-insensitive)
const obterEstadoCondicaoPorNome = async (nome) => {
  return prisma.estado_condicao.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
  });
};

// Criar novo estado de condicao
const criarEstadoCondicao = async (nome) => {
  const existente = await obterEstadoCondicaoPorNome(nome);

  if (existente) {
    const err = new Error("Estado de condicao já existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.estado_condicao.create({
    data: {
      nome,
    },
  });
};

// Atualizar nome de estado de condicao por ID
const atualizarEstadoCondicao = async (id, nome) => {
  // Verificar duplicado ignorando o proprio registo
  const existente = await prisma.estado_condicao.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
      NOT: { id },
    },
  });

  if (existente) {
    const err = new Error("Estado de condicao ja existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.estado_condicao.update({
    where: { id },
    data: { nome },
  });
};

//#endregion estados-condicao

//#region estados-reserva

// Obter lista de estados de reserva
const obterEstadosReserva = async () => {
  return prisma.estado_reserva.findMany({
    orderBy: { nome: "asc" },
  });
};

// Obter estado de reserva por nome (case-insensitive)
const obterEstadoReservaPorNome = async (nome) => {
  return prisma.estado_reserva.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
  });
};

// Criar novo estado de reserva
const criarEstadoReserva = async (nome) => {
  const existente = await obterEstadoReservaPorNome(nome);

  if (existente) {
    const err = new Error("Estado de reserva ja existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.estado_reserva.create({
    data: {
      nome,
    },
  });
};

// Atualizar nome de estado de reserva por ID
const atualizarEstadoReserva = async (id, nome) => {
  // Verificar duplicado ignorando o proprio registo
  const existente = await prisma.estado_reserva.findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
      NOT: { id },
    },
  });

  if (existente) {
    const err = new Error("Estado de reserva ja existe");
    err.code = "P2002";
    throw err;
  }

  return prisma.estado_reserva.update({
    where: { id },
    data: { nome },
  });
};


//#endregion

//#region auxiliares em falta AB#89

// Adicionado Nelson em 21-04-2026: obter lista ordenada por nome para auxiliares em falta.
const obterAuxiliarPorModelo = async (modelo) => {
  return prisma[modelo].findMany({
    orderBy: { nome: "asc" },
  });
};

// Adicionado Nelson em 21-04-2026: procurar auxiliar por nome ignorando maiusculas/minusculas.
const obterAuxiliarPorNome = async (modelo, nome) => {
  return prisma[modelo].findFirst({
    where: {
      nome: {
        equals: nome,
        mode: "insensitive",
      },
    },
  });
};

// Adicionado Nelson em 21-04-2026: validar duplicados para auxiliares em falta.
const validarAuxiliarDuplicado = async (modelo, nome, idIgnorado) => {
  const where = {
    nome: {
      equals: nome,
      mode: "insensitive",
    },
  };

  if (idIgnorado) {
    where.NOT = { id: idIgnorado };
  }

  const existente = await prisma[modelo].findFirst({ where });

  if (existente) {
    const err = new Error("Registo ja existe");
    err.code = "P2002";
    throw err;
  }
};

// Adicionado Nelson em 21-04-2026: calcular proximo ID para tabelas sem autoincrement.
const obterProximoIdAuxiliar = async (modelo) => {
  const max = await prisma[modelo].aggregate({
    _max: { id: true },
  });

  return (max._max.id || 0) + 1;
};

// Adicionado Nelson em 21-04-2026: criar registo auxiliar com campo nome.
const criarAuxiliarPorModelo = async (modelo, nome) => {
  await validarAuxiliarDuplicado(modelo, nome);
  const novoId = await obterProximoIdAuxiliar(modelo);

  return prisma[modelo].create({
    data: {
      id: novoId,
      nome,
    },
  });
};

// Adicionado Nelson em 21-04-2026: atualizar registo auxiliar com campo nome.
const atualizarAuxiliarPorModelo = async (modelo, id, nome) => {
  await validarAuxiliarDuplicado(modelo, nome, id);

  return prisma[modelo].update({
    where: { id },
    data: { nome },
  });
};

// Adicionado Nelson em 21-04-2026: funcoes para estado_anuncio.
const obterEstadosAnuncio = async () => obterAuxiliarPorModelo("estado_anuncio");
const obterEstadoAnuncioPorNome = async (nome) => obterAuxiliarPorNome("estado_anuncio", nome);
const criarEstadoAnuncio = async (nome) => criarAuxiliarPorModelo("estado_anuncio", nome);
const atualizarEstadoAnuncio = async (id, nome) => atualizarAuxiliarPorModelo("estado_anuncio", id, nome);

// Adicionado Nelson em 21-04-2026: funcoes para tipo_checklist.
const obterTiposChecklist = async () => obterAuxiliarPorModelo("tipo_checklist");
const obterTipoChecklistPorNome = async (nome) => obterAuxiliarPorNome("tipo_checklist", nome);
const criarTipoChecklist = async (nome) => criarAuxiliarPorModelo("tipo_checklist", nome);
const atualizarTipoChecklist = async (id, nome) => atualizarAuxiliarPorModelo("tipo_checklist", id, nome);

// Adicionado Nelson em 21-04-2026: funcoes para estado_ocorrencia.
const obterEstadosOcorrencia = async () => obterAuxiliarPorModelo("estado_ocorrencia");
const obterEstadoOcorrenciaPorNome = async (nome) => obterAuxiliarPorNome("estado_ocorrencia", nome);
const criarEstadoOcorrencia = async (nome) => criarAuxiliarPorModelo("estado_ocorrencia", nome);
const atualizarEstadoOcorrencia = async (id, nome) => atualizarAuxiliarPorModelo("estado_ocorrencia", id, nome);

// Adicionado Nelson em 21-04-2026: funcoes para estadopropostacobranca.
const obterEstadosPropostaCobranca = async () => obterAuxiliarPorModelo("estadopropostacobranca");
const obterEstadoPropostaCobrancaPorNome = async (nome) => obterAuxiliarPorNome("estadopropostacobranca", nome);
const criarEstadoPropostaCobranca = async (nome) => criarAuxiliarPorModelo("estadopropostacobranca", nome);
const atualizarEstadoPropostaCobranca = async (id, nome) => atualizarAuxiliarPorModelo("estadopropostacobranca", id, nome);

// Adicionado Nelson em 21-04-2026: funcoes para tipo_movimento_contacorrente.
const obterTiposMovimentoContaCorrente = async () => obterAuxiliarPorModelo("tipo_movimento_contacorrente");
const obterTipoMovimentoContaCorrentePorNome = async (nome) => obterAuxiliarPorNome("tipo_movimento_contacorrente", nome);
const criarTipoMovimentoContaCorrente = async (nome) => criarAuxiliarPorModelo("tipo_movimento_contacorrente", nome);
const atualizarTipoMovimentoContaCorrente = async (id, nome) => atualizarAuxiliarPorModelo("tipo_movimento_contacorrente", id, nome);

//#endregion

// EXPORTAR FUNCOES
module.exports = {
  obterCategorias,
  obterCategoriaPorNome,
  criarCategoria,
  atualizarCategoria,
  obterTiposFigurino,
  obterTipoFigurinoPorNome,
  criarTipoFigurino,
  atualizarTipoFigurino,
  obterSexos,
  obterSexoPorNome,
  criarSexo,
  atualizarSexo,
  obterAcessorios,
  obterAcessorioPorNome,
  criarAcessorio,
  atualizarAcessorio,
  obterEstadosCondicao,
  obterEstadoCondicaoPorNome,
  criarEstadoCondicao,
  atualizarEstadoCondicao,
  obterEstadosReserva,
  obterEstadoReservaPorNome,
  criarEstadoReserva,
  atualizarEstadoReserva,
  obterEstadosAnuncio,
  obterEstadoAnuncioPorNome,
  criarEstadoAnuncio,
  atualizarEstadoAnuncio,
  obterTiposChecklist,
  obterTipoChecklistPorNome,
  criarTipoChecklist,
  atualizarTipoChecklist,
  obterEstadosOcorrencia,
  obterEstadoOcorrenciaPorNome,
  criarEstadoOcorrencia,
  atualizarEstadoOcorrencia,
  obterEstadosPropostaCobranca,
  obterEstadoPropostaCobrancaPorNome,
  criarEstadoPropostaCobranca,
  atualizarEstadoPropostaCobranca,
  obterTiposMovimentoContaCorrente,
  obterTipoMovimentoContaCorrentePorNome,
  criarTipoMovimentoContaCorrente,
  atualizarTipoMovimentoContaCorrente,
};
