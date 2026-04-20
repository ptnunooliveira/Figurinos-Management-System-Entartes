/**
 * ------------------------------------------------------------
 * File: figurinoController.js
 * Author: Nelson Cruz
 * Date: 2026-04-20
 * Version: 1.0
 * Description:
 * Controller responsavel por gerir pedidos relacionados com figurinos.
 * ------------------------------------------------------------
 */

const figurinoService = require("../services/figurinoService");

// Adicionado Nelson em 20-04-2026: converte parametros/body para IDs inteiros positivos.
const parseId = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

// Adicionado Nelson em 20-04-2026: controller do POST /figurinos/:id/acessorios.
const associarAcessorio = async (req, res) => {
    try {
        const idFigurino = parseId(req.params.id);
        const idAcessorio = parseId(req.body.id_acessorio ?? req.body.idAcessorio);

        if (!idFigurino) {
            return res.status(400).json({
                message: "Parametro id do figurino invalido."
            });
        }

        if (!idAcessorio) {
            return res.status(400).json({
                message: "Campo id_acessorio e obrigatorio e deve ser numerico."
            });
        }

        const associacao = await figurinoService.associarAcessorio(idFigurino, idAcessorio);

        return res.status(201).json({
            message: "Acessorio associado ao figurino com sucesso.",
            associacao
        });
    } catch (error) {
        if (error.code === "INVALID_ID") {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.code === "FIGURINO_NOT_FOUND") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.code === "ACESSORIO_NOT_FOUND") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.code === "ASSOCIATION_ALREADY_EXISTS" || error.code === "P2002") {
            return res.status(409).json({
                message: "Acessorio ja associado ao figurino."
            });
        }

        return res.status(500).json({
            message: "Erro ao associar acessorio ao figurino."
        });
    }
};

module.exports = {
    associarAcessorio
};
