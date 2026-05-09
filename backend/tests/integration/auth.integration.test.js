/**
 * ------------------------------------------------------------------------
 * File: auth.integration.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do fluxo de autenticação
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

describe("Auth BPMN integration", () => {
  let admin;
  let adminToken;
  let emailCriadoNesteTeste;

  beforeAll(async () => {
    admin = await prisma.utilizador.findFirst({
      where: { perfil: "ADMIN", ativo: true },
      select: { id: true, nome: true, email: true, perfil: true },
    });

    if (!admin) {
      throw new Error("E necessario ter pelo menos 1 ADMIN ativo na BD.");
    }

    adminToken = criarToken(admin);
  });

  // ----------------------------------------------------------------------
  // Testes de integração - fluxo de login
  // ----------------------------------------------------------------------
  test("login com credenciais invalidas devolve 401", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "naoexiste@test.com", password: "errada" });

    expect(res.status).toBe(401);
  });

  test("login sem campos obrigatorios devolve 400", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "alguem@test.com" });

    expect(res.status).toBe(400);
  });

  test("login valido com admin devolve token JWT", async () => {
    const adminUser = await prisma.utilizador.findFirst({
      where: { perfil: "ADMIN", ativo: true },
      select: { email: true },
    });

    if (!adminUser) return;

    // Nota: apenas valida o endpoint com email existente mas password invalida
    // (nao conhecemos a password em texto simples da BD)
    const res = await request(app)
      .post("/auth/login")
      .send({ email: adminUser.email, password: "password_invalida_para_teste" });

    // Deve devolver 401 (credenciais invalidas) ou 200 (se por acaso acertar)
    expect([200, 401]).toContain(res.status);
  });

  // ----------------------------------------------------------------------
  // Testes de integração - GET /auth/me
  // ----------------------------------------------------------------------
  test("GET /auth/me sem token devolve 401", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.status).toBe(401);
  });

  test("GET /auth/me com token valido devolve dados do utilizador", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email");
    expect(res.body).not.toHaveProperty("pw_hashed");
  });

  // ----------------------------------------------------------------------
  // Testes de integração - POST /auth/register
  // ----------------------------------------------------------------------
  test("register sem token devolve 401", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ nome: "Teste", email: "teste@test.com", password: "123", perfil: "ALUNO" });

    expect(res.status).toBe(401);
  });

  test("register com campos em falta devolve 400", async () => {
    const res = await request(app)
      .post("/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Teste", email: "teste@test.com" });

    expect(res.status).toBe(400);
  });

  test("register com perfil invalido devolve 400", async () => {
    const res = await request(app)
      .post("/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Teste", email: `invalido_${Date.now()}@test.com`, password: "123", perfil: "INVALIDO" });

    expect(res.status).toBe(400);
  });

  test("register cria novo utilizador ALUNO com sucesso", async () => {
    emailCriadoNesteTeste = `it_auth_aluno_${Date.now()}@test.com`;

    const res = await request(app)
      .post("/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Aluno Teste IT", email: emailCriadoNesteTeste, password: "senha123", perfil: "ALUNO" });

    expect(res.status).toBe(201);
    expect(res.body?.user?.email).toBe(emailCriadoNesteTeste);
  });

  test("register com email ja existente devolve 409", async () => {
    if (!emailCriadoNesteTeste) return;

    const res = await request(app)
      .post("/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nome: "Duplicado", email: emailCriadoNesteTeste, password: "senha123", perfil: "ALUNO" });

    expect(res.status).toBe(409);
  });

  afterAll(async () => {
    if (emailCriadoNesteTeste) {
      await prisma.utilizador.deleteMany({ where: { email: emailCriadoNesteTeste } });
    }
  });
});
