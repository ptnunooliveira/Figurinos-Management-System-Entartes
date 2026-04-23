/**
 * ------------------------------------------------------------------------
 * File: devolucaoRoutes.js
 * Author: Marina Silva
 * Date: 2026-04-18
 * Version: 1.0
 * Description:
 * Routes para devolucoes, ocorrencias e orcamentos.
 * ------------------------------------------------------------------------
 */

const express = require("express");
const route = express.Router();
const controller = require("../controllers/devolucaoController");
const authMiddleware = require("../middleware/authMiddleware");
const perfilMiddleware = require("../middleware/perfilMiddleware");

// -------------------------
// DEVOLUCOES
// -------------------------

// GET /devolucoes — listar todas as devoluções (funcionário/admin)
route.get(
  "/devolucoes",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.getDevolucoes
);

// GET /devolucoes/:id — detalhe de uma devolução (funcionário/admin)
route.get(
  "/devolucoes/:id",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.getDevolucaoById
);

// POST /devolucoes — registar devolução de uma linha_reserva com checklist (funcionário/admin)
route.post(
  "/devolucoes",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.createDevolucao
);

// -------------------------
// OCORRENCIAS
// -------------------------

// GET /ocorrencias — listar todas as ocorrências (funcionário/admin)
route.get(
  "/ocorrencias",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.getOcorrencias
);

// GET /ocorrencias/:id — detalhe de uma ocorrência (funcionário/admin)
route.get(
  "/ocorrencias/:id",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.getOcorrenciaById
);

// POST /ocorrencias — criar incidente de dano (funcionário/admin)
route.post(
  "/ocorrencias",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.createOcorrencia
);

// PATCH /ocorrencias/:id/estado — atualizar estado de uma ocorrência (funcionário/admin)
route.patch(
  "/ocorrencias/:id/estado",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.updateEstadoOcorrencia
);

// -------------------------
// ORCAMENTOS (sub-recurso de ocorrencia)
// -------------------------

// GET /ocorrencias/:id/orcamentos — listar orçamentos de uma ocorrência (funcionário/admin)
route.get(
  "/ocorrencias/:id/orcamentos",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.getOrcamentosByOcorrencia
);

// POST /ocorrencias/:id/orcamentos — pedir orçamento a fornecedor para uma ocorrência (funcionário/admin)
route.post(
  "/ocorrencias/:id/orcamentos",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.createOrcamento
);

// PATCH /orcamentos/:id/aprovar — aprovar ou rejeitar um orçamento (funcionário/admin)
route.patch(
  "/orcamentos/:id/aprovar",
  authMiddleware,
  perfilMiddleware(["FUNCIONARIO", "ADMIN"]),
  controller.updateAprovacaoOrcamento
);

module.exports = route;
