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
const register = async ({ nome, email, password, perfil, perfilCriador }) => {
    const perfilNormalizado = typeof perfil === "string" ? perfil.trim().toUpperCase() : "";
    const perfisValidos = ["ALUNO", "FUNCIONARIO", "ADMIN"];

    if (!perfilNormalizado || !perfisValidos.includes(perfilNormalizado)) {
        const error = new Error("Perfil invalido.");
        error.code = "INVALID_PROFILE";
        throw error;
    }

    if (perfilCriador === "FUNCIONARIO" && perfilNormalizado !== "ALUNO") {
        const error = new Error("Funcionarios apenas podem criar utilizadores com perfil ALUNO.");
        error.code = "FORBIDDEN_PROFILE_CREATION";
        throw error;
    }

    if (perfilCriador !== "ADMIN" && perfilNormalizado !== "ALUNO") {
        const error = new Error("Apenas administradores podem criar utilizadores com perfis privilegiados.");
        error.code = "FORBIDDEN_PROFILE_CREATION";
        throw error;
    }

    const existingUser = await prisma.utilizador.findUnique({
        where: { email }
    });

    if (existingUser) {
        const error = new Error("Ja existe um utilizador com este email.");
        error.code = "EMAIL_ALREADY_EXISTS";
        throw error;
    }

    const hashedPassword = await hashPassword(password);

    // Criar utilizador na base de dados
    const newUser = await prisma.utilizador.create({
        data: {
            nome,
            email,
            pw_hashed: hashedPassword,
            perfil: perfilNormalizado,
            ativo: true
        }
    });

    return {
        message: "Utilizador registado com sucesso.",
        user: {
            id: newUser.id,
            nome: newUser.nome,
            email: newUser.email,
            perfil: newUser.perfil,
            ativo: newUser.ativo
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
