/*
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
route.post("/categorias", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createCategoria);
route.patch("/categorias/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateCategoria);
route.get("/categorias/:nome", authMiddleware, controller.getCategoriaByNome);

// Rotas para Tipos de Figurino
route.get("/tipos-figurino", authMiddleware, controller.getTiposFigurino);
route.post("/tipos-figurino", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createTipoFigurino);
route.patch("/tipos-figurino/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateTipoFigurino);
route.get("/tipos-figurino/:tipofigurino", authMiddleware, controller.getTipoFigurinoByNome);

// Rotas para generos
route.get("/sexos", authMiddleware, controller.getSexos);
route.post("/sexos", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createSexo);
route.patch("/sexos/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateSexo);
route.get("/sexos/:genero", authMiddleware, controller.getSexoByNome);

// Rotas para acessórios
route.get("/acessorios", authMiddleware, controller.getAcessorios);
route.post("/acessorios", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createAcessorio);
route.patch("/acessorios/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateAcessorio);
route.get("/acessorios/:nome", authMiddleware, controller.getAcessorioByNome);

// Rotas para estados de condição
route.get("/estados-condicao", authMiddleware, controller.getEstadosCondicao);
route.post("/estados-condicao", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createEstadoCondicao);
route.patch("/estados-condicao/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateEstadoCondicao);
route.get("/estados-condicao/:nome", authMiddleware, controller.getEstadoCondicaoByNome);

// Rotas para estados da reserva
route.get("/estados-reserva", authMiddleware, controller.getEstadosReserva);
route.post("/estados-reserva", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createEstadosReserva);
route.patch("/estados-reserva/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateEstadosReserva);
route.get("/estados-reserva/:nome", authMiddleware, controller.getEstadoReservaByNome);

// Adicionado Nelson em 21-04-2026: Rotas para estados de anuncio
route.get("/estados-anuncio", authMiddleware, controller.getEstadosAnuncio);
route.post("/estados-anuncio", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createEstadoAnuncio);
route.patch("/estados-anuncio/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateEstadoAnuncio);
route.get("/estados-anuncio/:nome", authMiddleware, controller.getEstadoAnuncioByNome);

// Adicionado Nelson em 21-04-2026: Rotas para tipos de checklist
route.get("/tipos-checklist", authMiddleware, controller.getTiposChecklist);
route.post("/tipos-checklist", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createTipoChecklist);
route.patch("/tipos-checklist/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateTipoChecklist);
route.get("/tipos-checklist/:nome", authMiddleware, controller.getTipoChecklistByNome);

// Adicionado Nelson em 21-04-2026: Rotas para estados de ocorrencia
route.get("/estados-ocorrencia", authMiddleware, controller.getEstadosOcorrencia);
route.post("/estados-ocorrencia", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createEstadoOcorrencia);
route.patch("/estados-ocorrencia/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateEstadoOcorrencia);
route.get("/estados-ocorrencia/:nome", authMiddleware, controller.getEstadoOcorrenciaByNome);

// Adicionado Nelson em 21-04-2026: Rotas para estados de proposta de cobranca
route.get("/estados-proposta-cobranca", authMiddleware, controller.getEstadosPropostaCobranca);
route.post("/estados-proposta-cobranca", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createEstadoPropostaCobranca);
route.patch("/estados-proposta-cobranca/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateEstadoPropostaCobranca);
route.get("/estados-proposta-cobranca/:nome", authMiddleware, controller.getEstadoPropostaCobrancaByNome);

// Adicionado Nelson em 21-04-2026: Rotas para tipos de movimento da conta corrente
route.get("/tipos-movimento-conta-corrente", authMiddleware, controller.getTiposMovimentoContaCorrente);
route.post("/tipos-movimento-conta-corrente", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.createTipoMovimentoContaCorrente);
route.patch("/tipos-movimento-conta-corrente/:id", authMiddleware, perfilMiddleware(["FUNCIONARIO", "ADMIN"]), controller.updateTipoMovimentoContaCorrente);
route.get("/tipos-movimento-conta-corrente/:nome", authMiddleware, controller.getTipoMovimentoContaCorrenteByNome);

// Exportação do objeto route para ser utilizado no app.js
module.exports = route;
