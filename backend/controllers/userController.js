/**
 * ------------------------------------------------------------
 * File: userController.js
 * Author: Nelson Cruz
 * Date: 2026-04-03
 * Version: 1.1
 * Description:
 * Controller das rotas de utilizadores.
 * Recebe os pedidos HTTP, delega a logica para o service e
 * traduz erros do dominio em codigos HTTP apropriados.
 * ------------------------------------------------------------
 */

const userService = require('../services/userService');


// LISTAR ALUNOS ATIVOS
// Endpoint usado, por exemplo, no carrinho/criacao de reservas.
const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao listar utilizadores.'
        });
    }
};


// LISTAR TODOS OS UTILIZADORES (AREA DE ADMIN)
// Devolve qualquer perfil e inclui suspensos para que o painel
// de administracao consiga reativa-los.
const getAllUsersAdmin = async (req, res) => {
    try {
        const users = await userService.getAllUsersAdmin();
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao listar utilizadores.'
        });
    }
};


// OBTER UTILIZADOR POR ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                message: 'Utilizador nao encontrado.'
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao obter utilizador.'
        });
    }
};


// ATUALIZAR UTILIZADOR (atualizacao parcial)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, password, ativo, contacto } = req.body;

        const updatedUser = await userService.updateUser(id, {
            nome,
            email,
            password,
            ativo,
            contacto
        });

        return res.status(200).json({
            message: 'Utilizador atualizado com sucesso.',
            user: updatedUser
        });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({
                message: 'Utilizador nao encontrado.'
            });
        }

        return res.status(500).json({
            message: 'Erro ao atualizar utilizador.'
        });
    }
};


// DESATIVAR UTILIZADOR (FUNCIONARIO ou ADMIN)
// Suspensao logica: o registo NAO e apagado, apenas ativo = false.
// Combinado com o authMiddleware, o utilizador perde acesso ao
// sistema no proximo pedido autenticado que fizer.
//
// Regras (validadas no service):
//  - ADMIN pode desativar qualquer perfil (excepto a propria conta).
//  - FUNCIONARIO so pode desativar utilizadores com perfil ALUNO.
const disableUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Salvaguarda extra: impedir o utilizador autenticado de
        // se desativar a si proprio (ficaria sem forma de voltar
        // a entrar no painel).
        if (req.user && Number(req.user.id) === Number(id)) {
            return res.status(400).json({
                message: 'Nao pode desativar a sua propria conta.'
            });
        }

        const disabledUser = await userService.disableUser(id, {
            actorPerfil: req.user?.perfil
        });

        return res.status(200).json({
            message: 'Utilizador desativado com sucesso.',
            user: disabledUser
        });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({
                message: 'Utilizador nao encontrado.'
            });
        }

        if (error.message === 'FORBIDDEN_TARGET') {
            return res.status(403).json({
                message: 'Sem permissao para atuar sobre este utilizador.'
            });
        }

        return res.status(500).json({
            message: 'Erro ao desativar utilizador.'
        });
    }
};


// REATIVAR UTILIZADOR (FUNCIONARIO ou ADMIN)
// Operacao simetrica de disableUser: coloca ativo = true.
// Aplica as mesmas regras de quem pode atuar sobre quem.
const enableUser = async (req, res) => {
    try {
        const { id } = req.params;

        const enabledUser = await userService.enableUser(id, {
            actorPerfil: req.user?.perfil
        });

        return res.status(200).json({
            message: 'Utilizador reativado com sucesso.',
            user: enabledUser
        });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({
                message: 'Utilizador nao encontrado.'
            });
        }

        if (error.message === 'FORBIDDEN_TARGET') {
            return res.status(403).json({
                message: 'Sem permissao para atuar sobre este utilizador.'
            });
        }

        return res.status(500).json({
            message: 'Erro ao reativar utilizador.'
        });
    }
};


module.exports = {
    getAllUsers,
    getAllUsersAdmin,
    getUserById,
    updateUser,
    disableUser,
    enableUser
};
