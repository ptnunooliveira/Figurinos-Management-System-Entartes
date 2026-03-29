/**
 * ------------------------------------------------------------
 * File: auth.service.js
 * Author: Nelson Cruz
 * Date: 2026-03-29
 * Version: 1.0
 * Description:
 * Service responsável pela lógica de autenticação.
 * Aqui tratamos da criação de utilizadores,
 * validação de login e geração de token.
 * ------------------------------------------------------------
 */

// Importar utils
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/token");

// (FUTURO) Importar Prisma
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();


// ------------------------------------------------------------
// REGISTAR UTILIZADOR
// ------------------------------------------------------------

const register = async ({ nome, email, password }) => {

    // FUTURO:
    // verificar se já existe utilizador com este email

    // Criar hash da password
    const hashedPassword = await hashPassword(password);

    // FUTURO:
    // guardar utilizador na base de dados com Prisma

    // Simular utilizador criado (temporário)
    const user = {
        id: 1,
        nome,
        email,
        pw_hashed: hashedPassword
    };

    return {
        message: "Utilizador registado com sucesso.",
        user: {
            id: user.id,
            nome: user.nome,
            email: user.email
        }
    };
};


// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------

const login = async ({ email, password }) => {

    // FUTURO:
    // procurar utilizador na base de dados pelo email

    // Simular utilizador (temporário)
    const user = {
        id: 1,
        nome: "Utilizador Teste",
        email: email,
        pw_hashed: await hashPassword("123456") // password simulada
    };

    // Comparar password
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


// ------------------------------------------------------------
// OBTER UTILIZADOR AUTENTICADO
// ------------------------------------------------------------

const getMe = async (userId) => {

    // FUTURO:
    // ir buscar utilizador à base de dados

    // Simular utilizador
    return {
        id: userId,
        nome: "Utilizador Teste",
        email: "teste@email.com"
    };
};


// EXPORTAR FUNÇÕES
module.exports = {
    register,
    login,
    getMe
};