/**
 * ------------------------------------------------------------
 * File: perfilService.js
 * Author: Nelson Cruz
 * Date: 2026-04-19
 * Version: 1.0
 * Description:
 * Service responsavel por gerir dados especificos dos perfis.
 * ------------------------------------------------------------
 */

const prisma = require("../prisma/client");

const preencherDadosAluno = async (idUtilizador, numeroaluno) => {
    const utilizador = await prisma.utilizador.findUnique({
        where: { id: idUtilizador }
    });

    if (!utilizador) {
        throw new Error("USER_NOT_FOUND");
    }

    if (utilizador.perfil !== "ALUNO") {
        throw new Error("USER_NOT_ALUNO");
    }

    return await prisma.aluno.upsert({
        where: {
            id_utilizador: idUtilizador
        },
        update: {
            numeroaluno
        },
        create: {
            id_utilizador: idUtilizador,
            numeroaluno
        },
        include: {
            utilizador: {
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    perfil: true,
                    ativo: true
                }
            }
        }
    });
};

module.exports = {
    preencherDadosAluno
};
