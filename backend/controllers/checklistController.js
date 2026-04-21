/**
 * ------------------------------------------------------------
 * File: checklistController.js
 * Author: Nuno Oliveira
 * Date: 2026-04-20
 * Version: 1.0
 * 
 * Description:
 * Controller responsável por gerir as operações relacionadas
 * com as checklists. Recebe os pedidos HTTP das routes e delega
 * a lógica de negócio ao service.
 * Arquitetura: Route -> Middleware -> Controller -> Service
 * ------------------------------------------------------------
 */

const checklistService = require('../services/checklistService.js');


/////////////////////////////////////////////////////////////////////////////////
//                                  READ                                       //
/////////////////////////////////////////////////////////////////////////////////

const obterChecklistPorID = async (req, res) => {

    try {

        const idChecklist = parseInt(req.params.id);

        if(isNaN(idChecklist)){

            return res.status(400).json({ erro: "O ID da Checklist tem de ser um número." });
        }

        const checklist = await checklistService.obterChecklistPorID(idChecklist);

        if(!checklist){

            return res.status(404).json({ erro: "Checklist não encontrada" });
        }

        return res.status(200).json(checklist);

    } catch(erro){

        console.error("Erro ao obter detalhes da checklist.", erro);
        return res.status(500).json({ erro: "Erro interno ao procurar checklist." });
    }
};

const obterChecklistReserva = async (req, res) => {

    try {

        const idReserva = parseInt(req.params.id);

        if(isNaN(idReserva)){

            return res.status(400).json({ erro: "O ID da Reserva tem de ser um número." });
        }

        const checklists = await checklistService.obterChecklistReserva(idReserva);

        return res.status(200).json(checklists);

    } catch(erro){

        console.error("Erro ao obter as Checklists.", erro);
        return res.status(500).json({ erro: "Erro interno ao procurar checklists." });
    }
};


/////////////////////////////////////////////////////////////////////////////////
//                                  CREATE                                     //
/////////////////////////////////////////////////////////////////////////////////


const criarChecklist = async (req, res) => {

    try {

        const idFuncionario = req.user.id;

        const {

            id_reserva,
            id_tipo_checklist,
            assinaturaFuncionario,
            assinaturaEncarregado,
            itens
        } = req.body;

        if (!id_tipo_checklist || !id_reserva) {

            return res.status(400).json({ erro: "Os campos id_tipo_checklist e id_reserva são obrigatórios." });
        }

        if(!itens || !Array.isArray(itens) || itens.length === 0){

            return res.status(400).json({ erro: "A checklist tem de conter pelo menos um item." });
        }

        const dadosChecklist = {

            id_reserva: parseInt(id_reserva),
            id_tipo_checklist: parseInt(id_tipo_checklist),
            assinaturafuncionario: assinaturaFuncionario,
            assinaturaencarregado: assinaturaEncarregado,
            itens
        };

        const checklist = await checklistService.criarChecklist(idFuncionario, dadosChecklist);

        return res.status(201).json(checklist);

    } catch(erro){

        console.error("Erro ao criar checklist:", erro);
        
        // Apanha os erros de lógica de negócio lançados pelo Service
        if (erro.status) {
            return res.status(erro.status).json({ erro: erro.message });
        }

        return res.status(500).json({ erro: "Erro interno ao processar a checklist." });
    }
};

module.exports = {
    obterChecklistPorID,
    obterChecklistReserva,
    criarChecklist
};