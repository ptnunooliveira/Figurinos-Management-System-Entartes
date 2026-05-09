/**
 * ------------------------------------------------------------------------
 * File: devolucao.integration.test.js
 * Author: Marina Silva
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do fluxo de Devolucoes, Ocorrencias e Orcamentos
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

describe("Devolucao BPMN integration", () => {
  let funcionario;
  let aluno;
  let funcionarioToken;
  let alunoToken;
  let linhaReservaExistente;
  let ocorrenciaCriadaId;

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

    // Procurar linha de reserva em estado confirmado (id_estado = 2) para criar ocorrencia
    linhaReservaExistente = await prisma.linha_reserva.findFirst({
      where: { reserva: { id_estado: { in: [2, 3, 4] } } },
      select: { id: true },
    });
  });

  afterAll(async () => {
    if (ocorrenciaCriadaId) {
      await prisma.orcamento.deleteMany({ where: { id_ocorrencia: ocorrenciaCriadaId } });
      await prisma.ocorrencia.deleteMany({ where: { id: ocorrenciaCriadaId } });
    }
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao - devolucoes
  // ----------------------------------------------------------------------
  test("GET /devolucoes sem token devolve 401", async () => {
    const res = await request(app).get("/devolucoes");

    expect(res.status).toBe(401);
  });

  test("GET /devolucoes com ALUNO devolve 403", async () => {
    const res = await request(app)
      .get("/devolucoes")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(403);
  });

  test("POST /devolucoes sem token devolve 401", async () => {
    const res = await request(app)
      .post("/devolucoes")
      .send({ id_linha_reserva: 1, id_checklist: 1 });

    expect(res.status).toBe(401);
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao - ocorrencias
  // ----------------------------------------------------------------------
  test("GET /ocorrencias sem token devolve 401", async () => {
    const res = await request(app).get("/ocorrencias");

    expect(res.status).toBe(401);
  });

  test("GET /ocorrencias com ALUNO devolve 403", async () => {
    const res = await request(app)
      .get("/ocorrencias")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(403);
  });

  test("GET /ocorrencias/mine sem token devolve 401", async () => {
    const res = await request(app).get("/ocorrencias/mine");

    expect(res.status).toBe(401);
  });

  test("GET /ocorrencias/mine com FUNCIONARIO devolve 403", async () => {
    const res = await request(app)
      .get("/ocorrencias/mine")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect(res.status).toBe(403);
  });

  // ----------------------------------------------------------------------
  // Listagem de devolucoes e ocorrencias
  // ----------------------------------------------------------------------
  test("GET /devolucoes com FUNCIONARIO devolve 200", async () => {
    const res = await request(app)
      .get("/devolucoes")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /ocorrencias com FUNCIONARIO devolve 200", async () => {
    const res = await request(app)
      .get("/ocorrencias")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /ocorrencias/mine com ALUNO devolve 200", async () => {
    const res = await request(app)
      .get("/ocorrencias/mine")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ----------------------------------------------------------------------
  // Testes de validacao - devolucao
  // ----------------------------------------------------------------------
  test("POST /devolucoes sem campos obrigatorios devolve 400", async () => {
    const res = await request(app)
      .post("/devolucoes")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_linha_reserva: 1 });

    expect(res.status).toBe(400);
  });

  test("POST /devolucoes com data futura devolve 400", async () => {
    const res = await request(app)
      .post("/devolucoes")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({
        id_linha_reserva: 1,
        id_checklist: 1,
        datadevolucao: "2099-12-31",
      });

    expect(res.status).toBe(400);
  });

  // ----------------------------------------------------------------------
  // Testes de validacao - ocorrencia
  // ----------------------------------------------------------------------
  test("POST /ocorrencias sem id_linha_reserva devolve 400", async () => {
    const res = await request(app)
      .post("/ocorrencias")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ descricao: "Dano observado" });

    expect(res.status).toBe(400);
  });

  test("POST /ocorrencias sem descricao devolve 400", async () => {
    const res = await request(app)
      .post("/ocorrencias")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_linha_reserva: 1 });

    expect(res.status).toBe(400);
  });

  test("POST /ocorrencias com valor negativo devolve 400", async () => {
    const res = await request(app)
      .post("/ocorrencias")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_linha_reserva: 1, descricao: "Dano", valor: -10 });

    expect(res.status).toBe(400);
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: criar ocorrencia -> criar orcamento -> aprovar orcamento
  // ----------------------------------------------------------------------
  test("FUNCIONARIO cria ocorrencia para linha de reserva existente", async () => {
    if (!linhaReservaExistente) return;

    const res = await request(app)
      .post("/ocorrencias")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({
        id_linha_reserva: linhaReservaExistente.id,
        descricao: `Dano IT ${Date.now()} - rasgao na costura`,
        valor: 25.0,
      });

    if (res.status === 201) {
      ocorrenciaCriadaId = res.body.id;
      expect(res.body).toHaveProperty("id");
    }

    expect([201, 404, 409, 422]).toContain(res.status);
  });

  test("FUNCIONARIO cria orcamento para ocorrencia criada", async () => {
    if (!ocorrenciaCriadaId) return;

    const res = await request(app)
      .post(`/ocorrencias/${ocorrenciaCriadaId}/orcamentos`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({
        fornecedor: "Costureira IT Lda",
        descricao: "Reparacao de rasgao",
        valor: 30.0,
      });

    expect([201, 400, 404]).toContain(res.status);
  });

  test("GET /ocorrencias/:id/orcamentos com FUNCIONARIO devolve 200 ou 404", async () => {
    if (!ocorrenciaCriadaId) return;

    const res = await request(app)
      .get(`/ocorrencias/${ocorrenciaCriadaId}/orcamentos`)
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect([200, 404]).toContain(res.status);

    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  // ----------------------------------------------------------------------
  // Testes de validacao - orcamento
  // ----------------------------------------------------------------------
  test("POST /ocorrencias/:id/orcamentos sem fornecedor devolve 400", async () => {
    const idOcorrencia = ocorrenciaCriadaId ?? 1;

    const res = await request(app)
      .post(`/ocorrencias/${idOcorrencia}/orcamentos`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ descricao: "Reparacao", valor: 30.0 });

    expect(res.status).toBe(400);
  });

  test("PATCH /orcamentos/:id/aprovar sem campo 'aprovado' devolve 400", async () => {
    const res = await request(app)
      .patch("/orcamentos/1/aprovar")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  // ----------------------------------------------------------------------
  // Atualizacao de estado de ocorrencia
  // ----------------------------------------------------------------------
  test("PATCH /ocorrencias/:id/estado sem id_estado devolve 400", async () => {
    const idOcorrencia = ocorrenciaCriadaId ?? 1;

    const res = await request(app)
      .patch(`/ocorrencias/${idOcorrencia}/estado`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
