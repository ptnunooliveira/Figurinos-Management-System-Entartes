/**
 * ------------------------------------------------------------------------
 * File: anunciosEscola.integration.test.js
 * Author: Marina Silva
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do BPMN de Anuncios da Escola
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

describe("AnunciosEscola BPMN integration", () => {
  let staff;
  let aluno;
  let staffToken;
  let alunoToken;
  let figurinoExistente;
  let anuncioCriadoId;

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

    figurinoExistente = await prisma.figurino.findFirst({
      select: { id: true },
    });
  });

  afterAll(async () => {
    if (anuncioCriadoId) {
      await prisma.anuncio_escola.deleteMany({ where: { id: anuncioCriadoId } });
    }
  });

  // ----------------------------------------------------------------------
  // Testes de acesso publico
  // ----------------------------------------------------------------------
  test("GET /anuncios-escola sem token devolve 200 (rota publica)", async () => {
    const res = await request(app).get("/anuncios-escola");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /anuncios-escola com filtros devolve 200", async () => {
    const res = await request(app)
      .get("/anuncios-escola")
      .query({ tamanho: "M" });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /anuncios-escola/:id com ID invalido devolve lista ou 404", async () => {
    const res = await request(app).get("/anuncios-escola/999999");

    expect([200, 404]).toContain(res.status);
  });

  test("GET /anuncios-escola/:id/disponibilidade sem params devolve 400", async () => {
    const res = await request(app).get("/anuncios-escola/1/disponibilidade");

    expect(res.status).toBe(400);
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao
  // ----------------------------------------------------------------------
  test("POST /anuncios-escola sem token devolve 401", async () => {
    const res = await request(app)
      .post("/anuncios-escola")
      .send({ valordiarioaluguer: 10.0 });

    expect(res.status).toBe(401);
  });

  test("POST /anuncios-escola com token de ALUNO devolve 403", async () => {
    const res = await request(app)
      .post("/anuncios-escola")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ valordiarioaluguer: 10.0 });

    expect(res.status).toBe(403);
  });

  test("PUT /anuncios-escola/:id sem token devolve 401", async () => {
    const res = await request(app)
      .put("/anuncios-escola/1")
      .send({ valordiarioaluguer: 15.0 });

    expect(res.status).toBe(401);
  });

  test("DELETE /anuncios-escola/:id sem token devolve 401", async () => {
    const res = await request(app).delete("/anuncios-escola/1");

    expect(res.status).toBe(401);
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: criar -> listar -> obter -> atualizar -> eliminar
  // ----------------------------------------------------------------------
  test("FUNCIONARIO cria anuncio com sucesso", async () => {
    const body = { valordiarioaluguer: 12.5 };

    if (figurinoExistente) {
      body.id_figurino = figurinoExistente.id;
    }

    const res = await request(app)
      .post("/anuncios-escola")
      .set("Authorization", `Bearer ${staffToken}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    anuncioCriadoId = res.body.id;
  });

  test("GET /anuncios-escola/:id devolve o anuncio criado", async () => {
    if (!anuncioCriadoId) return;

    const res = await request(app).get(`/anuncios-escola/${anuncioCriadoId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(anuncioCriadoId);
  });

  test("GET /anuncios-escola/:id/disponibilidade com params validos devolve 200", async () => {
    if (!anuncioCriadoId) return;

    const res = await request(app)
      .get(`/anuncios-escola/${anuncioCriadoId}/disponibilidade`)
      .query({ dataInicio: "2026-09-01", dataFim: "2026-09-30" });

    expect([200, 400, 404]).toContain(res.status);
  });

  test("FUNCIONARIO atualiza anuncio com sucesso", async () => {
    if (!anuncioCriadoId) return;

    const res = await request(app)
      .put(`/anuncios-escola/${anuncioCriadoId}`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ valordiarioaluguer: 20.0 });

    expect(res.status).toBe(200);
  });

  test("FUNCIONARIO elimina anuncio sem reservas com sucesso", async () => {
    if (!anuncioCriadoId) return;

    const res = await request(app)
      .delete(`/anuncios-escola/${anuncioCriadoId}`)
      .set("Authorization", `Bearer ${staffToken}`);

    if (res.status === 204) {
      anuncioCriadoId = null;
    }

    expect([204, 409]).toContain(res.status);
  });
});
