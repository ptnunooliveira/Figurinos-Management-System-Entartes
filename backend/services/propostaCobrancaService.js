/**
 * ------------------------------------------------------------
 * File: propostaCobrancaService.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.0
 * 
 * Description:
 * Service responsável pela lógica de negócio das propostas de
 * cobrança. Comunica diretamente com a base de dados através
 * do Prisma ORM.
 * Arquitetura: Route -> Middleware -> Controller -> Service -> Database
 * ------------------------------------------------------------
 */

const { PrismaClient } = require('@prisma/client');
const { ID_ESTADO_OCORRENCIA } = require('../utils/estadosOcorrencia');
const prisma = new PrismaClient();


// Obter todas as propostas de cobrança
const obterTodasPropostasCobranca = async () => {
    const propostas = await prisma.propostacobranca.findMany({
        include: {
            ocorrencia: {
                include: {
                    estado_ocorrencia: true,
                    linha_reserva: {
                        include: {
                            reserva: {
                                include: {
                                    utilizador: true
                                }
                            }
                        }
                    }
                }
            },
            estadopropostacobranca: true,
            contestacao: {
                include: {
                    utilizador: true
                }
            }
        },
        orderBy: {
            id: 'desc'
        }
    });

    return propostas;
};


// Obter proposta por ID
const obterPropostaCobranca = async (idProposta) => {
    const proposta = await prisma.propostacobranca.findUnique({
        where: {
            id: idProposta
        },
        include: {
            ocorrencia: {
                include: {
                    estado_ocorrencia: true,
                    linha_reserva: {
                        include: {
                            reserva: {
                                include: {
                                    utilizador: true
                                }
                            }
                        }
                    }
                }
            },
            estadopropostacobranca: true,
            contestacao: {
                include: {
                    utilizador: true
                }
            }
        }
    });

    return proposta;
};


// Criar proposta de cobrança
// Sempre que uma proposta é enviada ao aluno, a ocorrência fica em
// "A aguardar resposta do aluno". Isto cobre tanto a primeira proposta
// como o reenvio após contestação (BPMN: aluno tinha rejeitado a proposta anterior).
const criarPropostaCobranca = async (dadosProposta) => {
    return prisma.$transaction(async (tx) => {
        const proposta = await tx.propostacobranca.create({
            data: dadosProposta,
            include: {
                ocorrencia: true,
                estadopropostacobranca: true
            }
        });

        if (proposta.id_ocorrencia) {
            const ocorrenciaAtualizada = await tx.ocorrencia.update({
                where: { id: proposta.id_ocorrencia },
                data: { id_estado: ID_ESTADO_OCORRENCIA.AGUARDAR_ALUNO }
            });
            proposta.ocorrencia = ocorrenciaAtualizada;
        }

        return proposta;
    });
};


// Atualizar estado da proposta de cobrança
const atualizarEstadoPropostaCobranca = async (idProposta, idEstadoProposta) => {
    const propostaAtualizada = await prisma.propostacobranca.update({
        where: {
            id: idProposta
        },
        data: {
            id_estadopropostacobranca: idEstadoProposta
        },
        include: {
            ocorrencia: true,
            estadopropostacobranca: true
        }
    });

    return propostaAtualizada;
};


// Finalizar processo com lançamento em conta corrente
const finalizarPropostaEmContaCorrente = async (idProposta, dadosMovimento) => {
    const proposta = await prisma.propostacobranca.findUnique({
        where: {
            id: idProposta
        },
        include: {
            ocorrencia: {
                include: {
                    linha_reserva: {
                        include: {
                            reserva: true
                        }
                    }
                }
            }
        }
    });

    if (!proposta) {
        return null;
    }

    if (!proposta.ocorrencia) {
        const erro = new Error('A proposta não está associada a nenhuma ocorrência.');
        erro.statusCode = 400;
        throw erro;
    }

    if (!proposta.ocorrencia.linha_reserva) {
        const erro = new Error('A ocorrência não está associada a nenhuma linha de reserva.');
        erro.statusCode = 400;
        throw erro;
    }

    if (!proposta.ocorrencia.linha_reserva.reserva) {
        const erro = new Error('A linha de reserva não está associada a nenhuma reserva.');
        erro.statusCode = 400;
        throw erro;
    }

    const idUtilizador = proposta.ocorrencia.linha_reserva.reserva.id_utilizador;

    if (!idUtilizador) {
        const erro = new Error('Não foi possível identificar o utilizador da dívida.');
        erro.statusCode = 400;
        throw erro;
    }

    const movimento = await prisma.$transaction(async (tx) => {
        const novoMovimento = await tx.conta_corrente.create({
            data: {
                valor: proposta.valor,
                exportadofaturacao: false,
                dataexportacao: null,
                id_utilizador: idUtilizador,
                id_tipo_movimento: dadosMovimento.id_tipo_movimento,
                id_ocorrencia: proposta.id_ocorrencia,
                id_linha_reserva: proposta.ocorrencia.id_linha_reserva
            },
            include: {
                utilizador: true,
                ocorrencia: true,
                linha_reserva: true,
                tipo_movimento_contacorrente: true
            }
        });

        let propostaAtualizada = null;

        if (dadosMovimento.id_estadopropostacobranca !== undefined && dadosMovimento.id_estadopropostacobranca !== null) {
            propostaAtualizada = await tx.propostacobranca.update({
                where: {
                    id: idProposta
                },
                data: {
                    id_estadopropostacobranca: dadosMovimento.id_estadopropostacobranca
                },
                include: {
                    estadopropostacobranca: true
                }
            });
        }

        // BPMN "Encerra ocorrência": ao finalizar com lançamento em conta corrente
        // (aluno aceitou) marcar a ocorrência como resolvida.
        const ocorrenciaAtualizada = await tx.ocorrencia.update({
            where: { id: proposta.id_ocorrencia },
            data: { id_estado: ID_ESTADO_OCORRENCIA.RESOLVIDA },
            include: { estado_ocorrencia: true }
        });

        return {
            movimento: novoMovimento,
            proposta_atualizada: propostaAtualizada,
            ocorrencia_atualizada: ocorrenciaAtualizada
        };
    });

    return movimento;
};


