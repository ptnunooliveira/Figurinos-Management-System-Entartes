/**
 * ------------------------------------------------------------
 * File: figurinoService.js
 * Author: Ricardo
 * Date: 2026-04-22
 * Version: 1.2
 * 
 * Description:
 * Service responsável pela lógica de negócio dos figurinos.
 * Este ficheiro comunica diretamente com a base de dados
 * através do Prisma ORM.
 * Arquitetura: Route -> Middleware -> Controller -> Service -> Database
 * ------------------------------------------------------------
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// ------------------------------------------------------------
// Helpers internos
// ------------------------------------------------------------

// Extrai uma designação textual de um estado de linha de reserva.
const extrairDescricaoEstadoLinhaReserva = (estadoLinhaReserva) => {
    if (!estadoLinhaReserva) return '';

    return (
        estadoLinhaReserva.nome ||
        estadoLinhaReserva.estado ||
        estadoLinhaReserva.designacao ||
        estadoLinhaReserva.descricao ||
        ''
    )
        .toString()
        .trim()
        .toUpperCase();
};


// Define se uma linha de reserva deve bloquear disponibilidade.
// Regra conservadora:
// - estados finais não bloqueiam
// - tudo o resto bloqueia
const linhaReservaContaComoOcupada = (linhaReserva) => {
    const descricaoEstado = extrairDescricaoEstadoLinhaReserva(linhaReserva.estado_linha_reserva);

    if (!descricaoEstado) {
        return true;
    }

    const estadosNaoBloqueantes = [
        'CANCELADO',
        'CANCELADA',
        'DEVOLVIDO',
        'DEVOLVIDA',
        'CONCLUIDO',
        'CONCLUIDA',
        'REJEITADO',
        'REJEITADA',
        'EXPIRADO',
        'EXPIRADA'
    ];

    return !estadosNaoBloqueantes.includes(descricaoEstado);
};


// Verifica sobreposição entre dois intervalos de datas.
const datasSobrepoem = (inicioA, fimA, inicioB, fimB) => {
    const aInicio = new Date(inicioA);
    const aFim = new Date(fimA);
    const bInicio = new Date(inicioB);
    const bFim = new Date(fimB);

    return aInicio <= bFim && bInicio <= aFim;
};


// ------------------------------------------------------------
// Obter todos os figurinos com filtros
// ------------------------------------------------------------
const obterTodosFigurinos = async (filtros = {}) => {
    const {
        descricao,
        tamanho,
        localizacao,
        id_categoria,
        id_tipo,
        id_sexo,
        id_estado_figurino
    } = filtros;

    const where = {};

    if (descricao) {
        where.descricao = {
            contains: descricao,
            mode: 'insensitive'
        };
    }

    if (tamanho) {
        where.tamanho = {
            contains: tamanho,
            mode: 'insensitive'
        };
    }

    if (localizacao) {
        where.localizacao = {
            contains: localizacao,
            mode: 'insensitive'
        };
    }

    if (id_categoria !== undefined && id_categoria !== null) {
        where.id_categoria = id_categoria;
    }

    if (id_tipo !== undefined && id_tipo !== null) {
        where.id_tipo = id_tipo;
    }

    if (id_sexo !== undefined && id_sexo !== null) {
        where.id_sexo = id_sexo;
    }

    if (id_estado_figurino !== undefined && id_estado_figurino !== null) {
        where.id_estado_figurino = id_estado_figurino;
    }

    const figurinos = await prisma.figurino.findMany({
        where,
        include: {
            categoria: true,
            tipo_figurino: true,
            sexo: true,
            estado_condicao: true,
            figurino_acessorio: {
                include: {
                    acessorio: true
                }
            }
        },
        orderBy: {
            id: 'asc'
        }
    });

    return figurinos;
};


// ------------------------------------------------------------
// Obter um figurino específico
// ------------------------------------------------------------
const obterFigurino = async (idFigurino) => {
    const figurino = await prisma.figurino.findUnique({
        where: {
            id: idFigurino
        },
        include: {
            categoria: true,
            tipo_figurino: true,
            sexo: true,
            estado_condicao: true,
            anuncio_escola: {
                include: {
                    estado_anuncio: true
                }
            },
            figurino_acessorio: {
                include: {
                    acessorio: true
                }
            }
        }
    });

    return figurino;
};


// ------------------------------------------------------------
// Criar um novo figurino
// ------------------------------------------------------------
const criarFigurino = async (dadosFigurino) => {
    const novoFigurino = await prisma.figurino.create({
        data: dadosFigurino,
        include: {
            categoria: true,
            tipo_figurino: true,
            sexo: true,
            estado_condicao: true
        }
    });

    return novoFigurino;
};


// ------------------------------------------------------------
// Atualizar um figurino existente
// ------------------------------------------------------------
const atualizarFigurino = async (idFigurino, dadosFigurino) => {
    const figurinoAtualizado = await prisma.figurino.update({
        where: {
            id: idFigurino
        },
        data: dadosFigurino,
        include: {
            categoria: true,
            tipo_figurino: true,
            sexo: true,
            estado_condicao: true
        }
    });

    return figurinoAtualizado;
};


// ------------------------------------------------------------
// Obter histórico de utilizações de um figurino
// ------------------------------------------------------------
const obterHistoricoFigurino = async (idFigurino) => {
    const figurino = await prisma.figurino.findUnique({
        where: {
            id: idFigurino
        },
        include: {
            categoria: true,
            tipo_figurino: true,
            sexo: true,
            estado_condicao: true,
            anuncio_escola: {
                include: {
                    estado_anuncio: true,
                    linha_reserva: {
                        include: {
                            estado_linha_reserva: true,
                            reserva: {
                                include: {
                                    estado_reserva: true,
                                    utilizador: true,
                                    funcionario: {
                                        include: {
                                            utilizador: true
                                        }
                                    }
                                }
                            },
                            devolucao: true,
                            ocorrencia: {
                                include: {
                                    estado_ocorrencia: true
                                }
                            }
                        },
                        orderBy: {
                            id: 'desc'
                        }
                    }
                }
            }
        }
    });

    if (!figurino) {
        return null;
    }

    const historico = figurino.anuncio_escola.flatMap(anuncio =>
        anuncio.linha_reserva.map(linha => ({
            id_linha_reserva: linha.id,
            id_reserva: linha.id_reserva ?? null,
            id_anuncio_escola: anuncio.id,
            datainicio: linha.datainicio ?? null,
            datafim: linha.datafim ?? null,
            valordiario: linha.valordiario ?? null,
            estado_linha_reserva: linha.estado_linha_reserva ?? null,
            reserva: linha.reserva ?? null,
            devolucao: linha.devolucao ?? [],
            ocorrencia: linha.ocorrencia ?? [],
            estado_anuncio: anuncio.estado_anuncio ?? null
        }))
    );

    return {
        figurino: {
            id: figurino.id,
            descricao: figurino.descricao,
            tamanho: figurino.tamanho,
            localizacao: figurino.localizacao,
            id_categoria: figurino.id_categoria,
            id_tipo: figurino.id_tipo,
            id_sexo: figurino.id_sexo,
            id_estado_figurino: figurino.id_estado_figurino,
            categoria: figurino.categoria,
            tipo_figurino: figurino.tipo_figurino,
            sexo: figurino.sexo,
            estado_condicao: figurino.estado_condicao
        },
        total_utilizacoes: historico.length,
        historico
    };
};


// ------------------------------------------------------------
// Obter disponibilidade de um figurino num período
// ------------------------------------------------------------
const obterDisponibilidadeFigurino = async (idFigurino, dataInicio, dataFim) => {
    const figurino = await prisma.figurino.findUnique({
        where: {
            id: idFigurino
        },
        include: {
            estado_condicao: true,
            anuncio_escola: {
                include: {
                    estado_anuncio: true,
                    linha_reserva: {
                        include: {
                            estado_linha_reserva: true
                        }
                    }
                }
            }
        }
    });

    if (!figurino) {
        return null;
    }

    const inicioPedido = new Date(dataInicio);
    const fimPedido = new Date(dataFim);

    if (Number.isNaN(inicioPedido.getTime()) || Number.isNaN(fimPedido.getTime())) {
        const erro = new Error('As datas fornecidas são inválidas.');
        erro.statusCode = 400;
        throw erro;
    }

    if (inicioPedido > fimPedido) {
        const erro = new Error('A data de início não pode ser superior à data de fim.');
        erro.statusCode = 400;
        throw erro;
    }

    const todasLinhasReserva = figurino.anuncio_escola.flatMap(anuncio =>
        anuncio.linha_reserva.map(linha => ({
            ...linha,
            id_anuncio_escola: anuncio.id,
            estado_anuncio: anuncio.estado_anuncio
        }))
    );

    const linhasConflito = todasLinhasReserva.filter(linha => {
        if (!linha.datainicio || !linha.datafim) {
            return false;
        }

        if (!linhaReservaContaComoOcupada(linha)) {
            return false;
        }

        return datasSobrepoem(
            linha.datainicio,
            linha.datafim,
            dataInicio,
            dataFim
        );
    });

    return {
        id_figurino: figurino.id,
        data_inicio_pedida: dataInicio,
        data_fim_pedida: dataFim,
        estado_figurino: figurino.estado_condicao ?? null,
        disponivel: linhasConflito.length === 0,
        total_anuncios_escola: figurino.anuncio_escola.length,
        total_linhas_reserva_associadas: todasLinhasReserva.length,
        total_conflitos_no_periodo: linhasConflito.length,
        conflitos: linhasConflito.map(linha => ({
            id_linha_reserva: linha.id,
            id_anuncio_escola: linha.id_anuncio,
            datainicio: linha.datainicio,
            datafim: linha.datafim,
            estado_linha_reserva: linha.estado_linha_reserva
        }))
    };
};


module.exports = {
    obterTodosFigurinos,
    obterFigurino,
    criarFigurino,
    atualizarFigurino,
    obterHistoricoFigurino,
    obterDisponibilidadeFigurino
};