/**
 * ------------------------------------------------------------
 * File: token.js
 * Author: Nelson Cruz
 * Date: 2026-03-29
 * Version: 1.0
 * Description:
 * Funções relacionadas com JWT.
 * Responsável por gerar tokens de autenticação.
 * ------------------------------------------------------------
 */

// Importar biblioteca JWT
const jwt = require("jsonwebtoken");


// Gerar token para utilizador
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            perfil: user.perfil
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d" // token válido por 1 dia
        }
    );
};


// EXPORTAR FUNÇÃO
module.exports = {
    generateToken
};