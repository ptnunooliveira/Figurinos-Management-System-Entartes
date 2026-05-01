/**
 * ------------------------------------------------------------
 * File: figurinoService.js
 * Author: Ricardo
 * Date: 2026-04-11
 * Version: 2.0
 * 
 * Description:
 * Service responsável pela lógica de negócio dos figurinos.
 * Este ficheiro comunica diretamente com a base de dados
 * através do Prisma ORM.
 * Arquitetura: Route -> Middleware -> Controller -> Service -> Database
 * ------------------------------------------------------------
 */

const prisma = require('../prisma/client');


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
const construirWhereFigurinos = (filtros = {}) => {
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

    return where;
}


const validarId = (id) => Number.isInteger(id) && id > 0;

const obterTitulosFigurinos = async (client, ids) => {
    const idsUnicos = [...new Set(ids.filter(validarId))];

    if (idsUnicos.length === 0) {
        return new Map();
    }

    const placeholders = idsUnicos.map((id) => Number(id)).join(',');
    const titulos = await client.$queryRawUnsafe(
        `SELECT id, titulo FROM figurino WHERE id IN (${placeholders})`
    );

    return new Map(titulos.map((item) => [Number(item.id), item.titulo]));
};

const anexarTitulosFigurinos = async (figurinos, client = prisma) => {
    const lista = Array.isArray(figurinos) ? figurinos : [figurinos];
    const titulos = await obterTitulosFigurinos(client, lista.map((figurino) => figurino?.id));
    const comTitulos = lista.map((figurino) => ({
        ...figurino,
        titulo: titulos.get(figurino.id) ?? figurino.titulo ?? null
    }));

    return Array.isArray(figurinos) ? comTitulos : comTitulos[0];
};

const escaparLiteralSql = (valor) => {
    if (valor === null || valor === undefined) {
        return 'NULL';
    }

    return `'${String(valor).replace(/'/g, "''")}'`;
};

const atualizarTituloFigurino = async (client, idFigurino, titulo) => {
    await client.$executeRawUnsafe(
        `UPDATE figurino SET titulo = ${escaparLiteralSql(titulo)} WHERE id = ${Number(idFigurino)}`
    );
};

const obterProximoIdFigurino = async () => {
    const max = await prisma.figurino.aggregate({
        _max: { id: true }
    });

    return (max._max.id || 0) + 1;
};

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
    const associacaoExistente = await prisma.figurino_acessorio.findFirst({
        where: {
            id_figurino: idFigurino,
            id_acessorio: idAcessorio
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
        }
    });
};

// Obter todos os figurinos
const obterTodosFigurinos = async (filtros = {}) => {
    const where = construirWhereFigurinos(filtros);

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

    return anexarTitulosFigurinos(figurinos);
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

    if (!figurino) {
        return null;
    }

    return anexarTitulosFigurinos(figurino);
};


// ------------------------------------------------------------
// Criar um novo figurino
// ------------------------------------------------------------
const criarFigurino = async (dadosFigurino) => {
    const { id_acessorios = [], titulo, ...dadosBaseFigurino } = dadosFigurino;
    const novoId = await obterProximoIdFigurino();

    const novoFigurino = await prisma.$transaction(async (tx) => {
        if (id_acessorios.length > 0) {
            const totalAcessorios = await tx.acessorio.count({
                where: {
                    id: {
                        in: id_acessorios
                    }
                }
            });

            if (totalAcessorios !== id_acessorios.length) {
                const error = new Error("Um ou mais acessorios selecionados nao existem.");
                error.code = "ACESSORIO_NOT_FOUND";
                throw error;
            }
        }

        const figurinoCriado = await tx.figurino.create({
            data: {
                id: novoId,
                ...dadosBaseFigurino
            }
        });

        if (titulo !== undefined) {
            await atualizarTituloFigurino(tx, figurinoCriado.id, titulo);
        }

        if (id_acessorios.length > 0) {
            await tx.figurino_acessorio.createMany({
                data: id_acessorios.map((idAcessorio) => ({
                    id_figurino: figurinoCriado.id,
                    id_acessorio: idAcessorio
                })),
                skipDuplicates: true
            });
        }

        const figurinoCompleto = await tx.figurino.findUnique({
            where: { id: figurinoCriado.id },
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
            }
        });

        return {
            ...figurinoCompleto,
            titulo: titulo ?? null
        };
    });

    return novoFigurino;
};


