/**
 * ------------------------------------------------------------------------
 * File: perfil.integration.test.js
 * Author: Nelson Cruz
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do fluxo de preenchimento de Perfis
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

describe("Perfil BPMN integration", () => {
  let admin;
  let funcionario;
  let aluno;
  let adminToken;
  let funcionarioToken;
  let alunoToken;
  let utilizadorAluno;
  let utilizadorFuncionario;

  beforeAll(async () => {
    admin = await prisma.utilizador.findFirst({
      where: { perfil: "ADMIN", ativo: true },
      select: { id: true, nome: true, email: true, perfil: true },
    });

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

    if (!admin || !funcionario || !aluno) {
      throw new Error("E necessario ter pelo menos 1 ADMIN, 1 FUNCIONARIO e 1 ALUNO ativos na BD.");
    }

    adminToken = criarToken(admin);
    funcionarioToken = criarToken(funcionario);
    alunoToken = criarToken(aluno);

    // Utilizador ALUNO para actualizar o perfil
    utilizadorAluno = aluno;

    // Utilizador FUNCIONARIO para actualizar o perfil
    utilizadorFuncionario = funcionario;
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao - perfil de aluno
  // ----------------------------------------------------------------------
  test("PATCH /perfis/alunos/:id sem token devolve 401", async () => {
    const res = await request(app)
      .patch(`/perfis/alunos/${utilizadorAluno?.id ?? 1}`)
      .send({ numeroaluno: 12345 });

    expect(res.status).toBe(401);
  });

  test("PATCH /perfis/alunos/:id com ALUNO devolve 403", async () => {
    const res = await request(app)
      .patch(`/perfis/alunos/${utilizadorAluno.id}`)
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ numeroaluno: 12345 });

    expect(res.status).toBe(403);
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao - perfil de funcionario
  // ----------------------------------------------------------------------
  test("PATCH /perfis/funcionarios/:id sem token devolve 401", async () => {
    const res = await request(app)
      .patch(`/perfis/funcionarios/${utilizadorFuncionario?.id ?? 1}`)
      .send({ n_mecanografico: 9999, cargo: "Tecnico" });

    expect(res.status).toBe(401);
  });

  test("PATCH /perfis/funcionarios/:id com FUNCIONARIO devolve 403", async () => {
    const res = await request(app)
      .patch(`/perfis/funcionarios/${utilizadorFuncionario.id}`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ n_mecanografico: 9999, cargo: "Tecnico" });

    expect(res.status).toBe(403);
  });

  test("PATCH /perfis/funcionarios/:id com ALUNO devolve 403", async () => {
    const res = await request(app)
      .patch(`/perfis/funcionarios/${utilizadorFuncionario.id}`)
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ n_mecanografico: 9999, cargo: "Tecnico" });

    expect(res.status).toBe(403);
  });

  // ----------------------------------------------------------------------
  // Testes de validacao - perfil de aluno
  // ----------------------------------------------------------------------
  test("PATCH /perfis/alunos/:id sem numeroaluno devolve 400", async () => {
    const res = await request(app)
      .patch(`/perfis/alunos/${utilizadorAluno.id}`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test("PATCH /perfis/alunos/:id com utilizador inexistente devolve 404", async () => {
    const res = await request(app)
      .patch("/perfis/alunos/999999")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ numeroaluno: 99999 });

    expect(res.status).toBe(404);
  });

  test("PATCH /perfis/alunos/:id com utilizador que nao e ALUNO devolve 400", async () => {
    const res = await request(app)
      .patch(`/perfis/alunos/${funcionario.id}`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ numeroaluno: 99999 });

    expect(res.status).toBe(400);
  });

  // ----------------------------------------------------------------------
  // Testes de validacao - perfil de funcionario
  // ----------------------------------------------------------------------
  test("PATCH /perfis/funcionarios/:id sem n_mecanografico devolve 400", async () => {
    const res = await request(app)
      .patch(`/perfis/funcionarios/${utilizadorFuncionario.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ cargo: "Tecnico" });

    expect(res.status).toBe(400);
  });

  test("PATCH /perfis/funcionarios/:id sem cargo devolve 400", async () => {
    const res = await request(app)
      .patch(`/perfis/funcionarios/${utilizadorFuncionario.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ n_mecanografico: 9999 });

    expect(res.status).toBe(400);
  });

  test("PATCH /perfis/funcionarios/:id com utilizador que nao e FUNCIONARIO devolve 400", async () => {
    const res = await request(app)
      .patch(`/perfis/funcionarios/${aluno.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ n_mecanografico: 9999, cargo: "Tecnico" });

    expect(res.status).toBe(400);
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: FUNCIONARIO preenche dados de aluno
  // ----------------------------------------------------------------------
  test("FUNCIONARIO preenche dados de aluno com sucesso", async () => {
    const numeroAlunoIT = Math.floor(Math.random() * 900000) + 100000;

    const res = await request(app)
      .patch(`/perfis/alunos/${utilizadorAluno.id}`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ numeroaluno: numeroAlunoIT });

    expect([200, 409]).toContain(res.status);

    if (res.status === 200) {
      expect(res.body).toHaveProperty("message");
    }
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: ADMIN preenche dados de funcionario
  // ----------------------------------------------------------------------
  test("ADMIN preenche dados de funcionario com sucesso", async () => {
    const nMecanograficoIT = Math.floor(Math.random() * 90000) + 10000;

    const res = await request(app)
      .patch(`/perfis/funcionarios/${utilizadorFuncionario.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ n_mecanografico: nMecanograficoIT, cargo: "Tecnico de Figurinos IT" });

    expect([200, 409]).toContain(res.status);

    if (res.status === 200) {
      expect(res.body).toHaveProperty("message");
    }
  });
});
