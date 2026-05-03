/**
 * ------------------------------------------------------------
 * File: reservaService.js
 * Author: Nuno Oliveira
 * Date: 2026-03-29
 * Version: 3.0
 * 
 * Description:
 * Service responsável pela lógica de negócio das reservas.
 * Este ficheiro comunica diretamente com a base de dados
 * através do Prisma ORM.
 * Arquitetura: Route -> Middleware -> Controller -> Service -> Database
 * ------------------------------------------------------------
 */


const prisma = require('../prisma/client');

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////// TRANSIÇÕES DE ESTADO ////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const TRANSICOES_PERMITIDAS = {

    1: [2, 5],  // PENDENTE -> CONFIRMADA OU CANCELADA
    2: [3, 5],  // CONFIRMADA -> EM CURSO OU CANCELADA
    3: [4, 6],  // EM CURSO -> CONCLUIDA OU ATRASADA
    6: [4]      // ATRASADA -> CONCLUIDA
                // CONCLUIDA[4] E CANCELADA[5] SÃO ESTADOS FINAIS
}

/////////////////////////////////////////////////////////////////////////////////
//                                  READ                                       //
/////////////////////////////////////////////////////////////////////////////////


// Função responsável por obter todas as reservas da base de dados
// Assíncrona porque a operação com a BD demora algum tempo
const RESERVA_INCLUDE = {
    estado_reserva: true,
    utilizador: {
        select: { id: true, nome: true, email: true }
    },
    linha_reserva: {
        include: {
            anuncio_escola: {
                include: {
                    figurino: {
                        include: {
                            categoria: true,
                            estado_condicao: true,
                            figurino_acessorio: {
                                include: { acessorio: true }
                            }
                        }
                    }
                }
            },
            estado_linha_reserva: true
        }
    }
};

const obterTodasReservas = async (filtros) => {

    const { estado, ordenarPorData } = filtros;

    const prismaOptions = { include: RESERVA_INCLUDE };

    if(estado){

        prismaOptions.where = {
            estado_reserva: {
                nome: estado.toUpperCase()
            }
        };
    }

    if(ordenarPorData === 'asc'){

        prismaOptions.orderBy = {
            datareserva: ordenarPorData
        };
    }
    else{

        prismaOptions.orderBy = {
            datareserva: 'desc'
        };
    }

    const reservas = await prisma.reserva.findMany(prismaOptions);
    return reservas;
};


// Função responsável por obter todas as reservas de um determinado utilizador
const obterReservasDoUtilizador = async (idUtilizador, filtros) => {

    const { estado, ordenarPorData } = filtros;

    const prismaOptions = {

        where: {
            id_utilizador: idUtilizador
        },
        include: RESERVA_INCLUDE
    };

    if(estado){

        prismaOptions.where.estado_reserva = {

            nome: estado.toUpperCase()
        };
    }

    if(ordenarPorData == 'asc'){

        prismaOptions.orderBy = {

            datareserva: ordenarPorData
        };
    }
    else{

        prismaOptions.orderBy = {

            datareserva: 'desc'
        };
    }

    const reservas = await prisma.reserva.findMany(prismaOptions);

    return reservas;
};


// Função responsável por obter uma reserva específica via ID
const obterReservaPorID = async (idReserva) => {

    const reserva = await prisma.reserva.findUnique({
        where: {
            id: idReserva
        }
    });

    return reserva;
};


// Função responsável por obter os detalhes da reserva (linhas_reserva)
const obterDetalhesReserva = async (idReserva) => {

    const reservaDetalhada = await prisma.reserva.findUnique({
        where: { id: idReserva },
        include: RESERVA_INCLUDE
    });

    return reservaDetalhada;
};


// Foi adicionado o parâmetro "tx" (transaction) com valor por defeito "prisma" para manter compatibilidade
const verificarDisponibilidade = async (idFigurino, dataInicioPedida, dataFimPedida, quantidadeStock = 1, tx = prisma) => {

    const inicio = new Date(dataInicioPedida);
    const fim = new Date(dataFimPedida);

    const reservasSobrepostas = await tx.linha_reserva.count({
        where: {
            anuncio_escola: {
                id_figurino: idFigurino
            },
            datainicio: { lte: fim },
            datafim: { gte: inicio },
            OR: [
                { id_estado_linha_reserva: null },
                { id_estado_linha_reserva: { notIn: [4, 5] } }
            ]
        }
    });

    return reservasSobrepostas >= Math.max(0, quantidadeStock || 0);
}

const obterNomeFigurinoPorAnuncio = async (idAnuncio, tx = prisma) => {

    const anuncio = await tx.anuncio_escola.findUnique({
        where: { id: idAnuncio },
        include: {
            figurino: {
                select: { titulo: true, descricao: true }
            }
        }
    });

    return anuncio?.figurino?.titulo || anuncio?.figurino?.descricao || `anÃºncio ${idAnuncio}`;
};

