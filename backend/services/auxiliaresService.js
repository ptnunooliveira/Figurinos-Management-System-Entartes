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
  // Calcular proximo ID manualmente
  const max = await prisma.categoria.aggregate({
    _max: { id: true },
  });

  const novoId = (max._max.id || 0) + 1;

  return prisma.categoria.create({
    data: {
      id: novoId,
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

  // Calcular proximo ID manualmente
  const max = await prisma.tipo_figurino.aggregate({
    _max: { id: true },
  });

  const novoId = (max._max.id || 0) + 1;

  return prisma.tipo_figurino.create({
    data: {
      id: novoId,
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

  // Calcular proximo ID manualmente
  const max = await prisma.sexo.aggregate({
    _max: { id: true },
  });

  const novoId = (max._max.id || 0) + 1;

  return prisma.sexo.create({
    data: {
      id: novoId,
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

  // Calcular proximo ID manualmente
  const max = await prisma.acessorio.aggregate({
    _max: { id: true },
  });

  const novoId = (max._max.id || 0) + 1;

  return prisma.acessorio.create({
    data: {
      id: novoId,
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

  // Calcular proximo ID manualmente
  const max = await prisma.estado_condicao.aggregate({
    _max: { id: true },
  });

  const novoId = (max._max.id || 0) + 1;

  return prisma.estado_condicao.create({
    data: {
      id: novoId,
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

  // Calcular proximo ID manualmente
  const max = await prisma.estado_reserva.aggregate({
    _max: { id: true },
  });

  const novoId = (max._max.id || 0) + 1;

  return prisma.estado_reserva.create({
    data: {
      id: novoId,
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
};
