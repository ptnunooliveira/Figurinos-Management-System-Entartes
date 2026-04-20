/**
 * ------------------------------------------------------------
 * File: figurinoService.js
 * Author: Nelson Cruz
 * Date: 2026-04-20
 * Version: 1.0
 * Description:
 * Service responsavel pela logica de negocio dos figurinos.
 * ------------------------------------------------------------
 */

const prisma = require("../prisma/client");

// Adicionado Nelson em 20-04-2026: verifica se um valor e um ID inteiro positivo.
const validarId = (id) => Number.isInteger(id) && id > 0;

// Adicionado Nelson em 20-04-2026: associa um acessorio a um figurino na tabela figurino_acessorio.
const associarAcessorio = async (idFigurino, idAcessorio) => {
    if (!validarId(idFigurino) || !validarId(idAcessorio)) {
        const error = new Error("IDs invalidos.");
        error.code = "INVALID_ID";
        throw error;
    }

    // Adicionado Nelson em 20-04-2026: valida se o figurino existe antes de criar a associacao.
    const figurino = await prisma.figurino.findUnique({
        where: { id: idFigurino },
        select: { id: true }
    });

    if (!figurino) {
        const error = new Error("Figurino nao encontrado.");
        error.code = "FIGURINO_NOT_FOUND";
        throw error;
    }

    // Adicionado Nelson em 20-04-2026: valida se o acessorio existe antes de criar a associacao.
    const acessorio = await prisma.acessorio.findUnique({
        where: { id: idAcessorio },
        select: { id: true }
    });

    if (!acessorio) {
        const error = new Error("Acessorio nao encontrado.");
        error.code = "ACESSORIO_NOT_FOUND";
        throw error;
    }

    // Adicionado Nelson em 20-04-2026: impede duplicados antes do create para devolver uma mensagem clara.
    const associacaoExistente = await prisma.figurino_acessorio.findUnique({
        where: {
            id_figurino_id_acessorio: {
                id_figurino: idFigurino,
                id_acessorio: idAcessorio
            }
        }
    });

    if (associacaoExistente) {
        const error = new Error("Acessorio ja associado ao figurino.");
        error.code = "ASSOCIATION_ALREADY_EXISTS";
        throw error;
    }

    // Adicionado Nelson em 20-04-2026: grava a associacao na tabela figurino_acessorio.
    return prisma.figurino_acessorio.create({
        data: {
            id_figurino: idFigurino,
            id_acessorio: idAcessorio
        },
        include: {
            figurino: true,
            acessorio: true
        }
    });
};

module.exports = {
    associarAcessorio
};
