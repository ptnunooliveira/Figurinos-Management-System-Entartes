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

const criarAnuncioEscola = async (dados) => {
    return await prisma.anuncio_escola.create({
        data: {
            id: dados.id,
            id_figurino: dados.id_figurino ?? null,
            valordiarioaluguer: dados.valordiarioaluguer ?? null,
            id_estado: dados.id_estado ?? null,
        },
    });
};

const obterTodosAnunciosEscola = async () => {
    return await prisma.anuncio_escola.findMany({
        include: {
            figurino: true,
            estado_anuncio: true,
        },
    });
};

const obterAnuncioEscolaPorId = async (id) => {
    return await prisma.anuncio_escola.findUnique({
        where: { id },
        include: {
            figurino: true,
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
    return await prisma.anuncio_escola.delete({
        where: { id },
    });
};

module.exports = {
    criarAnuncioEscola,
    obterTodosAnunciosEscola,
    obterAnuncioEscolaPorId,
    atualizarAnuncioEscola,
    eliminarAnuncioEscola
};