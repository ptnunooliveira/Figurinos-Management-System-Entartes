/**
 * ------------------------------------------------------------
 * File: perfilMiddleware.js
 * Author: Nuno Oliveira
 * Description: Middleware de Autorização.
 * Verifica se o utilizador autenticado possui o perfil
 * necessário para aceder a uma determinada rota.
 * ------------------------------------------------------------
 */

const verificarPerfil = (perfilPermitido) => {

    const perfisPermitidos = Array.isArray(perfilPermitido) ? perfilPermitido : [perfilPermitido];
    
    return (req, res, next) => {
        
        if (!req.user || !req.user.perfil) {
            return res.status(401).json({
                erro: "Falha de identificação. O teu perfil não foi encontrado no token."
            });
        }

        // Compara o perfil do token com o perfil exigido pela rota
        if (!perfisPermitidos.includes(req.user.perfil)) {

            return res.status(403).json({ erro: `Acesso negado. Ação exclusiva para o perfil: ${perfilPermitido}.` });
        }

        next();
    };
};

module.exports = verificarPerfil;