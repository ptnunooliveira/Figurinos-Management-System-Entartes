/**
 * ------------------------------------------------------------
 * File: userRoutes.js
 * Author: Nelson Cruz
 * Date: 2026-04-03
 * Version: 1.1
 * Description:
 * Definicao das rotas relacionadas com utilizadores.
 *
 * Estrutura:
 *  - GET  /users               -> alunos ativos (uso geral)
 *  - GET  /users/admin/todos   -> listagem completa (FUNCIONARIO ou ADMIN)
 *  - GET  /users/:id           -> detalhes de um utilizador
 *  - PUT  /users/:id           -> atualizacao parcial
 *  - PATCH /users/:id/desativar -> suspende (ativo = false)  [FUNCIONARIO/ADMIN, ver regras]
 *  - PATCH /users/:id/ativar    -> reativa  (ativo = true)   [FUNCIONARIO/ADMIN, ver regras]
 *  - DELETE /users/:id         -> alias historico de desativar [FUNCIONARIO/ADMIN]
 *
 * Regras de negocio adicionais (validadas no service):
 *  - ADMIN pode desativar/reativar qualquer perfil (excepto a propria conta).
 *  - FUNCIONARIO so pode desativar/reativar utilizadores com perfil ALUNO.
 * ------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const perfilMiddleware = require("../middleware/perfilMiddleware");


// LISTAR ALUNOS ATIVOS (funcionario e admin)
// Mantem o comportamento original: so devolve alunos ativos para
// uso em formularios (carrinho, criacao de reservas, etc.).
router.get(
    "/",
    authMiddleware,
    perfilMiddleware(['FUNCIONARIO', 'ADMIN']),
    userController.getAllUsers
);


// LISTAR TODOS OS UTILIZADORES (FUNCIONARIO ou ADMIN)
// Endpoint dedicado ao painel de administracao: inclui qualquer
// perfil e tambem utilizadores suspensos (ativo = false).
// O acesso e' partilhado entre admins e funcionarios; as regras
// de quem pode actuar sobre quem sao validadas no service.
router.get(
    "/admin/todos",
    authMiddleware,
    perfilMiddleware(['FUNCIONARIO', 'ADMIN']),
    userController.getAllUsersAdmin
);


// OBTER UTILIZADOR POR ID
router.get('/:id', authMiddleware, userController.getUserById);


// ATUALIZAR UTILIZADOR (atualizacao parcial)
router.put('/:id', authMiddleware, userController.updateUser);


// DESATIVAR UTILIZADOR (FUNCIONARIO ou ADMIN)
// Suspensao logica: ativo = false. NAO apaga o registo da BD.
// O service garante que um FUNCIONARIO so pode desativar ALUNOS.
router.patch(
    "/:id/desativar",
    authMiddleware,
    perfilMiddleware(['FUNCIONARIO', 'ADMIN']),
    userController.disableUser
);


// REATIVAR UTILIZADOR (FUNCIONARIO ou ADMIN)
// Operacao simetrica: ativo = true.
// O service garante que um FUNCIONARIO so pode reativar ALUNOS.
router.patch(
    "/:id/ativar",
    authMiddleware,
    perfilMiddleware(['FUNCIONARIO', 'ADMIN']),
    userController.enableUser
);


// ALIAS HISTORICO: DELETE /:id continua a funcionar como
// "desativar". Aplica as mesmas regras do PATCH /:id/desativar.
router.delete(
    "/:id",
    authMiddleware,
    perfilMiddleware(['FUNCIONARIO', 'ADMIN']),
    userController.disableUser
);


module.exports = router;