// Funcionário aceita a contraproposta do aluno: cria proposta já aceite,
// lança em conta corrente e resolve a ocorrência numa única transação.
const resolverComContraproposta = async (idOcorrencia, valor) => {
    const ocorrencia = await prisma.ocorrencia.findUnique({
        where: { id: idOcorrencia },
        include: {
            linha_reserva: {
                include: { reserva: true }
            }
        }
    });

    if (!ocorrencia) {
        const err = new Error('Ocorrência não encontrada.');
        err.statusCode = 404;
        throw err;
    }

    const idUtilizador = ocorrencia.linha_reserva?.reserva?.id_utilizador ?? null;

    return prisma.$transaction(async (tx) => {
        const proposta = await tx.propostacobranca.create({
            data: {
                id_ocorrencia: idOcorrencia,
                valor,
                dataproposta: new Date(),
                id_estadopropostacobranca: 2, // ACEITE
                descricao: 'Valor acordado com o aluno após contestação.'
            }
        });

        await tx.conta_corrente.create({
            data: {
                valor,
                exportadofaturacao: false,
                dataexportacao: null,
                id_utilizador: idUtilizador,
                id_ocorrencia: idOcorrencia,
                id_linha_reserva: ocorrencia.id_linha_reserva ?? null
            }
        });

        const ocorrenciaAtualizada = await tx.ocorrencia.update({
            where: { id: idOcorrencia },
            data: { id_estado: ID_ESTADO_OCORRENCIA.RESOLVIDA },
            include: { estado_ocorrencia: true }
        });

        return { proposta, ocorrencia_atualizada: ocorrenciaAtualizada };
    });
};


// Aluno aceita a proposta: lança em conta corrente e resolve a ocorrência.
const aceitarPropostaAluno = async (idProposta, idUtilizador) => {
    const proposta = await prisma.propostacobranca.findUnique({
        where: { id: idProposta },
        include: {
            ocorrencia: {
                include: {
                    linha_reserva: {
                        include: { reserva: true }
                    }
                }
            }
        }
    });

    if (!proposta) {
        const err = new Error('Proposta não encontrada.');
        err.statusCode = 404;
        throw err;
    }

    const idDono = proposta.ocorrencia?.linha_reserva?.reserva?.id_utilizador;
    if (idDono !== idUtilizador) {
        const err = new Error('Não autorizado.');
        err.statusCode = 403;
        throw err;
    }

    return prisma.$transaction(async (tx) => {
        const propostaAtualizada = await tx.propostacobranca.update({
            where: { id: idProposta },
            data: { id_estadopropostacobranca: 2 }, // ACEITE
            include: { estadopropostacobranca: true }
        });

        const novoMovimento = await tx.conta_corrente.create({
            data: {
                valor: proposta.valor,
                exportadofaturacao: false,
                dataexportacao: null,
                id_utilizador: idUtilizador,
                id_ocorrencia: proposta.id_ocorrencia,
                id_linha_reserva: proposta.ocorrencia?.id_linha_reserva ?? null
            }
        });

        const ocorrenciaAtualizada = await tx.ocorrencia.update({
            where: { id: proposta.id_ocorrencia },
            data: { id_estado: ID_ESTADO_OCORRENCIA.RESOLVIDA },
            include: { estado_ocorrencia: true }
        });

        return {
            proposta_atualizada: propostaAtualizada,
            movimento: novoMovimento,
            ocorrencia_atualizada: ocorrenciaAtualizada
        };
    });
};


module.exports = {
    obterTodasPropostasCobranca,
    obterPropostaCobranca,
    criarPropostaCobranca,
    atualizarEstadoPropostaCobranca,
    finalizarPropostaEmContaCorrente,
    aceitarPropostaAluno,
    resolverComContraproposta
};
