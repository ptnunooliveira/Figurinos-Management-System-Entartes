/**
 * ------------------------------------------------------------
 * File: userService.js
 * Author: Nelson Cruz
 * Date: 2026-04-03
 * Version: 1.0
 * Description:
 * Service responsável pela lógica de negócio associada aos
 * utilizadores (CRUD), incluindo validações e encriptação
 * de passwords.
 * ------------------------------------------------------------
 */

const bcrypt = require('bcrypt');

const prisma = require('../prisma/client');


// LISTAR UTILIZADORES (apenas ativos)
const getAllUsers = async () => {
    return await prisma.utilizador.findMany({
        where: { ativo: true }, // Evita devolver utilizadores desativados
        select: {
            id: true,
            nome: true,
            email: true,
            contacto: true,
            ativo: true,
            data_registo: true
        },
        orderBy: { id: 'asc' }
    });
};


// OBTER UTILIZADOR POR ID
const getUserById = async (id) => {
    return await prisma.utilizador.findUnique({
        where: { id: Number(id) },
        select: {
            id: true,
            nome: true,
            email: true,
            contacto: true,
            ativo: true,
            data_registo: true
        }
    });
};


// ATUALIZAR UTILIZADOR
const updateUser = async (id, data) => {
    const userId = Number(id);

    // Verifica se utilizador existe
    const existingUser = await prisma.utilizador.findUnique({
        where: { id: userId }
    });

    if (!existingUser) throw new Error('USER_NOT_FOUND');

    // Validar email duplicado
    if (data.email) {
        const emailExists = await prisma.utilizador.findFirst({
            where: {
                email: data.email,
                NOT: { id: userId }
            }
        });

        if (emailExists) throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const updateData = {};

    // Atualização parcial (só altera o que vem no body)
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.contacto !== undefined) updateData.contacto = data.contacto;
    if (data.ativo !== undefined) updateData.ativo = data.ativo;

    // Se vier password nova → encriptar antes de guardar
    if (data.password && data.password.trim() !== '') {
        updateData.pw_hashed = await bcrypt.hash(data.password, 10);
    }

    return await prisma.utilizador.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            nome: true,
            email: true,
            contacto: true,
            ativo: true,
            data_registo: true
        }
    });
};


// DESATIVAR UTILIZADOR (delete lógico)
const disableUser = async (id) => {
    const userId = Number(id);

    // Verifica existência
    const existingUser = await prisma.utilizador.findUnique({
        where: { id: userId }
    });

    if (!existingUser) throw new Error('USER_NOT_FOUND');

    // Em vez de apagar → ativo = false
    return await prisma.utilizador.update({
        where: { id: userId },
        data: { ativo: false },
        select: {
            id: true,
            nome: true,
            email: true,
            contacto: true,
            ativo: true,
            data_registo: true
        }
    });
};


module.exports = {
    getAllUsers,
    getUserById,
    updateUser,
    disableUser
};
