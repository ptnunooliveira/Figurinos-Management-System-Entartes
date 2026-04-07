/**
 * ------------------------------------------------------------
 * File: auth.service.js
 * Author: Nelson Cruz
 * Date: 2026-04-03
 * Version: 1.0
 * Description:
 * Service responsável pela lógica de autenticação.
 * Aqui tratamos da criação de utilizadores,
 * validação de login e obtenção do utilizador autenticado.
 * ------------------------------------------------------------
 */

// Importar utils
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/token");

// Importar Prisma
const prisma = require("../prisma/client");

// REGISTAR UTILIZADOR
const register = async ({ nome, email, password }) => {
    // Verificar se já existe utilizador com este email
    const existingUser = await prisma.utilizador.findUnique({
        where: {
            email: email
        }
    });

    if (existingUser) {
        throw new Error("Já existe um utilizador com este email.");
    }

    // Criar hash da password
    const hashedPassword = await hashPassword(password);

    // Criar utilizador na base de dados
    const newUser = await prisma.utilizador.create({
        data: {
            nome: nome,
            email: email,
            pw_hashed: hashedPassword,
            perfil: "ALUNO", // perfil padrão
            ativo: true
        }
    });

    return {
        message: "Utilizador registado com sucesso.",
        user: {
            id: newUser.id,
            nome: newUser.nome,
            email: newUser.email,
            perfil: newUser.perfil
        }
    };
};

// LOGIN
const login = async ({ email, password }) => {
    // Procurar utilizador pelo email
    const user = await prisma.utilizador.findUnique({
        where: {
            email: email
        }
    });

    // Verificar se o utilizador existe
    if (!user) {
        throw new Error("Credenciais inválidas.");
    }

    // Verificar se o utilizador está ativo
    if (!user.ativo) {
        throw new Error("Utilizador inativo.");
    }

    // Comparar password recebida com a password guardada
    const isMatch = await comparePassword(password, user.pw_hashed);

    if (!isMatch) {
        throw new Error("Credenciais inválidas.");
    }

    // Gerar token
    const token = generateToken(user);

    return {
        message: "Login efetuado com sucesso.",
        token
    };
};

// OBTER UTILIZADOR AUTENTICADO
const getMe = async (userId) => {
    // Procurar utilizador na base de dados
    const user = await prisma.utilizador.findUnique({
        where: {
            id: userId
        }
    });

    // Verificar se existe
    if (!user) {
        throw new Error("Utilizador não encontrado.");
    }

    return {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil
    };
};

// EXPORTAR FUNÇÕES
module.exports = {
    register,
    login,
    getMe
};