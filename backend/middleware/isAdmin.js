/**
 * ------------------------------------------------------------
 * File: isAdmin.js
 * Author: Nelson Cruz
 * Date: 2026-04-03
 * Version: 1.0
 * Description:
 * Middleware responsável por permitir acesso apenas a
 * utilizadores com perfil de administrador.
 * ------------------------------------------------------------
 */


// VALIDAR SE O UTILIZADOR É ADMIN
const isAdmin = (req, res, next) => {

    // Verifica se existe utilizador autenticado e se tem perfil admin
    if (!req.user || req.user.perfil !== "admin") {
        return res.status(403).json({
            message: "Acesso negado. Apenas administradores podem executar esta ação."
        });
    }

    next();
};


// EXPORTAR MIDDLEWARE
module.exports = isAdmin;