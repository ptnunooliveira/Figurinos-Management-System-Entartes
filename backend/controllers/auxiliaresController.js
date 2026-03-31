/**
 * ------------------------------------------------------------------------
 * File: auxiliaresController.js
 * Author: Tiago Gonçalves
 * Date: 2026-03-30
 * Version: 1.0
 * Description:
 * Controller para as tabelas auxiliares
 * ------------------------------------------------------------------------
 */

// Importar o cliente Prisma conforme definido no generator
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/categorias
exports.getCategorias = async (req, res) => {
  try {
    const data = await prisma.categoria.findMany({
      orderBy: { nomecategoria: 'asc' }
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar categorias" });
  }
};

// GET /api/tipos-figurino
exports.getTiposFigurino = async (req, res) => {
  try {
    const data = await prisma.tipo_figurino.findMany({
      orderBy: { nome: 'asc' }
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar tipos de figurino" });
  }
};

// GET /api/sexos
exports.getSexos = async (req, res) => {
  try {
    const data = await prisma.sexo.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar sexos" });
  }
};

// GET /api/acessorios
exports.getAcessorios = async (req, res) => {
  try {
    const data = await prisma.acessorio.findMany({
      orderBy: { nome: 'asc' }
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar acessórios" });
  }
};

// GET /api/estados-condicao
exports.getEstadosCondicao = async (req, res) => {
  try {
    const data = await prisma.estado_condicao.findMany();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Erro ao procurar estados de condição" });
  }
};