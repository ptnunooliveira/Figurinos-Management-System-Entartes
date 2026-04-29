/**
 * ------------------------------------------------------------
 * File: auth.controller.js
 * Author: Nelson Cruz
 * Date: 2026-03-29
 * Version: 1.0
 * Description:
 * Controller responsável pela autenticação.
 * Recebe os pedidos HTTP, chama o service
 * e devolve as respostas ao cliente.
 * ------------------------------------------------------------
 */

// Importar service de autenticação
const authService = require("../services/authService");


// REGISTAR UTILIZADOR

const register = async (req, res) => {
    try {
        // Obter dados enviados no body
        const { nome, email, password, perfil } = req.body;

        // Validação básica dos campos obrigatórios
        if (!nome || !email || !password || !perfil) {
            return res.status(400).json({
                message: "Nome, email e password são obrigatórios."
            });
        }

        // Chamar o service para registar utilizador
        const result = await authService.register({
            nome,
            email,
            password,
            perfil,
            perfilCriador: req.user.perfil
        });

        // Devolver resposta de sucesso
        return res.status(201).json(result);

        } catch (error) {
        if (error.code === "INVALID_PROFILE") {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.code === "FORBIDDEN_PROFILE_CREATION") {
            return res.status(403).json({
                message: error.message
            });
        }

        if (error.code === "EMAIL_ALREADY_EXISTS") {
            return res.status(409).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: error.message || "Erro ao registar utilizador."
        });
    }
};


// LOGIN DE UTILIZADOR

const login = async (req, res) => {
    try {
        // Obter dados enviados no body
        const { email, password } = req.body || {};

        // Validação básica dos campos obrigatórios
        if (!email || !password) {
            return res.status(400).json({
                message: "Email e password são obrigatórios."
            });
        }

        // Chamar o service para fazer login
        const result = await authService.login({ email, password });

        // Devolver resposta de sucesso
        return res.status(200).json(result);

    } catch (error) {
        if (error.code === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                message: error.message
            });
        }

        if (error.code === "INACTIVE_USER") {
            return res.status(403).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: error.message || "Erro ao fazer login."
        });
    }
};


// OBTER UTILIZADOR AUTENTICADO

const me = async (req, res) => {
    try {
                // O utilizador autenticado vem do middleware
        const userId = req.user.id;

        // Chamar o service para obter os dados do utilizador
        const result = await authService.getMe(userId);

        // Devolver resposta de sucesso
        return res.status(200).json(result);

        } catch (error) {
        return res.status(500).json({
            message: error.message || "Erro ao obter dados do utilizador."
        });
    }
};


// EXPORTAR FUNÇÕES 

module.exports = {
    register,
    login,
    me
};