// ------------------------------------------------------------
// Atualizar um figurino existente
// ------------------------------------------------------------
const atualizarFigurino = async (idFigurino, dadosFigurino) => {
    const { titulo, id_acessorios, substituir_acessorios, ...dadosBaseFigurino } = dadosFigurino;
    const deveSubstituirAcessorios = substituir_acessorios === true || id_acessorios !== undefined;

    const figurinoAtualizado = await prisma.$transaction(async (tx) => {
        if (id_acessorios !== undefined && id_acessorios.length > 0) {
            const totalAcessorios = await tx.acessorio.count({
                where: {
                    id: {
                        in: id_acessorios
                    }
                }
            });

            if (totalAcessorios !== id_acessorios.length) {
                const error = new Error("Um ou mais acessorios selecionados nao existem.");
                error.code = "ACESSORIO_NOT_FOUND";
                throw error;
            }
        }

        if (Object.keys(dadosBaseFigurino).length > 0) {
            await tx.figurino.update({
                where: {
                    id: idFigurino
                },
                data: dadosBaseFigurino
            });
        }

        if (titulo !== undefined) {
            await atualizarTituloFigurino(tx, idFigurino, titulo);
        }

        if (deveSubstituirAcessorios) {
            await tx.figurino_acessorio.deleteMany({
                where: {
                    id_figurino: idFigurino
                }
            });

            if ((id_acessorios ?? []).length > 0) {
                await tx.figurino_acessorio.createMany({
                    data: id_acessorios.map((idAcessorio) => ({
                        id_figurino: idFigurino,
                        id_acessorio: idAcessorio
                    })),
                    skipDuplicates: true
                });
            }
        }

        const atualizado = await tx.figurino.findUnique({
            where: {
                id: idFigurino
            },
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
            }
        });

        return anexarTitulosFigurinos(atualizado, tx);
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

    const figurinoComTitulo = await anexarTitulosFigurinos(figurino);

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
            titulo: figurinoComTitulo.titulo,
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


const desativarFigurino = async (idFigurino) => {
    try {
        const result = await prisma.$executeRaw`UPDATE figurino SET ativo = false WHERE id = ${idFigurino}`;
        return { id: idFigurino, ativo: false, affectedRows: result };
    } catch (error) {
        console.error("Erro no service desativarFigurino:", error);
        throw error;
    }
};

const eliminarFigurino = async (idFigurino) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const figurino = await tx.figurino.findUnique({
                where: { id: idFigurino },
                select: { id: true }
            });

            if (!figurino) {
                const erro = new Error("Figurino não encontrado.");
                erro.status = 404;
                throw erro;
            }

            const [totalAnuncios, totalChecklists] = await Promise.all([
                tx.anuncio_escola.count({ where: { id_figurino: idFigurino } }),
                tx.checklist_item.count({ where: { idfigurino: idFigurino } })
            ]);

            if (totalAnuncios > 0 || totalChecklists > 0) {
                const erro = new Error(
                    "Não é possível apagar este figurino da base de dados porque já tem anúncios, reservas ou checklists associados."
                );
                erro.status = 409;
                throw erro;
            }

            await tx.figurino_acessorio.deleteMany({
                where: { id_figurino: idFigurino }
            });

            await tx.figurino.delete({
                where: { id: idFigurino }
            });

            return { id: idFigurino, eliminado: true };
        });
    } catch (error) {
        console.error("Erro no service eliminarFigurino:", error);
        throw error;
    }
};

module.exports = {
    associarAcessorio,
    obterTodosFigurinos,
    obterFigurino,
    criarFigurino,
    atualizarFigurino,
    obterHistoricoFigurino,
    obterDisponibilidadeFigurino,
    desativarFigurino,
    eliminarFigurino
};
