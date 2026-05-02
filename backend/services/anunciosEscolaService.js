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
    atualizarAnuncioEscola,
    eliminarAnuncioEscola
};
