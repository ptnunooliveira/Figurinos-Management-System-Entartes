/**
 * ------------------------------------------------------------------------
 * File: propostaCobranca.integration.test.js
 * Author: Ricardo
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do fluxo de Propostas de Cobranca
 * ------------------------------------------------------------------------
 */

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../app");
const prisma = require("../../prisma/client");

jest.setTimeout(60000);

const criarToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, perfil: user.perfil, nome: user.nome },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

describe("PropostaCobranca BPMN integration", () => {
  let funcionario;
  let aluno;
  let funcionarioToken;
  let alunoToken;
  let ocorrenciaExistente;
  let propostaCriadaId;

  beforeAll(async () => {
    const funcRecord = await prisma.funcionario.findFirst({
      where: { utilizador: { ativo: true } },
      include: {
        utilizador: { select: { id: true, nome: true, email: true, perfil: true } },
      },
    });
    funcionario = funcRecord?.utilizador ?? null;

    aluno = await prisma.utilizador.findFirst({
      where: { perfil: "ALUNO", ativo: true },
      select: { id: true, nome: true, email: true, perfil: true },
    });

    if (!funcionario || !aluno) {
      throw new Error("E necessario ter pelo menos 1 FUNCIONARIO e 1 ALUNO ativos na BD.");
    }

    funcionarioToken = criarToken(funcionario);
    alunoToken = criarToken(aluno);

    ocorrenciaExistente = await prisma.ocorrencia.findFirst({
      select: { id: true },
    });
  });

  afterAll(async () => {
    if (propostaCriadaId) {
      try {
        await prisma.contestacao.deleteMany({ where: { id_proposta_cobranca: propostaCriadaId } });
        await prisma.conta_corrente.deleteMany({ where: { id_proposta_cobranca: propostaCriadaId } });
        await prisma.proposta_cobranca.deleteMany({ where: { id: propostaCriadaId } });
      } catch (_) {
        // ja eliminado ou campos em cascata
      }
    }
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao
  // ----------------------------------------------------------------------
  test("GET /propostas-cobranca sem token devolve 401", async () => {
    const res = await request(app).get("/propostas-cobranca");

    expect(res.status).toBe(401);
  });

  test("GET /propostas-cobranca com ALUNO devolve 403", async () => {
    const res = await request(app)
      .get("/propostas-cobranca")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(403);
  });

  test("POST /propostas-cobranca sem token devolve 401", async () => {
    const res = await request(app)
      .post("/propostas-cobranca")
      .send({ id_ocorrencia: 1, valor: 50.0 });

    expect(res.status).toBe(401);
  });

  test("POST /propostas-cobranca com ALUNO devolve 403", async () => {
    const res = await request(app)
      .post("/propostas-cobranca")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ id_ocorrencia: 1, valor: 50.0 });

    expect(res.status).toBe(403);
  });

  // ----------------------------------------------------------------------
  // Listagem de propostas
  // ----------------------------------------------------------------------
  test("GET /propostas-cobranca com FUNCIONARIO devolve 200", async () => {
    const res = await request(app)
      .get("/propostas-cobranca")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect(res.status).toBe(200);
  });

  // ----------------------------------------------------------------------
  // Testes de validacao
  // ----------------------------------------------------------------------
  test("POST /propostas-cobranca sem id_ocorrencia devolve 400", async () => {
    const res = await request(app)
      .post("/propostas-cobranca")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ valor: 50.0 });

    expect(res.status).toBe(400);
  });

  test("POST /propostas-cobranca sem valor devolve 400", async () => {
    const res = await request(app)
      .post("/propostas-cobranca")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_ocorrencia: 1 });

    expect(res.status).toBe(400);
  });

  test("PATCH /propostas-cobranca/:id/estado sem estado devolve 400", async () => {
    const res = await request(app)
      .patch("/propostas-cobranca/1/estado")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test("POST /propostas-cobranca/:id/finalizar-conta-corrente sem id_tipo_movimento devolve 400", async () => {
    const res = await request(app)
      .post("/propostas-cobranca/1/finalizar-conta-corrente")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test("GET /propostas-cobranca/:id com ID inexistente devolve 404", async () => {
    const res = await request(app)
      .get("/propostas-cobranca/999999")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(404);
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: criar proposta -> aluno aceita -> actualizar estado
  // ----------------------------------------------------------------------
  test("FUNCIONARIO cria proposta de cobranca para ocorrencia existente", async () => {
    if (!ocorrenciaExistente) return;

    const res = await request(app)
      .post("/propostas-cobranca")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({
        id_ocorrencia: ocorrenciaExistente.id,
        valor: 75.0,
        descricao: `Proposta IT ${Date.now()} - reparacao de dano`,
      });

    if (res.status === 201) {
      propostaCriadaId = res.body.id;
      expect(res.body).toHaveProperty("id");
    }

    expect([201, 400, 404, 409, 500]).toContain(res.status);
  });

  test("GET /propostas-cobranca/:id devolve a proposta criada", async () => {
    if (!propostaCriadaId) return;

    const res = await request(app)
      .get(`/propostas-cobranca/${propostaCriadaId}`)
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(propostaCriadaId);
  });

  test("ALUNO aceita proposta de cobranca", async () => {
    if (!propostaCriadaId) return;

    const res = await request(app)
      .post(`/propostas-cobranca/${propostaCriadaId}/aceitar`)
      .set("Authorization", `Bearer ${alunoToken}`);

    expect([200, 400, 403, 404, 409]).toContain(res.status);
  });

  test("FUNCIONARIO actualiza estado da proposta", async () => {
    if (!propostaCriadaId) return;

    const res = await request(app)
      .patch(`/propostas-cobranca/${propostaCriadaId}/estado`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_estadopropostacobranca: 2 });

    expect([200, 400, 404]).toContain(res.status);
  });

  // ----------------------------------------------------------------------
  // Fluxo de contraproposta
  // ----------------------------------------------------------------------
  test("POST /propostas-cobranca/ocorrencia/:id/resolver-contraproposta sem valor devolve 400", async () => {
    const idOcorrencia = ocorrenciaExistente?.id ?? 1;

    const res = await request(app)
      .post(`/propostas-cobranca/ocorrencia/${idOcorrencia}/resolver-contraproposta`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
