/**
 * ------------------------------------------------------------------------
 * File: contaCorrente.integration.test.js
 * Author: Ricardo
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do fluxo de Conta Corrente
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

describe("ContaCorrente BPMN integration", () => {
  let funcionario;
  let aluno;
  let funcionarioToken;
  let alunoToken;

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
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao
  // ----------------------------------------------------------------------
  test("GET /conta-corrente sem token devolve 401", async () => {
    const res = await request(app).get("/conta-corrente");

    expect(res.status).toBe(401);
  });

  test("GET /conta-corrente com ALUNO devolve 403", async () => {
    const res = await request(app)
      .get("/conta-corrente")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(403);
  });

  test("GET /conta-corrente/me sem token devolve 401", async () => {
    const res = await request(app).get("/conta-corrente/me");

    expect(res.status).toBe(401);
  });

  test("GET /conta-corrente/me com FUNCIONARIO devolve 403", async () => {
    const res = await request(app)
      .get("/conta-corrente/me")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect(res.status).toBe(403);
  });

  test("POST /conta-corrente/sincronizar-alugueres sem token devolve 401", async () => {
    const res = await request(app).post("/conta-corrente/sincronizar-alugueres");

    expect(res.status).toBe(401);
  });

  // ----------------------------------------------------------------------
  // Leitura de movimentos (FUNCIONARIO)
  // ----------------------------------------------------------------------
  test("GET /conta-corrente com FUNCIONARIO devolve 200", async () => {
    const res = await request(app)
      .get("/conta-corrente")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /conta-corrente/utilizador/:id com FUNCIONARIO devolve 200 ou 404", async () => {
    const res = await request(app)
      .get(`/conta-corrente/utilizador/${aluno.id}`)
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect([200, 404]).toContain(res.status);

    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  // ----------------------------------------------------------------------
  // Leitura de movimentos proprios (ALUNO)
  // ----------------------------------------------------------------------
  test("GET /conta-corrente/me com ALUNO devolve 200", async () => {
    const res = await request(app)
      .get("/conta-corrente/me")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ----------------------------------------------------------------------
  // Sincronizacao de alugueres
  // ----------------------------------------------------------------------
  test("POST /conta-corrente/sincronizar-alugueres com FUNCIONARIO devolve 2xx", async () => {
    const res = await request(app)
      .post("/conta-corrente/sincronizar-alugueres")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect([200, 201, 204]).toContain(res.status);
  });

  // ----------------------------------------------------------------------
  // Leitura de movimento por ID
  // ----------------------------------------------------------------------
  test("GET /conta-corrente/:id com ID invalido com FUNCIONARIO devolve 200, 404 ou 400", async () => {
    const res = await request(app)
      .get("/conta-corrente/999999")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect([200, 404, 400]).toContain(res.status);
  });

  // ----------------------------------------------------------------------
  // Marcar movimento como exportado (se existir algum movimento)
  // ----------------------------------------------------------------------
  test("PATCH /conta-corrente/:id/exportar com FUNCIONARIO devolve 200 ou 404", async () => {
    const movimentos = await prisma.conta_corrente.findFirst({
      select: { id: true },
    });

    if (!movimentos) return;

    const res = await request(app)
      .patch(`/conta-corrente/${movimentos.id}/exportar`)
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect([200, 404]).toContain(res.status);
  });
});
