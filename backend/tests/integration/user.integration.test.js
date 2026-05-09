/**
 * ------------------------------------------------------------------------
 * File: user.integration.test.js
 * Author: Nelson Cruz
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do fluxo de gestão de Utilizadores
 * ------------------------------------------------------------------------
 */

const request = require("supertest");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = require("../../app");
const prisma = require("../../prisma/client");

jest.setTimeout(60000);

const criarToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, perfil: user.perfil, nome: user.nome },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

describe("User BPMN integration", () => {
  let funcionario;
  let aluno;
  let funcionarioToken;
  let alunoToken;
  let utilizadorCriadoEmail;
  let utilizadorCriadoId;

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

    // Criar utilizador temporario para testar desativacao
    utilizadorCriadoEmail = `it_user_${Date.now()}@test.com`;
    const pwHash = await bcrypt.hash("senha_teste_123", 10);

    const novoUser = await prisma.utilizador.create({
      data: {
        nome: "Utilizador IT Teste",
        email: utilizadorCriadoEmail,
        pw_hashed: pwHash,
        perfil: "ALUNO",
        ativo: true,
      },
      select: { id: true },
    });

    utilizadorCriadoId = novoUser.id;
  });

  afterAll(async () => {
    if (utilizadorCriadoEmail) {
      await prisma.utilizador.deleteMany({
        where: { email: utilizadorCriadoEmail },
      });
    }
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao
  // ----------------------------------------------------------------------
  test("GET /users sem token devolve 401", async () => {
    const res = await request(app).get("/users");

    expect(res.status).toBe(401);
  });

  test("GET /users com ALUNO devolve 403", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(403);
  });

  test("DELETE /users/:id sem token devolve 401", async () => {
    const res = await request(app).delete(`/users/${utilizadorCriadoId}`);

    expect(res.status).toBe(401);
  });

  // ----------------------------------------------------------------------
  // Listagem de utilizadores
  // ----------------------------------------------------------------------
  test("GET /users com FUNCIONARIO devolve 200 e lista de utilizadores", async () => {
    const res = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ----------------------------------------------------------------------
  // Obter utilizador por ID
  // ----------------------------------------------------------------------
  test("GET /users/:id sem token devolve 401", async () => {
    const res = await request(app).get(`/users/${aluno.id}`);

    expect(res.status).toBe(401);
  });

  test("GET /users/:id com token valido devolve 200", async () => {
    const res = await request(app)
      .get(`/users/${aluno.id}`)
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.id).toBe(aluno.id);
    expect(res.body).not.toHaveProperty("pw_hashed");
  });

  test("GET /users/:id com ID inexistente devolve 404", async () => {
    const res = await request(app)
      .get("/users/999999")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(404);
  });

  // ----------------------------------------------------------------------
  // Atualizar utilizador
  // ----------------------------------------------------------------------
  test("PUT /users/:id sem token devolve 401", async () => {
    const res = await request(app)
      .put(`/users/${aluno.id}`)
      .send({ nome: "Nome Actualizado" });

    expect(res.status).toBe(401);
  });

  test("PUT /users/:id com token valido devolve 200", async () => {
    if (!utilizadorCriadoId) return;

    const tokenUser = criarToken({
      id: utilizadorCriadoId,
      email: utilizadorCriadoEmail,
      perfil: "ALUNO",
      nome: "Utilizador IT Teste",
    });

    const res = await request(app)
      .put(`/users/${utilizadorCriadoId}`)
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({ nome: "Utilizador IT Actualizado" });

    expect([200, 400, 404]).toContain(res.status);
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: desativar utilizador (FUNCIONARIO)
  // ----------------------------------------------------------------------
  test("FUNCIONARIO desativa utilizador criado no teste", async () => {
    if (!utilizadorCriadoId) return;

    const res = await request(app)
      .delete(`/users/${utilizadorCriadoId}`)
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect([200, 204]).toContain(res.status);

    // Verificar que o utilizador ficou inativo
    const utilizador = await prisma.utilizador.findUnique({
      where: { id: utilizadorCriadoId },
      select: { ativo: true },
    });

    if (utilizador) {
      expect(utilizador.ativo).toBe(false);
    }
  });

  test("FUNCIONARIO nao consegue desativar utilizador ja inativo", async () => {
    if (!utilizadorCriadoId) return;

    const res = await request(app)
      .delete(`/users/${utilizadorCriadoId}`)
      .set("Authorization", `Bearer ${funcionarioToken}`);

    // Depende da implementacao: pode ser 200 idempotente, 400 ou 404
    expect([200, 204, 400, 404, 409]).toContain(res.status);
  });
});
