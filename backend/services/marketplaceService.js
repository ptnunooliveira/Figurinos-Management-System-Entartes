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

const formatarData = (valor) => {
  if (!valor) {
    return null;
  }

  return valor.toISOString().slice(0, 10);
};

const obterResumoAprovacao = (estadoNome) => {
  const normalizado = typeof estadoNome === "string" ? estadoNome.toLowerCase() : "";

  if (normalizado === "publicado") {
    return { aprovado: true, situacao: "Aprovado" };
  }

  if (normalizado === "rejeitado") {
    return { aprovado: false, situacao: "Reprovado" };
  }

  return { aprovado: null, situacao: "Pendente" };
};

const mapearAnuncioMarketplace = (anuncio, opcoes = {}) => {
  const resposta = {
    id: anuncio.id,
    titulo: anuncio.titulo,
    dataanuncio: formatarData(anuncio.dataanuncio),
    dataaprovacao: formatarData(anuncio.dataaprovacao),
    descricao: anuncio.descricao,
    tamanho: anuncio.tamanho,
    categoria: anuncio.categoria?.nomecategoria ?? null,
    tipo_figurino: anuncio.tipo_figurino?.nome ?? null,
    sexo: anuncio.sexo?.nome ?? null,
    utilizador: anuncio.utilizador?.nome ?? null,
  };

  if (opcoes.incluirAprovacao) {
    const resumoAprovacao = obterResumoAprovacao(anuncio.estado_anuncio?.nome);
    resposta.situacao = resumoAprovacao.situacao;

    if (resumoAprovacao.aprovado === false) {
      delete resposta.dataaprovacao;
      resposta.motivorejeicao = anuncio.motivorejeicao ?? null;
    }
  }

  return resposta;
};

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
  const anuncio = await prisma.anuncio_marketplace.findUnique({
    where: { id },
    select: {
      id: true,
      titulo: true,
      dataanuncio: true,
      dataaprovacao: true,
      descricao: true,
      tamanho: true,
      categoria: {
        select: {
          nomecategoria: true,
        },
      },
      tipo_figurino: {
        select: {
          nome: true,
        },
      },
      sexo: {
        select: {
          nome: true,
        },
      },
      utilizador: {
        select: {
          nome: true,
        },
      },
    },
  });

  if (!anuncio) {
    return null;
  }

  return mapearAnuncioMarketplace(anuncio);
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
  const estadoPublicado = await obterEstadoAnuncioPorNome("Publicado");

  if (!estadoPublicado) {
    const err = new Error("Estado 'Publicado' nao encontrado.");
    err.code = "ESTADO_NAO_ENCONTRADO";
    throw err;
  }

  const anuncios = await prisma.anuncio_marketplace.findMany({
    where: {
      id_estado: estadoPublicado.id,
    },
    orderBy: { id: "desc" },
    select: {
      id: true,
      titulo: true,
      dataanuncio: true,
      dataaprovacao: true,
      descricao: true,
      tamanho: true,
      categoria: {
        select: {
          nomecategoria: true,
        },
      },
      tipo_figurino: {
        select: {
          nome: true,
        },
      },
      sexo: {
        select: {
          nome: true,
        },
      },
      utilizador: {
        select: {
          nome: true,
        },
      },
    },
  });

  return anuncios.map(mapearAnuncioMarketplace);
};

const obterAnunciosMarketplaceGestao = async (estadoNome) => {
  const where = {};

  if (estadoNome) {
    const estado = await obterEstadoAnuncioPorNome(estadoNome);

    if (!estado) {
      const err = new Error(`Estado '${estadoNome}' nao encontrado.`);
      err.code = "ESTADO_NAO_ENCONTRADO";
      throw err;
    }

    where.id_estado = estado.id;
  }

  const anuncios = await prisma.anuncio_marketplace.findMany({
    where,
    orderBy: { id: "desc" },
    select: {
      id: true,
      titulo: true,
      dataanuncio: true,
      dataaprovacao: true,
      descricao: true,
      tamanho: true,
      categoria: {
        select: {
          nomecategoria: true,
        },
      },
      tipo_figurino: {
        select: {
          nome: true,
        },
      },
      sexo: {
        select: {
          nome: true,
        },
      },
      utilizador: {
        select: {
          nome: true,
        },
      },
    },
  });

  return anuncios.map(mapearAnuncioMarketplace);
};

