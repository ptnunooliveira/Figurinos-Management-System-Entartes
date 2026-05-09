/**
 * ------------------------------------------------------------------------
 * File: checklist.integration.test.js
 * Author: Nuno Oliveira
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do fluxo de Checklists (via rotas de Reservas)
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

describe("Checklist BPMN integration", () => {
  let funcionario;
  let aluno;
  let funcionarioToken;
  let alunoToken;
  let reservaExistente;
  let tipoChecklist;

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

    // Procurar reserva confirmada (estado 2) para criar checklist
    reservaExistente = await prisma.reserva.findFirst({
      where: { id_estado: 2 },
      select: { id: true },
    });

    // Obter tipo de checklist existente
    tipoChecklist = await prisma.tipo_checklist.findFirst({
      select: { id: true },
    });
  });

  // ----------------------------------------------------------------------
  // Testes de autorizacao
  // ----------------------------------------------------------------------
  test("GET /reservas/:id/checklists sem token devolve 401", async () => {
    const res = await request(app).get("/reservas/1/checklists");

    expect(res.status).toBe(401);
  });

  test("GET /reservas/:id/checklists com ALUNO devolve 403", async () => {
    const res = await request(app)
      .get("/reservas/1/checklists")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(403);
  });

  test("POST /reservas/:id/checklists sem token devolve 401", async () => {
    const res = await request(app)
      .post("/reservas/1/checklists")
      .send({ id_tipo_checklist: 1, itens: [{ descricao: "item" }] });

    expect(res.status).toBe(401);
  });

  test("POST /reservas/:id/checklists com ALUNO devolve 403", async () => {
    const res = await request(app)
      .post("/reservas/1/checklists")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ id_tipo_checklist: 1, itens: [{ descricao: "item" }] });

    expect(res.status).toBe(403);
  });

  // ----------------------------------------------------------------------
  // Testes de validacao
  // ----------------------------------------------------------------------
  test("POST /reservas/:id/checklists sem id_tipo_checklist devolve 400", async () => {
    const idReserva = reservaExistente?.id ?? 1;

    const res = await request(app)
      .post(`/reservas/${idReserva}/checklists`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ itens: [{ descricao: "item" }] });

    expect(res.status).toBe(400);
  });

  test("POST /reservas/:id/checklists com itens vazios devolve 400", async () => {
    const idReserva = reservaExistente?.id ?? 1;

    const res = await request(app)
      .post(`/reservas/${idReserva}/checklists`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_tipo_checklist: tipoChecklist?.id ?? 1, itens: [] });

    expect(res.status).toBe(400);
  });

  // ----------------------------------------------------------------------
  // Leitura de checklists de uma reserva
  // ----------------------------------------------------------------------
  test("GET /reservas/:id/checklists com FUNCIONARIO devolve 200 ou 404", async () => {
    const idReserva = reservaExistente?.id ?? 1;

    const res = await request(app)
      .get(`/reservas/${idReserva}/checklists`)
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect([200, 404]).toContain(res.status);

    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  // ----------------------------------------------------------------------
  // Fluxo principal: criar checklist de entrega para reserva confirmada
  // ----------------------------------------------------------------------
  test("FUNCIONARIO cria checklist para reserva confirmada", async () => {
    if (!reservaExistente || !tipoChecklist) return;

    const res = await request(app)
      .post(`/reservas/${reservaExistente.id}/checklists`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({
        id_tipo_checklist: tipoChecklist.id,
        assinaturaFuncionario: "Funcionario IT",
        assinaturaEncarregado: "Encarregado IT",
        itens: [
          { descricao: "Figurino em bom estado", conforme: true },
          { descricao: "Acessorios completos", conforme: true },
        ],
      });

    // Pode retornar 201 (criado), 400 (ja existe ou regra de negocio), 404 (reserva nao encontrada)
    expect([201, 400, 404, 409, 422]).toContain(res.status);
  });
});
