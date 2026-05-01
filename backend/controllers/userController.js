const userService = require('../services/userService');

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

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                message: 'Utilizador não encontrado.'
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            message: 'Erro ao obter utilizador.'
        });
    }
};

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
                message: 'Utilizador não encontrado.'
            });
        }

        if (error.message === 'EMAIL_ALREADY_EXISTS') {
            return res.status(409).json({
                message: 'Já existe um utilizador com esse email.'
            });
        }

        return res.status(500).json({
            message: 'Erro ao atualizar utilizador.'
        });
    }
};

const disableUser = async (req, res) => {
    try {
        const { id } = req.params;

        const disabledUser = await userService.disableUser(id);

        return res.status(200).json({
            message: 'Utilizador desativado com sucesso.',
            user: disabledUser
        });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({
                message: 'Utilizador não encontrado.'
            });
        }

        return res.status(500).json({
            message: 'Erro ao desativar utilizador.'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    disableUser
};