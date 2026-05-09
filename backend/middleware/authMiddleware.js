/**
 * ------------------------------------------------------------
 * File: authMiddleware.js
 * Author: Nelson Cruz
 * Date: 2026-03-29
 * Version: 2.0
 * Description:
 * Middleware de autenticacao.
 *
 * Valida o token JWT enviado pelo cliente e, se for valido,
 * confirma na base de dados que o utilizador associado ao token
 * ainda existe e continua com o estado "ativo = true".
 *
 * Esta confirmacao permite que a suspensao de um utilizador
 * pelo administrador (campo "ativo" = false) tenha efeito imediato:
 * mesmo que o utilizador suspenso ainda tenha um JWT valido em
 * cache, o pedido sera bloqueado com 403.
 *
 * Apenas sao lidos os campos id, perfil e ativo para reduzir o
 * impacto de performance desta verificacao por pedido.
 * ------------------------------------------------------------
 */

// Biblioteca para validar tokens JWT
const jwt = require("jsonwebtoken");

// Cliente Prisma partilhado
const prisma = require("../prisma/client");


/**
 * Middleware de autenticacao.
 * Encadeia duas validacoes:
 *   1) Assinatura/expiracao do JWT (jwt.verify)
 *   2) Estado atual do utilizador na BD (existe e ativo === true)
 */
const authMiddleware = async (req, res, next) => {
    try {
        // 1) Obter o header Authorization e validar o seu formato
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Token nao fornecido."
            });
        }

        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Formato de token invalido."
            });
        }

        const token = parts[1];

        // 2) Validar a assinatura/expiracao do token e extrair o payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Confirmar na base de dados o estado actual do utilizador.
        //    Mesmo que o JWT esteja valido, o utilizador pode ter sido
        //    suspenso pelo administrador (ativo = false) ou eliminado.
        //    O select e propositadamente reduzido aos campos minimos
        //    necessarios para nao pesar em cada pedido autenticado.
        const utilizadorAtual = await prisma.utilizador.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                perfil: true,
                ativo: true
            }
        });

        if (!utilizadorAtual) {
            // O utilizador desapareceu da BD apos a emissao do token
            return res.status(403).json({
                message: "Utilizador nao encontrado. Acesso negado."
            });
        }

        if (utilizadorAtual.ativo !== true) {
            // Suspensao logica feita pelo admin: ativo = false
            return res.status(403).json({
                message: "Conta desativada. Contacte o administrador."
            });
        }

        // 4) Disponibilizar para os controllers a informacao do
        //    utilizador autenticado, dando prioridade aos valores da
        //    BD (perfil/ativo) por serem a fonte de verdade actualizada.
        req.user = {
            ...decoded,
            id: utilizadorAtual.id,
            perfil: utilizadorAtual.perfil,
            ativo: utilizadorAtual.ativo
        };

        // 5) Prosseguir para o middleware/route seguinte
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Token invalido ou expirado."
        });
    }
};


// Exportar middleware
module.exports = authMiddleware;
