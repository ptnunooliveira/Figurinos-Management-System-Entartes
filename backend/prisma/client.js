/**
 * File: client.js
 * Author: Nelson Cruz
 * Date: 2026-04-03
 * Version: 1.0
 * Description:
 * Instância do Prisma Client.
 */

// Importar Prisma Client
const { PrismaClient } = require("@prisma/client");

// Criar instância
const prisma = new PrismaClient();

// EXPORTAR
module.exports = prisma;