/**
 * ------------------------------------------------------------
 * File: figurinoService.js
 * Author: Ricardo
 * Date: 2026-04-11
 * Version: 1.0
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


// Obter todos os figurinos
const obterTodosFigurinos = async () => {

    const figurinos = await prisma.figurino.findMany({
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


// Obter um figurino específico
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
            anuncio_escola: true,
            figurino_acessorio: {
                include: {
                    acessorio: true
                }
            }
        }
    });

    return figurino;
};


// Criar um novo figurino
const criarFigurino = async (dadosFigurino) => {

    const novoFigurino = await prisma.figurino.create({
        data: dadosFigurino
    });

    return novoFigurino;
};


// Atualizar um figurino existente
const atualizarFigurino = async (idFigurino, dadosFigurino) => {

    const figurinoAtualizado = await prisma.figurino.update({
        where: {
            id: idFigurino
        },
        data: dadosFigurino
    });

    return figurinoAtualizado;
};


// Obter disponibilidade de um figurino
const obterDisponibilidadeFigurino = async (idFigurino) => {

    const figurino = await prisma.figurino.findUnique({
        where: {
            id: idFigurino
        },
        include: {
            anuncio_escola: {
                include: {
                    linha_reserva: {
                        include: {
                            estado_linha_reserva: true
                        }
                    },
                    estado_anuncio: true
                }
            }
        }
    });

    if (!figurino) {
        return null;
    }

    // Regra base:
    // Se existir pelo menos uma linha_reserva associada a um anúncio deste figurino,
    // o figurino pode estar indisponível.
    //
    // Atenção: a regra exata depende do significado dos estados.
    // Sem os dados da tabela estado_linha_reserva, não é possível garantir
    // com segurança quais estados contam como "ocupado".
    //
    // Implementação conservadora:
    // considerar indisponível se existir alguma linha de reserva associada.

    const todasLinhasReserva = figurino.anuncio_escola.flatMap(anuncio => anuncio.linha_reserva);

    const disponivel = todasLinhasReserva.length === 0;

    return {
        id_figurino: figurino.id,
        disponivel: disponivel,
        total_anuncios_escola: figurino.anuncio_escola.length,
        total_linhas_reserva_associadas: todasLinhasReserva.length
    };
};


module.exports = {
    obterTodosFigurinos,
    obterFigurino,
    criarFigurino,
    atualizarFigurino,
    obterDisponibilidadeFigurino
};