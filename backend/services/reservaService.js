/**
 * ------------------------------------------------------------
 * File: reservaService.js
 * Author: Nuno Oliveira
 * Date: 2026-03-29
 * Version: 1.0
 * 
 * Description:
 * Service responsável pela lógica de negócio das reservas.
 * Este ficheiro comunica diretamente com a base de dados
 * através do Prisma ORM.
 * Arquitetura: Route -> Middleware -> Controller -> Service -> Database
 * ------------------------------------------------------------
 */


// Importa o PrismaClient do pacote @prisma/client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


/////////////////////////////////////////////////////////////////////////////////
//                                  READ                                       //
/////////////////////////////////////////////////////////////////////////////////


// Função responsável por obter todas as reservas da base de dados
// Assíncrona porque a operação com a BD demora algum tempo
const obterTodasReservas = async (filtros) => {

    const { estado, ordenarPorData } = filtros;

    const prismaOptions = {};

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
        }
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
        where: {id: idReserva},
        include: {
            linha_reserva: {
                include: {
                    figurino: true
                }
            }
        }
    });

    return reservaDetalhada;
};


/////////////////////////////////////////////////////////////////////////////////
//                                  CREATE                                     //
/////////////////////////////////////////////////////////////////////////////////


// Função que cria nova reserva juntamente com as linhas_reserva - não aceita reservas vazias
const criarReserva = async (idUtilizador, dadosBody) => {

    // Estado inicial da reserva, bem como da linha da reserva como 'PENDENTE'
    const ID_ESTADO_RESERVA = 1;
    const ID_ESTADO_LINHA_RESERVA = 1;

    const novaReserva = await prisma.reserva.create({

        data: {

            id_utilizador: idUtilizador,
            datareserva: new Date(),
            id_estado: ID_ESTADO_RESERVA,

            linha_reserva: {

                create: dadosBody.linhas.map((linha) => {

                    return {

                        id_anuncio: linha.id_anuncio,
                        datainicio: new Date(linha.datainicio),
                        datafim: new Date(linha.datafim),
                        id_estado_linha_reserva: ID_ESTADO_LINHA_RESERVA
                    };
                })
            }
        },

        include: {
            linha_reserva: true
        }
    });

    return novaReserva;
};


/////////////////////////////////////////////////////////////////////////////////
//                                UPDATE                                       //
/////////////////////////////////////////////////////////////////////////////////


const atualizarEstadoReserva = async (idReserva, idNovoEstado) => {

    const reservaAtualizada = await prisma.reserva.update({

        where: {
            
            id: idReserva
        },

        data: {

            id_estado: idNovoEstado
        }
    });

    return reservaAtualizada;
};


// Exporta a função para ser utilizada no controller
module.exports = {
    obterTodasReservas,
    obterReservasDoUtilizador,
    obterReservaPorID,
    obterDetalhesReserva,
    criarReserva,
    atualizarEstadoReserva
};