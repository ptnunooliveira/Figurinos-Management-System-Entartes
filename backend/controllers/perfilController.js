/**
 * ------------------------------------------------------------
 * File: perfilController.js
 * Author: Nelson Cruz
 * Date: 2026-04-19
 * Version: 1.0
 * Description:
 * Controller responsavel por gerir pedidos relacionados com perfis.
 * ------------------------------------------------------------
 */

const perfilService = require("../services/perfilService");

const parseId = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const preencherDadosAluno = async (req, res) => {
    try {
        const idUtilizador = parseId(req.params.idUtilizador);
        const numeroaluno = parseId(req.body.numeroaluno);

        if (!idUtilizador) {
            return res.status(400).json({
                message: "Parametro idUtilizador invalido."
            });
        }

        if (!numeroaluno) {
            return res.status(400).json({
                message: "Campo numeroaluno e obrigatorio e deve ser numerico."
            });
        }

        const aluno = await perfilService.preencherDadosAluno(idUtilizador, numeroaluno);

        return res.status(200).json({
            message: "Dados do aluno guardados com sucesso.",
            aluno
        });

    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                message: "Utilizador nao encontrado."
            });
        }

        if (error.message === "USER_NOT_ALUNO") {
            return res.status(400).json({
                message: "O utilizador indicado nao tem perfil ALUNO."
            });
        }

        return res.status(500).json({
            message: "Erro ao guardar dados do aluno."
        });
    }
};

module.exports = {
    preencherDadosAluno
};