const obterStockFigurinoPorAnuncio = async (idAnuncio, tx = prisma) => {
    const rows = await tx.$queryRawUnsafe(
        `SELECT COALESCE(f.quantidade_stock, 1) AS quantidade_stock
         FROM anuncio_escola ae
         LEFT JOIN figurino f ON f.id = ae.id_figurino
         WHERE ae.id = ${Number(idAnuncio)}
         LIMIT 1`
    );

    return Number(rows?.[0]?.quantidade_stock ?? 1);
};


/////////////////////////////////////////////////////////////////////////////////
//                                  CREATE                                     //
/////////////////////////////////////////////////////////////////////////////////


// Função que cria nova reserva juntamente com as linhas_reserva - não aceita reservas vazias
const criarReserva = async (idUtilizador, idFuncionario, dadosBody) => {

    // Compatibilidade: garante que funciona quer o frontend envie { linhas: [...] } ou um array direto [...]
    const linhasArray = Array.isArray(dadosBody) ? dadosBody : dadosBody.linhas;

    if (!linhasArray || !Array.isArray(linhasArray) || linhasArray.length === 0) {
        const erro = new Error("O carrinho de reservas está vazio ou num formato inválido.");
        erro.status = 400;
        throw erro;
    }

    // Estado inicial é sempre 'PENDENTE', independentemente de quem cria a reserva
    const aluno = await prisma.utilizador.findUnique({
        where: { id: idUtilizador },
        select: { id: true, perfil: true, ativo: true }
    });

    if (!aluno || aluno.perfil !== 'ALUNO' || aluno.ativo === false) {
        const erro = new Error("O ID indicado nÃ£o corresponde a um aluno ativo.");
        erro.status = 400;
        throw erro;
    }

    const ID_ESTADO_RESERVA = 1;
    const ID_ESTADO_LINHA_RESERVA = 1;

    // 1. Verificar conflitos de datas internamente no array do carrinho
    for (let i = 0; i < linhasArray.length; i++) {
        const linhaAtual = linhasArray[i];
        const inicioAtual = new Date(linhaAtual.datainicio);
        const fimAtual = new Date(linhaAtual.datafim);

        if (inicioAtual > fimAtual) {
            const nomeFigurino = await obterNomeFigurinoPorAnuncio(linhaAtual.id_anuncio);
            const erro = new Error(`A data de início não pode ser posterior à data de fim para o figurino "${nomeFigurino}".`);
            erro.status = 400;
            throw erro;
        }

        for (let j = i + 1; j < linhasArray.length; j++) {
            const outraLinha = linhasArray[j];
            if (linhaAtual.id_anuncio === outraLinha.id_anuncio) {
                const inicioOutra = new Date(outraLinha.datainicio);
                const fimOutra = new Date(outraLinha.datafim);

                // Se o mesmo anúncio estiver em conflito de datas no próprio pedido do carrinho
                if (inicioAtual <= fimOutra && fimAtual >= inicioOutra) {
                    const nomeFigurino = await obterNomeFigurinoPorAnuncio(linhaAtual.id_anuncio);
                    const erro = new Error(`Conflito no carrinho: o figurino "${nomeFigurino}" tem datas sobrepostas no mesmo pedido.`);
                    erro.status = 409;
                    throw erro;
                }
            }
        }
    }

    // 2. Usar prisma.$transaction garante que a validação na BD e a inserção
    // do carrinho ocorrem de forma atómica e isolada (evita Race Conditions)
    const novaReserva = await prisma.$transaction(async (tx) => {

        const linhasComPreco = [];

        for(const linha of linhasArray){
            // Obter os detalhes do anúncio para "congelar" o preço no momento da reserva (valordiarioaluguer)
            const anuncio = await tx.anuncio_escola.findUnique({
                where: { id: linha.id_anuncio },
                include: {
                    figurino: {
                        select: { id: true, titulo: true, descricao: true }
                    }
                }
            });

            if (!anuncio) {
                const erro = new Error(`O anúncio com o ID ${linha.id_anuncio} não foi encontrado.`);
                erro.status = 404;
                throw erro;
            }

            const quantidadeStock = await obterStockFigurinoPorAnuncio(linha.id_anuncio, tx);
            const ocupado = await verificarDisponibilidade(anuncio.id_figurino, linha.datainicio, linha.datafim, quantidadeStock, tx);

            if(ocupado){
                const nomeFigurino = anuncio.figurino?.titulo || anuncio.figurino?.descricao || `anúncio ${linha.id_anuncio}`;
                const erro = new Error(`O figurino "${nomeFigurino}" já se encontra reservado para as datas selecionadas.`);
                erro.status = 409;
                throw erro;
            }

            linhasComPreco.push({
                id_anuncio: linha.id_anuncio,
                datainicio: new Date(linha.datainicio),
                datafim: new Date(linha.datafim),
                valordiario: anuncio.valordiarioaluguer || 0, // Congela o preço ao valor da data da reserva
                id_estado_linha_reserva: ID_ESTADO_LINHA_RESERVA
            });
        }

        return await tx.reserva.create({
            data: {
                id_utilizador: idUtilizador,
                id_funcionario: idFuncionario,
                datareserva: new Date(),
                id_estado: ID_ESTADO_RESERVA,

                linha_reserva: {
                    create: linhasComPreco
                }
            },
            include: {
                linha_reserva: true
            }
        });
    });

    return novaReserva;
};


