/**
* ------------------------------------------------------------------------
* File: marketplaceService.js
* Author: Tiago Gonçalves
* Date: 2026-04-20
* Version: 1.0
* Description:
* Serviço responsável pela lógica de negócio do marketplace
* Arquitetura: Route -> Controller -> Service -> Database
* ------------------------------------------------------------------------
*/

// Importar Prisma Client
const { PrismaClient } = require("@prisma/client");

// Instanciar cliente Prisma
const prisma = new PrismaClient();

const obterEstadoAnuncioPorNome = async (nomeEstado) => {
  return prisma.estado_anuncio.findFirst({
    where: {
      nome: {
        equals: nomeEstado,
        mode: "insensitive",
      },
    },
  });
};

const obterAnuncioMarketplacePorId = async (id) => {
  return prisma.anuncio_marketplace.findUnique({
    where: { id },
    include: {
      categoria: true,
      tipo_figurino: true,
      sexo: true,
      estado_anuncio: true,
      utilizador: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  });
};

const criarAnuncioMarketplace = async ({ titulo, descricao, tamanho, id_categoria, id_tipo, id_sexo, id_utilizador }) => {
  const estadoSubmetido = await obterEstadoAnuncioPorNome("Submetido");

  if (!estadoSubmetido) {
    const err = new Error("Estado 'Submetido' nao encontrado.");
    err.code = "ESTADO_SUBMETIDO_NAO_ENCONTRADO";
    throw err;
  }

  const max = await prisma.anuncio_marketplace.aggregate({
    _max: { id: true },
  });

  const novoId = (max._max.id || 0) + 1;

  return prisma.anuncio_marketplace.create({
    data: {
      id: novoId,
      titulo,
      descricao,
      tamanho,
      dataanuncio: new Date(),
      dataaprovacao: null,
      motivorejeicao: null,
      id_categoria,
      id_tipo,
      id_sexo,
      id_estado: estadoSubmetido.id,
      id_utilizador,
    },
  });
};

const obterAnunciosMarketplace = async () => {
  return prisma.anuncio_marketplace.findMany({
    orderBy: { id: "desc" },
    include: {
      categoria: true,
      tipo_figurino: true,
      sexo: true,
      estado_anuncio: true,
      utilizador: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  });
};

const obterAnunciosMarketplacePorUtilizador = async (idUtilizador) => {
  return prisma.anuncio_marketplace.findMany({
    where: { id_utilizador: idUtilizador },
    orderBy: { id: "desc" },
    include: {
      categoria: true,
      tipo_figurino: true,
      sexo: true,
      estado_anuncio: true,
    },
  });
};

const atualizarAnuncioMarketplace = async (id, idUtilizador, dados) => {
  const anuncio = await prisma.anuncio_marketplace.findUnique({ where: { id } });

  if (!anuncio) {
    const err = new Error("Anuncio nao encontrado.");
    err.code = "P2025";
    throw err;
  }

  if (anuncio.id_utilizador !== idUtilizador) {
    const err = new Error("Nao tens permissao para editar este anuncio.");
    err.code = "FORBIDDEN_OWNER";
    throw err;
  }

  const estadoSubmetido = await obterEstadoAnuncioPorNome("Submetido");
  if (!estadoSubmetido || anuncio.id_estado !== estadoSubmetido.id) {
    const err = new Error("Apenas anuncios submetidos podem ser editados.");
    err.code = "ANUNCIO_NAO_PENDENTE";
    throw err;
  }

  return prisma.anuncio_marketplace.update({
    where: { id },
    data: {
      ...dados,
      dataaprovacao: null,
      motivorejeicao: null,
    },
  });
};

const atualizarEstadoAnuncioMarketplace = async (id, aprovado, motivorejeicao) => {
  const anuncio = await prisma.anuncio_marketplace.findUnique({ where: { id } });

  if (!anuncio) {
    const err = new Error("Anuncio nao encontrado.");
    err.code = "P2025";
    throw err;
  }

  const estadoSubmetido = await obterEstadoAnuncioPorNome("Submetido");
  if (!estadoSubmetido || anuncio.id_estado !== estadoSubmetido.id) {
    const err = new Error("Apenas anuncios submetidos podem ser aprovados/rejeitados.");
    err.code = "ANUNCIO_NAO_PENDENTE";
    throw err;
  }

  if (aprovado) {
    const estadoPublicado = await obterEstadoAnuncioPorNome("Publicado");
    if (!estadoPublicado) {
      const err = new Error("Estado 'Publicado' nao encontrado.");
      err.code = "ESTADO_APROVADO_NAO_ENCONTRADO";
      throw err;
    }

    return prisma.anuncio_marketplace.update({
      where: { id },
      data: {
        id_estado: estadoPublicado.id,
        dataaprovacao: new Date(),
        motivorejeicao: null,
      },
    });
  }

  const estadoRejeitado = await obterEstadoAnuncioPorNome("Rejeitado");
  if (!estadoRejeitado) {
    const err = new Error("Estado 'Rejeitado' nao encontrado.");
    err.code = "ESTADO_REJEITADO_NAO_ENCONTRADO";
    throw err;
  }

  return prisma.anuncio_marketplace.update({
    where: { id },
    data: {
      id_estado: estadoRejeitado.id,
      dataaprovacao: null,
      motivorejeicao,
    },
  });
};

const eliminarAnuncioMarketplace = async (id, idUtilizador) => {
  const anuncio = await prisma.anuncio_marketplace.findUnique({ where: { id } });

  if (!anuncio) {
    const err = new Error("Anuncio nao encontrado.");
    err.code = "P2025";
    throw err;
  }

  if (anuncio.id_utilizador !== idUtilizador) {
    const err = new Error("Nao tens permissao para eliminar este anuncio.");
    err.code = "FORBIDDEN_OWNER";
    throw err;
  }

  const estadoArquivado = await obterEstadoAnuncioPorNome("Arquivado");
  if (!estadoArquivado) {
    const err = new Error("Estado 'Arquivado' nao encontrado.");
    err.code = "ESTADO_ARQUIVADO_NAO_ENCONTRADO";
    throw err;
  }

  if (anuncio.id_estado === estadoArquivado.id) {
    const err = new Error("Anuncio ja se encontra arquivado.");
    err.code = "ANUNCIO_JA_ARQUIVADO";
    throw err;
  }

  return prisma.anuncio_marketplace.update({
    where: { id },
    data: {
      id_estado: estadoArquivado.id,
    },
  });
};

// EXPORTAR FUNCOES
module.exports = {
  criarAnuncioMarketplace,
  obterAnunciosMarketplace,
  obterAnunciosMarketplacePorUtilizador,
  obterAnuncioMarketplacePorId,
  atualizarAnuncioMarketplace,
  atualizarEstadoAnuncioMarketplace,
  eliminarAnuncioMarketplace,
};
