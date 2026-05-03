/**
 * ------------------------------------------------------------
 * File: anunciosEscolaService.js
 * Author: Marina Silva
 * Date: 2026-03-31
 * Version: 1.0
 * 
 * Description:
 * Service responsável pela lógica de negócio dos anúncios
 * da escola. É a única camada com acesso à base de dados.
 * Arquitetura: Route -> Controller -> Service
 * ------------------------------------------------------------
 */

const prisma = require('../prisma/client');

const figurinoInclude = {
    categoria: true,
    tipo_figurino: true,
    sexo: true,
    estado_condicao: true,
    figurino_acessorio: { include: { acessorio: true } },
};

const criarAnuncioEscola = async (dados) => {
    const maxResult = await prisma.anuncio_escola.aggregate({ _max: { id: true } });
    const nextId = (maxResult._max.id ?? 0) + 1;

    return await prisma.anuncio_escola.create({
        data: {
            id: nextId,
            id_figurino: dados.id_figurino ?? null,
            valordiarioaluguer: dados.valordiarioaluguer ?? null,
            id_estado: dados.id_estado ?? null,
            dataanuncio: new Date(),
        },
    });
};

const obterTodosAnunciosEscola = async (filtros) => {

    const { categoria, tamanho, sexo} = filtros;

    const prismaOptions = {
        include: {
            figurino: { include: figurinoInclude },
            estado_anuncio: true,
        }
    };

    if(categoria || tamanho || sexo){

        prismaOptions.where = { figurino: {} };

        if(categoria){

            prismaOptions.where.figurino.id_categoria = parseInt(categoria);
        }

        if(tamanho){

            prismaOptions.where.figurino.tamanho = tamanho;
        }

        if(sexo){

            prismaOptions.where.figurino.id_sexo = parseInt(sexo); 
        }

    }

    return await prisma.anuncio_escola.findMany(prismaOptions);
};

const obterAnuncioEscolaPorId = async (id) => {
    return await prisma.anuncio_escola.findUnique({
        where: { id },
        include: {
            figurino: { include: figurinoInclude },
            estado_anuncio: true,
        },
    });
};

const criarDataUTC = (valor) => {
    const data = new Date(`${valor}T00:00:00.000Z`);
    return Number.isNaN(data.getTime()) ? null : data;
};

const formatarData = (data) => data.toISOString().slice(0, 10);

const adicionarDias = (data, dias) => {
    const novaData = new Date(data);
    novaData.setUTCDate(novaData.getUTCDate() + dias);
    return novaData;
};

const obterDisponibilidadeAnuncio = async (id, dataInicio, dataFim) => {
    const inicio = criarDataUTC(dataInicio);
    const fim = criarDataUTC(dataFim);

    if (!inicio || !fim || inicio > fim) {
        const erro = new Error('Intervalo de datas invÃ¡lido.');
        erro.status = 400;
        throw erro;
    }

    const anuncio = await prisma.anuncio_escola.findUnique({
        where: { id },
        include: {
            figurino: {
                select: { id: true, titulo: true, descricao: true }
            }
        }
    });

    if (!anuncio) {
        const erro = new Error('AnÃºncio nÃ£o encontrado.');
        erro.status = 404;
        throw erro;
    }

    const stockRows = await prisma.$queryRawUnsafe(
        `SELECT COALESCE(f.quantidade_stock, 1) AS quantidade_stock
         FROM anuncio_escola ae
         LEFT JOIN figurino f ON f.id = ae.id_figurino
         WHERE ae.id = ${Number(id)}
         LIMIT 1`
    );
    const quantidadeStock = Math.max(0, Number(stockRows?.[0]?.quantidade_stock ?? 1));

    const linhasReserva = await prisma.linha_reserva.findMany({
        where: {
            anuncio_escola: {
                id_figurino: anuncio.id_figurino
            },
            datainicio: { lte: fim },
            datafim: { gte: inicio },
            OR: [
                { id_estado_linha_reserva: null },
                { id_estado_linha_reserva: { notIn: [4, 5] } }
            ]
        },
        select: {
            id: true,
            id_anuncio: true,
            datainicio: true,
            datafim: true
        }
    });

    const datas = [];
    const datasIndisponiveis = [];

    for (let cursor = new Date(inicio); cursor <= fim; cursor = adicionarDias(cursor, 1)) {
        const ocupadas = linhasReserva.filter((linha) => {
            if (!linha.datainicio || !linha.datafim) return false;
            const linhaInicio = new Date(linha.datainicio);
            const linhaFim = new Date(linha.datafim);
            return linhaInicio <= cursor && linhaFim >= cursor;
        }).length;

        const disponivel = ocupadas < quantidadeStock;
        const data = formatarData(cursor);

        datas.push({
            data,
            ocupadas,
            stock: quantidadeStock,
            disponivel
        });

        if (!disponivel) {
            datasIndisponiveis.push(data);
        }
    }

    return {
        id_anuncio: id,
        id_figurino: anuncio.id_figurino,
        figurino_nome: anuncio.figurino?.titulo || anuncio.figurino?.descricao || '',
        quantidade_stock: quantidadeStock,
        data_inicio: dataInicio,
        data_fim: dataFim,
        datas_indisponiveis: datasIndisponiveis,
        datas
    };
};

const atualizarAnuncioEscola = async (id, dados) => {
    return await prisma.anuncio_escola.update({
        where: { id },
        data: dados,
    });
};

const eliminarAnuncioEscola = async (id) => {
    const linhasCount = await prisma.linha_reserva.count({ where: { id_anuncio: id } });
    if (linhasCount > 0) {
        const err = new Error('Este anúncio tem reservas associadas e não pode ser eliminado.');
        err.code = 'HAS_RESERVAS';
        throw err;
    }
    return await prisma.anuncio_escola.delete({ where: { id } });
};

module.exports = {
    criarAnuncioEscola,
    obterTodosAnunciosEscola,
    obterAnuncioEscolaPorId,
    obterDisponibilidadeAnuncio,
    atualizarAnuncioEscola,
    eliminarAnuncioEscola
};
