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

//auto incremento dentro da função
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
//     const max = await prisma.categoria.aggregate({
//     _max: { id: true },
//   });

//   const novoId = (max._max.id || 0) + 1;

//   return prisma.categoria.create({
//     data: {
//       id: novoId,
//       nomecategoria,
//     },
//   });
// };

// auto incremento alterado no schema.prisma
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

const obterTiposFigurino = async () => {
  return prisma.tipo_figurino.findMany({
    orderBy: { nome: "asc" },
  });
};

const obterSexos = async () => {
  return prisma.sexo.findMany();
};

const obterAcessorios = async () => {
  return prisma.acessorio.findMany({
    orderBy: { nome: "asc" },
  });
};

const obterEstadosCondicao = async () => {
  return prisma.estado_condicao.findMany();
};

module.exports = {
  obterCategorias,
  obterTiposFigurino,
  obterSexos,
  obterAcessorios,
  obterEstadosCondicao,
  obterCategoriaPorNome,
  criarCategoria,
};
