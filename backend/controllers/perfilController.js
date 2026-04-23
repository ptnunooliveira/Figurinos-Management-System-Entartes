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
                message: "Campo numeroaluno é obrigatório e deve ser numérico."
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

// Controller responsavel pelo pedido PATCH /perfis/funcionarios/:idUtilizador.
// Valida os dados recebidos no HTTP e depois chama o service.
const preencherDadosFuncionario = async (req, res) => {
    try {
        // O id do utilizador vem na URL.
        // Exemplo: /perfis/funcionarios/2
        const idUtilizador = parseId(req.params.idUtilizador);

        // O numero mecanografico vem no body e deve ser um numero inteiro positivo.
        const n_mecanografico = parseId(req.body.n_mecanografico);

        // O cargo vem no body como texto.
        // O trim remove espacos antes e depois para evitar guardar " Diretor ".
        const cargo = typeof req.body.cargo === "string" ? req.body.cargo.trim() : "";

        if (!idUtilizador) {
            return res.status(400).json({
                message: "Parametro idUtilizador invalido."
            });
        }

        if (!n_mecanografico) {
            return res.status(400).json({
                message: "Campo n_mecanografico e obrigatorio e deve ser numerico."
            });
        }

        if (!cargo) {
            return res.status(400).json({
                message: "Campo cargo e obrigatorio."
            });
        }

        // Depois das validacoes basicas, chamamos o service.
        // O service confirma se o utilizador existe e se tem perfil FUNCIONARIO.
        const funcionario = await perfilService.preencherDadosFuncionario(
            idUtilizador,
            n_mecanografico,
            cargo
        );

        return res.status(200).json({
            message: "Dados do funcionario guardados com sucesso.",
            funcionario
        });

    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                message: "Utilizador nao encontrado."
            });
        }

        if (error.message === "USER_NOT_FUNCIONARIO") {
            return res.status(400).json({
                message: "O utilizador indicado nao tem perfil FUNCIONARIO."
            });
        }

        return res.status(500).json({
            message: "Erro ao guardar dados do funcionario."
        });
    }
};

module.exports = {
    preencherDadosAluno,
    preencherDadosFuncionario
};
