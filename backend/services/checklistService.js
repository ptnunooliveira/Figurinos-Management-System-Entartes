/**
 * ------------------------------------------------------------
 * File: checklistService.js
 * Author: Nuno Oliveira
 * Date: 2026-04-20
 * Version: 1.0
 * 
 * Description:
 * Service responsável pela lógica de negócio das checklists.
 * Este ficheiro comunica diretamente com a base de dados
 * através do Prisma ORM.
 * Arquitetura: Route -> Middleware -> Controller -> Service -> Database
 * ------------------------------------------------------------
 */

// Importa o PrismaClient do pacote @prisma/client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

