/**
 * ------------------------------------------------------------------------
 * File: auxiliaresRoutes.js
 * Author: Tiago Gonçalves
 * Date: 2026-03-30
 * Version: 1.0
 * Description:
 * Routes das tabelas auxiliares
 * ------------------------------------------------------------------------
 */

// Importar objetos
const express = require("express");
const route = express.Router();
const controller = require("../controllers/auxiliaresController");
const authMiddleware = require("../middleware/authMiddleware");
const perfilMiddleware = require("../middleware/perfilMiddleware");

// Definição das routes
// Rotas para categorias
route.get("/categorias", authMiddleware, controller.getCategorias);
route.post("/categorias", authMiddleware, perfilMiddleware("FUNCIONARIO"), controller.createCategoria);
route.get("/categorias/:nome", authMiddleware, controller.getCategoriaByNome);

// Rotas para Tipos de Figurino
route.get("/tipos-figurino", authMiddleware, controller.getTiposFigurino);
route.post("/tipos-figurino", authMiddleware, perfilMiddleware("FUNCIONARIO"), controller.createTipoFigurino);
route.get("/tipos-figurino/:tipofigurino", authMiddleware, controller.getTipoFigurinoByNome);

// Rotas para generos
route.get("/sexos", authMiddleware, controller.getSexos);
route.post("/sexos", authMiddleware, perfilMiddleware("FUNCIONARIO"), controller.createSexo);
route.get("/sexos/:genero", authMiddleware, controller.getSexoByNome);

// Rotas para acessórios
route.get("/acessorios", authMiddleware, controller.getAcessorios);
route.post("/acessorios", authMiddleware, perfilMiddleware("FUNCIONARIO"), controller.createAcessorio);
route.get("/acessorios/:nome", authMiddleware, controller.getAcessorioByNome);

// Rotas para estados de condição
route.get("/estados-condicao", authMiddleware, controller.getEstadosCondicao);
route.post("/estados-condicao", authMiddleware, perfilMiddleware("FUNCIONARIO"), controller.createEstadoCondicao);
route.get("/estados-condicao/:nome", authMiddleware, controller.getEstadoCondicaoByNome);

// Exportação do objeto route para ser utilizado no app.js
module.exports = route;
