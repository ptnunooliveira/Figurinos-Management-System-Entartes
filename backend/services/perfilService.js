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

// Preenche ou atualiza os dados especificos de um utilizador com perfil FUNCIONARIO.
const preencherDadosFuncionario = async (idUtilizador, n_mecanografico, cargo) => {
    
    const utilizador = await prisma.utilizador.findUnique({
        where: { id: idUtilizador }
    });

    // Se nao existir utilizador, nao podemos criar o registo em funcionario.
    if (!utilizador) {
        throw new Error("USER_NOT_FOUND");
    }

    // Esta rota serve apenas para utilizadores que ja tenham perfil FUNCIONARIO.
    // Assim evitamos preencher dados de funcionario num aluno ou admin por engano.
    if (utilizador.perfil !== "FUNCIONARIO") {
        throw new Error("USER_NOT_FUNCIONARIO");
    }

    // O upsert faz duas coisas:
    // - se ainda nao existir registo na tabela funcionario, cria;
    // - se ja existir, atualiza n_mecanografico e cargo.
    return await prisma.funcionario.upsert({
        where: {
            id_utilizador: idUtilizador
        },
        update: {
            n_mecanografico,
            cargo
        },
        create: {
            id_utilizador: idUtilizador,
            n_mecanografico,
            cargo
        },
        include: {
            // Incluimos alguns dados do utilizador para a resposta ficar mais clara no Postman.
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
    preencherDadosAluno,
    preencherDadosFuncionario
};
