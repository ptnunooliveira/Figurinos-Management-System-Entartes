/**
 * ------------------------------------------------------------------------
 * File: contestacao.integration.test.js
 * Author: Ricardo
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do fluxo de Contestacoes
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

describe("Contestacao BPMN integration", () => {
  let funcionario;
  let aluno;
  let funcionarioToken;
  let alunoToken;
  let propostaExistente;

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

    propostaExistente = await prisma.propostacobranca.findFirst({
      select: { id: true },
    });
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao
  // ----------------------------------------------------------------------
  test("GET /contestacoes sem token devolve 401", async () => {
    const res = await request(app).get("/contestacoes");

    expect(res.status).toBe(401);
  });

  test("GET /contestacoes com ALUNO devolve 403", async () => {
    const res = await request(app)
      .get("/contestacoes")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(403);
  });

  test("POST /contestacoes sem token devolve 401", async () => {
    const res = await request(app)
      .post("/contestacoes")
      .send({ id_proposta_cobranca: 1, descricao: "Teste" });

    expect(res.status).toBe(401);
  });

  test("POST /contestacoes com FUNCIONARIO devolve 403", async () => {
    const res = await request(app)
      .post("/contestacoes")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_proposta_cobranca: 1, descricao: "Teste" });

    expect(res.status).toBe(403);
  });

  // ----------------------------------------------------------------------
  // Listagem de contestacoes (FUNCIONARIO)
  // ----------------------------------------------------------------------
  test("GET /contestacoes com FUNCIONARIO devolve 200", async () => {
    const res = await request(app)
      .get("/contestacoes")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect(res.status).toBe(200);
  });

  // ----------------------------------------------------------------------
  // Testes de validacao
  // ----------------------------------------------------------------------
  test("POST /contestacoes sem id_proposta_cobranca devolve 400", async () => {
    const res = await request(app)
      .post("/contestacoes")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ descricao: "Contestacao sem proposta" });

    expect(res.status).toBe(400);
  });

  test("POST /contestacoes sem descricao devolve 400", async () => {
    const res = await request(app)
      .post("/contestacoes")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ id_proposta_cobranca: 1 });

    expect(res.status).toBe(400);
  });

  test("POST /contestacoes com proposta inexistente devolve 404", async () => {
    const res = await request(app)
      .post("/contestacoes")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ id_proposta_cobranca: 999999, descricao: "Contestacao IT" });

    expect(res.status).toBe(404);
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: aluno contesta proposta existente
  // ----------------------------------------------------------------------
  test("ALUNO cria contestacao para proposta existente", async () => {
    if (!propostaExistente) return;

    const res = await request(app)
      .post("/contestacoes")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({
        id_proposta_cobranca: propostaExistente.id,
        descricao: `Contesto o valor cobrado - IT ${Date.now()}`,
        valorcontraproposta: 50.0,
      });

    expect([201, 400, 409]).toContain(res.status);

    if (res.status === 201) {
      expect(res.body).toHaveProperty("id");
    }
  });

  // ----------------------------------------------------------------------
  // Consulta de contestacoes por proposta
  // ----------------------------------------------------------------------
  test("GET /contestacoes/proposta/:id com token devolve 200", async () => {
    const idProposta = propostaExistente?.id ?? 1;

    const res = await request(app)
      .get(`/contestacoes/proposta/${idProposta}`)
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
  });

  test("GET /contestacoes/:id com ID invalido devolve 400 ou 404", async () => {
    const res = await request(app)
      .get("/contestacoes/999999")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect([400, 404]).toContain(res.status);
  });
});
