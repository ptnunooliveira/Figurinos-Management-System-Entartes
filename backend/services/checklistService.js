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

    return novaChecklist;
};

module.exports = {
    obterChecklistPorID,
    obterChecklistReserva,
    criarChecklist
};