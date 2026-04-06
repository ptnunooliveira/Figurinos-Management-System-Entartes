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

// Função responsável por obter todas as reservas da base de dados
// Assíncrona porque a operação com a BD demora algum tempo
const obterTodasReservas = async () => {

    const reservas = await prisma.reserva.findMany();
    return reservas;
};

const obterReservasDoUtilizador = async (idUtilizador) => {

    const reservas = await prisma.reserva.findMany({

        where: {
            id_utilizador: idUtilizador
        },
        orderBy: {
            datareserva: 'desc'
        }
    });

    return reservas;
};

// Exporta a função para ser utilizada no controller
module.exports = {
    obterTodasReservas,
    obterReservasDoUtilizador
};