/////////////////////////////////////////////////////////////////////////////////
//                                UPDATE                                       //
/////////////////////////////////////////////////////////////////////////////////


const atualizarEstadoReserva = async (idReserva, idNovoEstado, idFuncionario) => {

    const reservaAtual = await prisma.reserva.findUnique({

        where: { id: idReserva },
        select: {id_estado: true}   // Receber apenas o campo id_estado
    });

    const proximosEstadosPossiveis = TRANSICOES_PERMITIDAS[reservaAtual.id_estado] || [];

    if(!proximosEstadosPossiveis.includes(idNovoEstado)){

        const erro = new Error(`Não é permitido passar do estado ${reservaAtual.id_estado} para o estado ${idNovoEstado}.`);
        erro.status = 400;
        throw erro;
    }

    const reservaAtualizada = await prisma.reserva.update({

        where: { id: idReserva },
        data: { 
            id_estado: idNovoEstado,
            id_funcionario: idFuncionario
        }
    });

    if (idNovoEstado === 5 || idNovoEstado === 6) {

        await prisma.linha_reserva.updateMany({
            where: { id_reserva: idReserva },
            data: { id_estado_linha_reserva: idNovoEstado }
        });
    }

    return reservaAtualizada;
};


const TRANSICOES_LINHA_PERMITIDAS = {
    1: [2, 5],  // PENDENTE -> CONFIRMADA OU CANCELADA
};

const atualizarEstadoLinhaReserva = async (idReserva, idLinha, idNovoEstado, idFuncionario) => {

    const linha = await prisma.linha_reserva.findUnique({
        where: { id: idLinha },
        select: { id_estado_linha_reserva: true, id_reserva: true }
    });

    if (!linha) {
        const erro = new Error("Linha de reserva não encontrada.");
        erro.status = 404;
        throw erro;
    }

    if (linha.id_reserva !== idReserva) {
        const erro = new Error("A linha não pertence a esta reserva.");
        erro.status = 400;
        throw erro;
    }

    const proximosEstados = TRANSICOES_LINHA_PERMITIDAS[linha.id_estado_linha_reserva] || [];
    if (!proximosEstados.includes(idNovoEstado)) {
        const erro = new Error(`Não é permitido passar do estado ${linha.id_estado_linha_reserva} para o estado ${idNovoEstado}.`);
        erro.status = 400;
        throw erro;
    }

    await prisma.linha_reserva.update({
        where: { id: idLinha },
        data: { id_estado_linha_reserva: idNovoEstado }
    });

    // Verificar se deve atualizar o estado da reserva
    const todasLinhas = await prisma.linha_reserva.findMany({
        where: { id_reserva: idReserva },
        select: { id_estado_linha_reserva: true }
    });

    const nenhumaPendente = todasLinhas.every(l => l.id_estado_linha_reserva !== 1);
    const todasCanceladas = todasLinhas.every(l => l.id_estado_linha_reserva === 5);

    if (nenhumaPendente) {
        const novoEstadoReserva = todasCanceladas ? 5 : 2;
        await prisma.reserva.update({
            where: { id: idReserva },
            data: { id_estado: novoEstadoReserva, id_funcionario: idFuncionario }
        });
    }

    return await prisma.linha_reserva.findUnique({
        where: { id: idLinha },
        include: { estado_linha_reserva: true }
    });
};


const cancelarReserva = async(idReserva, idAluno) => {

    const reserva = await prisma.reserva.findUnique({

        where: { id: idReserva },
        select: { id_estado: true, id_utilizador: true }
    });

    if(!reserva){

        const erro = new Error("Reserva não encontrada.");
        erro.code = 'P2025';
        throw erro;
    }

    if(reserva.id_utilizador !== idAluno){

        const erro = new Error("Acesso negado. Não tens permissões para cancelar uma reserva que não é tua.");
        erro.status = 403;
        throw erro;
    }

    if(reserva.id_estado !== 1){

        const erro = new Error(`Já não é permitido cancelar a reserva ${idReserva}. Por favor, fale com um responsável.`);
        erro.status = 400;
        throw erro;
    }

    const ID_ESTADO_CANCELADA = 5;

    const reservaAtualizada = await prisma.reserva.update({

        where: { id: idReserva },
        data: {
            id_estado: ID_ESTADO_CANCELADA,
            linha_reserva: {
                updateMany: {
                    where: { },
                    data: { id_estado_linha_reserva: ID_ESTADO_CANCELADA }
                }
            }
        },
        include: {
            linha_reserva: true
        }
    });

    return reservaAtualizada;
}


// Exporta a função para ser utilizada no controller
module.exports = {
    obterTodasReservas,
    obterReservasDoUtilizador,
    obterReservaPorID,
    obterDetalhesReserva,
    criarReserva,
    atualizarEstadoReserva,
    atualizarEstadoLinhaReserva,
    cancelarReserva
};
