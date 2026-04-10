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

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//#region categoria

const obterCategorias = async () => {
  return prisma.categoria.findMany({
    orderBy: { nomecategoria: "asc" },
  });
};

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

// auto incremento dentro da função
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

// // auto incremento alterado no schema.prisma
// const criarCategoria = async (nomecategoria) => {
//   // Evita nomes duplicados (case-insensitive)
//   const existente = await prisma.categoria.findFirst({
//     where: {
//       nomecategoria: {
//         equals: nomecategoria,
//         mode: "insensitive",
//       },
//     },
//   });

//   if (existente) {
//     const err = new Error("Categoria já existe");
//     err.code = "P2002";
//     throw err;
//   }

//   return prisma.categoria.create({
//     data: {
//       nomecategoria,
//     },
//   });
// };

const atualizarCategoria = async (id, nomecategoria) => {
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

const obterTiposFigurino = async () => {
  return prisma.tipo_figurino.findMany({
    orderBy: { nome: "asc" },
  });
};

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

const criarTipoFigurino = async (nome) => {
  const existente = await obterTipoFigurinoPorNome(nome);

  if (existente) {
    const err = new Error("Tipo de figurino já existe");
    err.code = "P2002";
    throw err;
  }

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

const atualizarTipoFigurino = async (id, nome) => {
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

const obterSexos = async () => {
  return prisma.sexo.findMany({
    orderBy: { nome: "asc" },
  });
};

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

const criarSexo = async (nome) => {
  const existente = await obterSexoPorNome(nome);

  if (existente) {
    const err = new Error("Genero já existe");
    err.code = "P2002";
    throw err;
  }

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

const atualizarSexo = async (id, nome) => {
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

const obterAcessorios = async () => {
  return prisma.acessorio.findMany({
    orderBy: { nome: "asc" },
  });
};

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

const criarAcessorio = async (nome) => {
  const existente = await obterAcessorioPorNome(nome);

  if (existente) {
    const err = new Error("Acessorio já existe");
    err.code = "P2002";
    throw err;
  }

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

const atualizarAcessorio = async (id, nome) => {
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

const obterEstadosCondicao = async () => {
  return prisma.estado_condicao.findMany({
    orderBy: { nome: "asc" },
  });
};

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

const criarEstadoCondicao = async (nome) => {
  const existente = await obterEstadoCondicaoPorNome(nome);

  if (existente) {
    const err = new Error("Estado de condicao já existe");
    err.code = "P2002";
    throw err;
  }

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

const atualizarEstadoCondicao = async (id, nome) => {
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
};
