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
const prisma = require("../prisma/client");
const { uploadImagensAnuncio, listarImagensAnuncio, substituirImagensAnuncio } = require("../utils/marketplaceStorage");

const DIAS_PARA_RESSUBMISSAO = 3;
const DIAS_PARA_RENOVACAO = 30;

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

  if (normalizado === "pendenterenovacao" || normalizado === "pendente renovacao") {
    return { aprovado: null, situacao: "PendenteRenovacao" };
  }

  if (normalizado === "arquivado") {
    return { aprovado: null, situacao: "Arquivado" };
  }

  if (normalizado === "submetido") {
    return { aprovado: null, situacao: "Submetido" };
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
    estado_anuncio: anuncio.estado_anuncio?.nome ? { nome: anuncio.estado_anuncio.nome } : null,
    imagens: [],
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

const obterEstadoAnuncioPorNomes = async (nomesEstado) => {
  for (const nome of nomesEstado) {
    const estado = await obterEstadoAnuncioPorNome(nome);
    if (estado) {
      return estado;
    }
  }

  return null;
};

const adicionarDias = (data, dias) => {
  const base = new Date(data);
  base.setDate(base.getDate() + dias);
  return base;
};

const processarTransicoesTemporaisMarketplace = async () => {
  const estadoRejeitado = await obterEstadoAnuncioPorNome("Rejeitado");
  const estadoArquivado = await obterEstadoAnuncioPorNome("Arquivado");
  const estadoPublicado = await obterEstadoAnuncioPorNome("Publicado");
  const estadoPendenteRenovacao = await obterEstadoAnuncioPorNomes(["PendenteRenovacao", "Pendente Renovacao"]);

  if (estadoRejeitado && estadoArquivado) {
    const limiteRejeicao = adicionarDias(new Date(), -DIAS_PARA_RESSUBMISSAO);
    await prisma.anuncio_marketplace.updateMany({
      where: {
        id_estado: estadoRejeitado.id,
        dataaprovacao: {
          not: null,
          lte: limiteRejeicao,
        },
      },
      data: {
        id_estado: estadoArquivado.id,
      },
    });
  }

  if (estadoPublicado && estadoPendenteRenovacao) {
    const limitePublicado = adicionarDias(new Date(), -DIAS_PARA_RENOVACAO);
    await prisma.anuncio_marketplace.updateMany({
      where: {
        id_estado: estadoPublicado.id,
        dataaprovacao: {
          not: null,
          lte: limitePublicado,
        },
      },
      data: {
        id_estado: estadoPendenteRenovacao.id,
      },
    });
  }
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
      estado_anuncio: {
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

  const resposta = mapearAnuncioMarketplace(anuncio);
  resposta.imagens = await listarImagensAnuncio(anuncio.id);
  return resposta;
};

const criarAnuncioMarketplace = async ({ titulo, descricao, tamanho, imagens, id_categoria, id_tipo, id_sexo, id_utilizador }) => {
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

  const criado = await prisma.anuncio_marketplace.create({
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

  if (Array.isArray(imagens) && imagens.length > 0) {
    await uploadImagensAnuncio(criado.id, id_utilizador, imagens);
  }

  return obterAnuncioMarketplacePorId(criado.id);
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
      estado_anuncio: {
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

  const mapeados = anuncios.map((anuncio) => mapearAnuncioMarketplace(anuncio, { incluirAprovacao: true }));
  return Promise.all(mapeados.map(async (anuncio) => ({
    ...anuncio,
    imagens: await listarImagensAnuncio(anuncio.id),
  })));
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
      estado_anuncio: {
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

  const mapeados = anuncios.map((anuncio) => mapearAnuncioMarketplace(anuncio, { incluirAprovacao: true }));
  return Promise.all(mapeados.map(async (anuncio) => ({
    ...anuncio,
    imagens: await listarImagensAnuncio(anuncio.id),
  })));
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

  const mapeados = anuncios.map((anuncio) => mapearAnuncioMarketplace(anuncio, { incluirAprovacao: true }));
  return Promise.all(mapeados.map(async (anuncio) => ({
    ...anuncio,
    imagens: await listarImagensAnuncio(anuncio.id),
  })));
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
      dataaprovacao: new Date(),
      motivorejeicao,
    },
  });

  return obterAnuncioMarketplacePorId(id);
};

const ressubmeterAnuncioMarketplace = async (id, idUtilizador, dados, imagens) => {
  const anuncio = await prisma.anuncio_marketplace.findUnique({ where: { id } });

  if (!anuncio) {
    const err = new Error("Anuncio nao encontrado.");
    err.code = "P2025";
    throw err;
  }

  const donoAnuncioId = Number(anuncio.id_utilizador);
  const utilizadorTokenId = Number(idUtilizador);

  if (!donoAnuncioId || !utilizadorTokenId || donoAnuncioId !== utilizadorTokenId) {
    const err = new Error("Nao tens permissao para ressubmeter este anuncio.");
    err.code = "FORBIDDEN_OWNER";
    throw err;
  }

  const estadoRejeitado = await obterEstadoAnuncioPorNome("Rejeitado");
  const estadoSubmetido = await obterEstadoAnuncioPorNome("Submetido");

  if (!estadoRejeitado || !estadoSubmetido) {
    const err = new Error("Estados obrigatorios do fluxo nao encontrados.");
    err.code = "ESTADO_NAO_ENCONTRADO";
    throw err;
  }

  if (anuncio.id_estado !== estadoRejeitado.id) {
    const err = new Error("Apenas anuncios rejeitados podem ser ressubmetidos.");
    err.code = "ANUNCIO_ESTADO_INVALIDO";
    throw err;
  }

  if (anuncio.dataaprovacao) {
    const prazoLimite = adicionarDias(anuncio.dataaprovacao, DIAS_PARA_RESSUBMISSAO);
    if (new Date() > prazoLimite) {
      const err = new Error("Prazo de ressubmissao expirado.");
      err.code = "PRAZO_RESSUBMISSAO_EXPIRADO";
      throw err;
    }
  }

  const payloadAtualizacao = {
    id_estado: estadoSubmetido.id,
    motivorejeicao: null,
    dataaprovacao: null,
  };

  if (dados?.titulo) payloadAtualizacao.titulo = dados.titulo;
  if (dados?.descricao) payloadAtualizacao.descricao = dados.descricao;
  if (dados?.tamanho) payloadAtualizacao.tamanho = dados.tamanho;
  if (dados?.id_categoria !== undefined) payloadAtualizacao.id_categoria = dados.id_categoria;
  if (dados?.id_tipo !== undefined) payloadAtualizacao.id_tipo = dados.id_tipo;
  if (dados?.id_sexo !== undefined) payloadAtualizacao.id_sexo = dados.id_sexo;

  await prisma.anuncio_marketplace.update({
    where: { id },
    data: payloadAtualizacao,
  });

  if (Array.isArray(imagens) && imagens.length > 0) {
    await substituirImagensAnuncio(id, idUtilizador, imagens);
  }

  return obterAnuncioMarketplacePorId(id);
};

const continuarAnuncioMarketplace = async (id, idUtilizador) => {
  const anuncio = await prisma.anuncio_marketplace.findUnique({ where: { id } });

  if (!anuncio) {
    const err = new Error("Anuncio nao encontrado.");
    err.code = "P2025";
    throw err;
  }

  const donoAnuncioId = Number(anuncio.id_utilizador);
  const utilizadorTokenId = Number(idUtilizador);

  if (!donoAnuncioId || !utilizadorTokenId || donoAnuncioId !== utilizadorTokenId) {
    const err = new Error("Nao tens permissao para continuar este anuncio.");
    err.code = "FORBIDDEN_OWNER";
    throw err;
  }

  const estadoPublicado = await obterEstadoAnuncioPorNome("Publicado");
  const estadoPendenteRenovacao = await obterEstadoAnuncioPorNomes(["PendenteRenovacao", "Pendente Renovacao"]);

  if (!estadoPublicado || !estadoPendenteRenovacao) {
    const err = new Error("Estados obrigatorios do fluxo nao encontrados.");
    err.code = "ESTADO_NAO_ENCONTRADO";
    throw err;
  }

  if (anuncio.id_estado !== estadoPendenteRenovacao.id) {
    const err = new Error("Apenas anuncios em pendente renovacao podem ser continuados.");
    err.code = "ANUNCIO_ESTADO_INVALIDO";
    throw err;
  }

  await prisma.anuncio_marketplace.update({
    where: { id },
    data: {
      id_estado: estadoPublicado.id,
      dataaprovacao: new Date(),
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
  ressubmeterAnuncioMarketplace,
  continuarAnuncioMarketplace,
  processarTransicoesTemporaisMarketplace,
};
