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

const { PrismaClient } = require('@prisma/client');
const { ID_ESTADO_OCORRENCIA } = require('../utils/estadosOcorrencia');
const prisma = new PrismaClient();


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


// Id do estado "Rejeitada" na tabela estadopropostacobranca.
// Tem de corresponder ao registo existente na BD.
const ID_ESTADO_PROPOSTA_REJEITADA = 3;

// Criar contestação
// Em transação:
//   1. cria a contestação
//   2. marca a proposta de cobrança como Rejeitada
//   3. atualiza a ocorrência para "proposta contestada"
// Tudo numa só chamada: assim o aluno (que pode criar contestações) não
// precisa de chamar PATCH /propostas-cobranca/:id/estado (exclusivo de FUNCIONARIO).
const criarContestacao = async (dadosContestacao) => {
    return prisma.$transaction(async (tx) => {
        const contestacao = await tx.contestacao.create({
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

        // Marca a proposta como rejeitada para o funcionário identificar facilmente
        await tx.propostacobranca.update({
            where: { id: dadosContestacao.id_proposta_cobranca },
            data: { id_estadopropostacobranca: ID_ESTADO_PROPOSTA_REJEITADA }
        });

        const idOcorrencia = contestacao.propostacobranca?.id_ocorrencia;
        if (idOcorrencia) {
            await tx.ocorrencia.update({
                where: { id: idOcorrencia },
                data: { id_estado: ID_ESTADO_OCORRENCIA.PROPOSTA_CONTESTADA }
            });
        }

        return contestacao;
    });
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