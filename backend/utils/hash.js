/**
 * ------------------------------------------------------------
 * File: hash.js
 * Author: Nelson Cruz
 * Date: 2026-03-29
 * Version: 1.0
 * Description:
 * Funções para tratar passwords.
 * Faz hash e comparação usando bcrypt.
 * ------------------------------------------------------------
 */

// Importar bcrypt
const bcrypt = require("bcrypt");


// Criar hash da password
const hashPassword = async (password) => {
    // 10 = número de rounds (segurança vs performance)
    return await bcrypt.hash(password, 10);
};


// Comparar password com hash guardado
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};


// EXPORTAR FUNÇÕES
module.exports = {
    hashPassword,
    comparePassword
};