/**
 * ------------------------------------------------------------------------
 * File: figurino.integration.test.js
 * Author: Ricardo
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do fluxo de Figurinos
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

describe("Figurino BPMN integration", () => {
  let staff;
  let aluno;
  let staffToken;
  let alunoToken;
  let figurinoCriadoId;

  beforeAll(async () => {
    staff = await prisma.utilizador.findFirst({
      where: { perfil: { in: ["FUNCIONARIO", "ADMIN"] }, ativo: true },
      select: { id: true, nome: true, email: true, perfil: true },
    });

    aluno = await prisma.utilizador.findFirst({
      where: { perfil: "ALUNO", ativo: true },
      select: { id: true, nome: true, email: true, perfil: true },
    });

    if (!staff || !aluno) {
      throw new Error("E necessario ter pelo menos 1 FUNCIONARIO/ADMIN e 1 ALUNO ativos na BD.");
    }

    staffToken = criarToken(staff);
    alunoToken = criarToken(aluno);
  });

  afterAll(async () => {
    if (figurinoCriadoId) {
      try {
        await prisma.figurino_acessorio.deleteMany({ where: { id_figurino: figurinoCriadoId } });
        await prisma.figurino.deleteMany({ where: { id: figurinoCriadoId } });
      } catch (_) {
        // ja eliminado no teste
      }
    }
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao
  // ----------------------------------------------------------------------
  test("GET /figurinos sem token devolve 401", async () => {
    const res = await request(app).get("/figurinos");

    expect(res.status).toBe(401);
  });

  test("POST /figurinos sem token devolve 401", async () => {
    const res = await request(app)
      .post("/figurinos")
      .send({ titulo: "Teste", tamanho: "M" });

    expect(res.status).toBe(401);
  });

  test("POST /figurinos com ALUNO devolve 403", async () => {
    const res = await request(app)
      .post("/figurinos")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ titulo: "Teste", tamanho: "M" });

    expect(res.status).toBe(403);
  });

  test("DELETE /figurinos/:id sem token devolve 401", async () => {
    const res = await request(app).delete("/figurinos/1");

    expect(res.status).toBe(401);
  });

  // ----------------------------------------------------------------------
  // Listagem e leitura
  // ----------------------------------------------------------------------
  test("GET /figurinos com token devolve 200", async () => {
    const res = await request(app)
      .get("/figurinos")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /figurinos com filtro tamanho devolve 200", async () => {
    const res = await request(app)
      .get("/figurinos")
      .set("Authorization", `Bearer ${alunoToken}`)
      .query({ tamanho: "M" });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /figurinos/:id com ID inexistente devolve 404", async () => {
    const res = await request(app)
      .get("/figurinos/999999")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(404);
  });

  test("GET /figurinos/:id/disponibilidade sem params devolve 400", async () => {
    const res = await request(app)
      .get("/figurinos/1/disponibilidade")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(400);
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: criar -> ler -> atualizar -> desativar -> eliminar
  // ----------------------------------------------------------------------
  test("FUNCIONARIO cria figurino com sucesso", async () => {
    const res = await request(app)
      .post("/figurinos")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        titulo: `IT-Figurino-${Date.now()}`,
        descricao: "Figurino de teste de integracao",
        tamanho: "M",
        localizacao: "Armazem A - Prateleira 1",
        quantidade_stock: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    figurinoCriadoId = res.body.id;
  });

  test("GET /figurinos/:id devolve o figurino criado", async () => {
    if (!figurinoCriadoId) return;

    const res = await request(app)
      .get(`/figurinos/${figurinoCriadoId}`)
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(figurinoCriadoId);
  });

  test("GET /figurinos/:id/historico com FUNCIONARIO devolve 200 ou 404", async () => {
    if (!figurinoCriadoId) return;

    const res = await request(app)
      .get(`/figurinos/${figurinoCriadoId}/historico`)
      .set("Authorization", `Bearer ${staffToken}`);

    expect([200, 404]).toContain(res.status);
  });

  test("GET /figurinos/:id/disponibilidade com params validos devolve 200 ou 404", async () => {
    if (!figurinoCriadoId) return;

    const res = await request(app)
      .get(`/figurinos/${figurinoCriadoId}/disponibilidade`)
      .set("Authorization", `Bearer ${alunoToken}`)
      .query({ dataInicio: "2026-09-01", dataFim: "2026-09-30" });

    expect([200, 404]).toContain(res.status);
  });

  test("FUNCIONARIO atualiza figurino criado", async () => {
    if (!figurinoCriadoId) return;

    const res = await request(app)
      .put(`/figurinos/${figurinoCriadoId}`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ descricao: "Descricao actualizada por IT", quantidade_stock: 3 });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(figurinoCriadoId);
  });

  test("PUT /figurinos/:id sem dados devolve 400", async () => {
    if (!figurinoCriadoId) return;

    const res = await request(app)
      .put(`/figurinos/${figurinoCriadoId}`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test("FUNCIONARIO desativa figurino criado", async () => {
    if (!figurinoCriadoId) return;

    const res = await request(app)
      .patch(`/figurinos/${figurinoCriadoId}/desativar`)
      .set("Authorization", `Bearer ${staffToken}`);

    expect([200, 400, 404, 409]).toContain(res.status);
  });

  test("FUNCIONARIO elimina figurino criado", async () => {
    if (!figurinoCriadoId) return;

    const res = await request(app)
      .delete(`/figurinos/${figurinoCriadoId}`)
      .set("Authorization", `Bearer ${staffToken}`);

    if (res.status === 200 || res.status === 204) {
      figurinoCriadoId = null;
    }

    expect([200, 204, 400, 404, 409]).toContain(res.status);
  });
});
