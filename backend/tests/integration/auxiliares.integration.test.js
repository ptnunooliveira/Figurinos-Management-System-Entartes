/**
 * ------------------------------------------------------------------------
 * File: auxiliares.integration.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração das tabelas auxiliares (categorias, tipos, sexos, etc.)
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

describe("Auxiliares BPMN integration", () => {
  let staff;
  let aluno;
  let staffToken;
  let alunoToken;
  let categoriaCriadaId;

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
    if (categoriaCriadaId) {
      await prisma.categoria.deleteMany({ where: { id: categoriaCriadaId } });
    }
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao
  // ----------------------------------------------------------------------
  test("GET /pesquisa/categorias sem token devolve 401", async () => {
    const res = await request(app).get("/pesquisa/categorias");

    expect(res.status).toBe(401);
  });

  test("POST /pesquisa/categorias sem token devolve 401", async () => {
    const res = await request(app)
      .post("/pesquisa/categorias")
      .send({ nome: "Teste" });

    expect(res.status).toBe(401);
  });

  test("POST /pesquisa/categorias com ALUNO devolve 403", async () => {
    const res = await request(app)
      .post("/pesquisa/categorias")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ nome: `IT-Cat-${Date.now()}` });

    expect(res.status).toBe(403);
  });

  // ----------------------------------------------------------------------
  // Fluxo de leitura - categorias
  // ----------------------------------------------------------------------
  test("GET /pesquisa/categorias com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/categorias")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /pesquisa/tipos-figurino com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/tipos-figurino")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /pesquisa/sexos com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/sexos")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /pesquisa/acessorios com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/acessorios")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /pesquisa/estados-condicao com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/estados-condicao")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /pesquisa/estados-reserva com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/estados-reserva")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /pesquisa/estados-anuncio com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/estados-anuncio")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /pesquisa/tipos-checklist com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/tipos-checklist")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: criar -> atualizar categoria
  // ----------------------------------------------------------------------
  test("FUNCIONARIO cria categoria com sucesso", async () => {
    const nomeCategoria = `IT-Categoria-${Date.now()}`;

    const res = await request(app)
      .post("/pesquisa/categorias")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ nome: nomeCategoria });

    expect([200, 201]).toContain(res.status);

    if (res.body?.id) {
      categoriaCriadaId = res.body.id;
    }
  });

  test("FUNCIONARIO atualiza categoria criada", async () => {
    if (!categoriaCriadaId) return;

    const res = await request(app)
      .patch(`/pesquisa/categorias/${categoriaCriadaId}`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ nome: `IT-Categoria-Updated-${Date.now()}` });

    expect([200, 201]).toContain(res.status);
  });

  // ----------------------------------------------------------------------
  // Fluxo de leitura - estados e tipos adicionais
  // ----------------------------------------------------------------------
  test("GET /pesquisa/estados-ocorrencia com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/estados-ocorrencia")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /pesquisa/estados-proposta-cobranca com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/estados-proposta-cobranca")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /pesquisa/tipos-movimento-conta-corrente com token devolve 200", async () => {
    const res = await request(app)
      .get("/pesquisa/tipos-movimento-conta-corrente")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
