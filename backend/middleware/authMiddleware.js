/**
 * ------------------------------------------------------------
 * File: authMiddleware.js
 * Author: Nelson Cruz
 * Date: 2026-03-29
 * Version: 1.0
 * Description:
 * Middleware de autenticação.
 * Verifica se o token JWT é válido antes de
 * permitir acesso a rotas protegidas.
 * ------------------------------------------------------------
 */

// Importar biblioteca JWT
const jwt = require("jsonwebtoken");


// Middleware de autenticação
const authMiddleware = (req, res, next) => {
    try {
        // Obter header Authorization
        const authHeader = req.headers.authorization;

        // Verificar se existe
        if (!authHeader) {
            return res.status(401).json({
                message: "Token não fornecido."
            });
        }

        // Separar Bearer e token
        const parts = authHeader.split(" ");

        // Validar formato
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Formato de token inválido."
            });
        }

        const token = parts[1];

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Guardar dados do utilizador no request
        req.user = decoded;

        // Passar para a próxima função
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Token inválido ou expirado."
        });
    }
};


// EXPORTAR FUNÇÃO
module.exports = authMiddleware;