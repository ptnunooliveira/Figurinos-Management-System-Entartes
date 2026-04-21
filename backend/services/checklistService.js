/**
 * ------------------------------------------------------------
 * File: checklistService.js
 * Author: Nuno Oliveira
 * Date: 2026-04-20
 * Version: 1.0
 * 
 * Description:
 * Service responsável pela lógica de negócio das checklists.
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

const obterChecklistPorID = async (idChecklist) => {

    const checklist = await prisma.checklist.findUnique({
        where: { id: idChecklist },
        include: {
            tipo_checklist: true,
            checklist_item: {
                include: { 
                    estado_condicao: true,
                    figurino: true
                }
            }
        }
    });

    return checklist;
}

const obterChecklistReserva = async (idReserva) => {

    const checklists = await prisma.checklist.findMany({
        where: { id_reserva: idReserva },
        include: {
            tipo_checklist: true,
            checklist_item: {
                include: {
                    estado_condicao: true,
                    figurino: true
                }
            }
        },
        orderBy: {
            dataassinatura: 'asc'
        }
    });

    return checklists;
}

/////////////////////////////////////////////////////////////////////////////////
//                                  CREATE                                     //
/////////////////////////////////////////////////////////////////////////////////

const criarChecklist = async (idFuncionario, dadosChecklist) => {

    const reservaExiste = await prisma.reserva.findUnique({
        where: { id: dadosChecklist.id_reserva}
    });

    if(!reservaExiste){

        const erro = new Error("A reserva indicada não existe.");
        erro.status = 404;
        throw erro;
    }

    const novaChecklist = await prisma.checklist.create({

        data: {
            dataassinatura: new Date(),
            id_reserva: dadosChecklist.id_reserva,
            id_funcionario: idFuncionario,
            id_tipo_checklist: dadosChecklist.id_tipo_checklist,
            assinaturaencarregado: dadosChecklist.assinaturaencarregado,
            assinaturafuncionario: dadosChecklist.assinaturafuncionario,

            checklist_item: {
                create: dadosChecklist.itens.map((item) => {
                    return {
                        idfigurino: parseInt(item.idfigurino),
                        id_estado: parseInt(item.id_estado),
                        observacoes: item.observacoes || null
                    };
                })
            }
        },

        include: {
            checklist_item: true
        }
    });

    // Checklist de levantamento
    if(dadosChecklist.id_tipo_checklist === 1){

        const ID_ESTADO_RESERVA_EM_CURSO = 3;
        const ID_ESTADO_LINHA_EM_CURSO = 3;

        await prisma.linha_reserva.updateMany({
            where: { id_reserva: dadosChecklist.id_reserva },
            data: { id_estado_linha_reserva: ID_ESTADO_LINHA_EM_CURSO }
        });

        await prisma.reserva.update({
            where: {id: dadosChecklist.id_reserva },
            data: {
                id_estado: ID_ESTADO_RESERVA_EM_CURSO,
                id_funcionario: idFuncionario
            }
        });

        console.log(`Automação: Reserva ${dadosChecklist.id_reserva} passou a EM CURSO.`);
    }

    // Checklist de devolução
    if(dadosChecklist.id_tipo_checklist === 2){

        const ID_ESTADO_RESERVA_CONCLUIDA = 4;
        const ID_ESTADO_LINHA_CONCLUIDA = 4;

        for(const item of dadosChecklist.itens){

            const linhaPendente = await prisma.linha_reserva.findFirst({
                where: {
                    id_reserva: dadosChecklist.id_reserva,
                    id_estado_linha_reserva: { not: ID_ESTADO_LINHA_CONCLUIDA}
                }
            });

            if(linhaPendente){

                await prisma.linha_reserva.update({
                    where: { id: linhaPendente.id },
                    data: { id_estado_linha_reserva: ID_ESTADO_LINHA_CONCLUIDA }
                });
            }
        }

        const todasAsLinhas = await prisma.linha_reserva.findMany({
            where: { id_reserva: dadosChecklist.id_reserva },
            select: { id_estado_linha_reserva: true }
        });

        const tudoDevolvido = todasAsLinhas.every((linha) =>
            linha.id_estado_linha_reserva === ID_ESTADO_LINHA_CONCLUIDA
        );

        if(tudoDevolvido){
            await prisma.reserva.update({
                where: { id: dadosChecklist.id_reserva },
                data: {
                    id_estado: ID_ESTADO_RESERVA_CONCLUIDA,
                    id_funcionario: idFuncionario
                }
            });

            console.log(`Reserva ${dadosChecklist.id_reserva} concluída com sucesso!`);
        }
        else{

            console.log(`Reserva ${dadosChecklist.id_reserva} continua em curso (Devolução Parcial).`);
        }

    }

    return novaChecklist;
};

module.exports = {
    obterChecklistPorID,
    obterChecklistReserva,
    criarChecklist
};