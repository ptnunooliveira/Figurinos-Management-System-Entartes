/**
 * ------------------------------------------------------------
 * File: contaCorrenteService.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.0
 * 
 * Description:
 * Service responsável pela lógica de negócio da conta corrente.
 * Comunica diretamente com a base de dados através do Prisma ORM.
 * Arquitetura: Route -> Middleware -> Controller -> Service -> Database
 * ------------------------------------------------------------
 */

const prisma = require('../prisma/client');


// Obter todos os movimentos da conta corrente
const obterTodosMovimentosContaCorrente = async () => {
    const movimentos = await prisma.conta_corrente.findMany({
        include: {
            utilizador: true,
            tipo_movimento_contacorrente: true,
            ocorrencia: true,
            linha_reserva: true
        },
        orderBy: {
            id: 'desc'
        }
    });

    return movimentos;
};


// Obter movimento por ID
const obterMovimentoContaCorrente = async (idMovimento) => {
    const movimento = await prisma.conta_corrente.findUnique({
        where: {
            id: idMovimento
        },
        include: {
            utilizador: true,
            tipo_movimento_contacorrente: true,
            ocorrencia: true,
            linha_reserva: true
        }
    });

    return movimento;
};


// Obter conta corrente de um utilizador
const obterContaCorrentePorUtilizador = async (idUtilizador) => {
    const movimentos = await prisma.conta_corrente.findMany({
        where: {
            id_utilizador: idUtilizador
        },
        include: {
            tipo_movimento_contacorrente: true,
            ocorrencia: true,
            linha_reserva: true
        },
        orderBy: {
            id: 'desc'
        }
    });

    const saldo = movimentos.reduce((acumulado, movimento) => {
        return acumulado + (movimento.valor || 0);
    }, 0);

    return {
        id_utilizador: idUtilizador,
        saldo,
        total_movimentos: movimentos.length,
        movimentos
    };
};


// Marcar movimento como exportado para faturação
const marcarMovimentoComoExportado = async (idMovimento) => {
    const movimento = await prisma.conta_corrente.update({
        where: {
            id: idMovimento
        },
        data: {
            exportadofaturacao: true,
            dataexportacao: new Date()
        },
        include: {
            utilizador: true,
            tipo_movimento_contacorrente: true,
            ocorrencia: true,
            linha_reserva: true
        }
    });

    return movimento;
};


module.exports = {
    obterTodosMovimentosContaCorrente,
    obterMovimentoContaCorrente,
    obterContaCorrentePorUtilizador,
    marcarMovimentoComoExportado
};
