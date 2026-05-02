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
            ocorrencia: {
                include: {
                    propostacobranca: {
                        orderBy: { id: 'desc' }
                    }
                }
            },
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
            ocorrencia: {
                include: {
                    propostacobranca: {
                        orderBy: { id: 'desc' }
                    }
                }
            },
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
            ocorrencia: {
                include: {
                    propostacobranca: {
                        orderBy: { id: 'desc' }
                    }
                }
            },
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


// Cria registos de aluguer em falta para todas as devoluções processadas.
// Idempotente: ignora devoluções que já têm registo de aluguer em conta_corrente.
const sincronizarMovimentosAluguer = async () => {
    const devolucoes = await prisma.devolucao.findMany({
        include: {
            linha_reserva: {
                include: {
                    reserva: true,
                    anuncio_escola: true,
                }
            }
        }
    });

    let criados = 0;

    for (const dev of devolucoes) {
        const lr = dev.linha_reserva;
        if (!lr) continue;

        const idUtilizador = lr.reserva?.id_utilizador ?? null;
        if (!idUtilizador) continue;

        // Ignora se já existe registo de aluguer (id_ocorrencia null = aluguer, não ocorrência)
        const jaExiste = await prisma.conta_corrente.findFirst({
            where: { id_linha_reserva: lr.id, id_ocorrencia: null }
        });
        if (jaExiste) continue;

        // Usa valordiario congelado; fallback para o preço atual do anúncio
        const valorDiario = lr.valordiario || lr.anuncio_escola?.valordiarioaluguer || 0;
        if (!valorDiario || !lr.datainicio || !lr.datafim) continue;

        const inicio = new Date(lr.datainicio);
        const fim = new Date(lr.datafim);
        const dias = Math.max(1, Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24)));
        const valorAluguer = valorDiario * dias;
        if (valorAluguer <= 0) continue;

        await prisma.conta_corrente.create({
            data: {
                valor: valorAluguer,
                exportadofaturacao: false,
                dataexportacao: null,
                id_utilizador: idUtilizador,
                id_linha_reserva: lr.id,
            }
        });
        criados++;
    }

    return { criados };
};


module.exports = {
    obterTodosMovimentosContaCorrente,
    obterMovimentoContaCorrente,
    obterContaCorrentePorUtilizador,
    marcarMovimentoComoExportado,
    sincronizarMovimentosAluguer
};
