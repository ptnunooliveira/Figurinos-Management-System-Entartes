/**
 * ------------------------------------------------------------
 * File: contestacaoService.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.0
 * 
 * Description:
 * Service responsável pela lógica de negócio das contestações.
 * Comunica diretamente com a base de dados através do Prisma ORM.
 * Arquitetura: Route -> Middleware -> Controller -> Service -> Database
 * ------------------------------------------------------------
 */

const prisma = require('../prisma/client');


// Obter todas as contestações
const obterTodasContestacoes = async () => {
    const contestacoes = await prisma.contestacao.findMany({
        include: {
            utilizador: true,
            propostacobranca: {
                include: {
                    ocorrencia: true,
                    estadopropostacobranca: true
                }
            }
        },
        orderBy: {
            id: 'desc'
        }
    });

    return contestacoes;
};


// Obter contestação por ID
const obterContestacao = async (idContestacao) => {
    const contestacao = await prisma.contestacao.findUnique({
        where: {
            id: idContestacao
        },
        include: {
            utilizador: true,
            propostacobranca: {
                include: {
                    ocorrencia: true,
                    estadopropostacobranca: true
                }
            }
        }
    });

    return contestacao;
};


// Criar contestação
const criarContestacao = async (dadosContestacao) => {
    const contestacao = await prisma.contestacao.create({
        data: dadosContestacao,
        include: {
            utilizador: true,
            propostacobranca: {
                include: {
                    ocorrencia: true,
                    estadopropostacobranca: true
                }
            }
        }
    });

    return contestacao;
};


// Obter contestações por proposta
const obterContestacoesPorProposta = async (idProposta) => {
    const contestacoes = await prisma.contestacao.findMany({
        where: {
            id_proposta_cobranca: idProposta
        },
        include: {
            utilizador: true,
            propostacobranca: true
        },
        orderBy: {
            id: 'desc'
        }
    });

    return contestacoes;
};


module.exports = {
    obterTodasContestacoes,
    obterContestacao,
    criarContestacao,
    obterContestacoesPorProposta
};
