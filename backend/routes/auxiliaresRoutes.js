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

// Definição das routes
route.get("/categorias", controller.getCategorias);
route.post("/categorias", controller.createCategoria);
route.get("/categorias/:nome", controller.getCategoriaByNome);
route.get("/tipos-figurino", controller.getTiposFigurino);
route.get("/sexos", controller.getSexos);
route.get("/acessorios", controller.getAcessorios);
route.get("/estados-condicao", controller.getEstadosCondicao);

// Exportação do objeto route para ser utilizado no app.js
module.exports = route;