const obterAnunciosMarketplacePorUtilizador = async (idUtilizador) => {
  const anuncios = await prisma.anuncio_marketplace.findMany({
    where: { id_utilizador: idUtilizador },
    orderBy: { id: "desc" },
    select: {
      id: true,
      titulo: true,
      dataanuncio: true,
      dataaprovacao: true,
      descricao: true,
      tamanho: true,
      categoria: {
        select: {
          nomecategoria: true,
        },
      },
      tipo_figurino: {
        select: {
          nome: true,
        },
      },
      sexo: {
        select: {
          nome: true,
        },
      },
      estado_anuncio: {
        select: {
          nome: true,
        },
      },
      motivorejeicao: true,
      utilizador: {
        select: {
          nome: true,
        },
      },
    },
  });

  return anuncios.map((anuncio) => mapearAnuncioMarketplace(anuncio, { incluirAprovacao: true }));
};

const atualizarAnuncioMarketplace = async (id, idUtilizador, dados) => {
  const anuncio = await prisma.anuncio_marketplace.findUnique({ where: { id } });

  if (!anuncio) {
    const err = new Error("Anuncio nao encontrado.");
    err.code = "P2025";
    throw err;
  }

  const donoAnuncioId = Number(anuncio.id_utilizador);
  const utilizadorTokenId = Number(idUtilizador);

  if (!donoAnuncioId || !utilizadorTokenId || donoAnuncioId !== utilizadorTokenId) {
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

  await prisma.anuncio_marketplace.update({
    where: { id },
    data: {
      ...dados,
      dataaprovacao: null,
      motivorejeicao: null,
    },
  });

  return obterAnuncioMarketplacePorId(id);
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

    await prisma.anuncio_marketplace.update({
      where: { id },
      data: {
        id_estado: estadoPublicado.id,
        dataaprovacao: new Date(),
        motivorejeicao: null,
      },
    });

    return obterAnuncioMarketplacePorId(id);
  }

  const estadoRejeitado = await obterEstadoAnuncioPorNome("Rejeitado");
  if (!estadoRejeitado) {
    const err = new Error("Estado 'Rejeitado' nao encontrado.");
    err.code = "ESTADO_REJEITADO_NAO_ENCONTRADO";
    throw err;
  }

  await prisma.anuncio_marketplace.update({
    where: { id },
    data: {
      id_estado: estadoRejeitado.id,
      dataaprovacao: null,
      motivorejeicao,
    },
  });

  return obterAnuncioMarketplacePorId(id);
};

const eliminarAnuncioMarketplace = async (id, idUtilizador) => {
  const anuncio = await prisma.anuncio_marketplace.findUnique({ where: { id } });

  if (!anuncio) {
    const err = new Error("Anuncio nao encontrado.");
    err.code = "P2025";
    throw err;
  }

  const donoAnuncioId = Number(anuncio.id_utilizador);
  const utilizadorTokenId = Number(idUtilizador);

  if (!donoAnuncioId || !utilizadorTokenId || donoAnuncioId !== utilizadorTokenId) {
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

  await prisma.anuncio_marketplace.update({
    where: { id },
    data: {
      id_estado: estadoArquivado.id,
    },
  });

  return obterAnuncioMarketplacePorId(id);
};

// EXPORTAR FUNCOES
module.exports = {
  criarAnuncioMarketplace,
  obterAnunciosMarketplace,
  obterAnunciosMarketplaceGestao,
  obterAnunciosMarketplacePorUtilizador,
  obterAnuncioMarketplacePorId,
  atualizarAnuncioMarketplace,
  atualizarEstadoAnuncioMarketplace,
  eliminarAnuncioMarketplace,
};
