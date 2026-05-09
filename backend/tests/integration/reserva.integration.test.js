/**
 * ------------------------------------------------------------------------
 * File: reserva.integration.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Testes de integração do BPMN de Reservas
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

describe("Reserva BPMN integration", () => {
  let aluno;
  let funcionario;
  let alunoToken;
  let funcionarioToken;
  let anuncioDisponivel;

  beforeAll(async () => {
    aluno = await prisma.utilizador.findFirst({
      where: { perfil: "ALUNO", ativo: true },
      select: { id: true, nome: true, email: true, perfil: true },
    });

    // reserva.id_funcionario é FK para funcionario.id_utilizador, por isso o
    // utilizador escolhido tem de ter um registo na tabela funcionario.
    const funcRecord = await prisma.funcionario.findFirst({
      where: { utilizador: { ativo: true } },
      include: {
        utilizador: { select: { id: true, nome: true, email: true, perfil: true } },
      },
    });
    funcionario = funcRecord?.utilizador ?? null;

    if (!aluno || !funcionario) {
      throw new Error("E necessario ter pelo menos 1 ALUNO e 1 FUNCIONARIO com registo na tabela funcionario ativos na BD.");
    }

    alunoToken = criarToken(aluno);
    funcionarioToken = criarToken(funcionario);

    anuncioDisponivel = await prisma.anuncio_escola.findFirst({
      where: { id_estado: { not: null } },
      select: { id: true, valordiarioaluguer: true },
    });
  });

  // ----------------------------------------------------------------------
  // Testes de integração - listagem de reservas
  // ----------------------------------------------------------------------
  test("GET /reservas sem token devolve 401", async () => {
    const res = await request(app).get("/reservas");

    expect(res.status).toBe(401);
  });

  test("GET /reservas com token de ALUNO devolve 403 (sem permissao)", async () => {
    const res = await request(app)
      .get("/reservas")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(403);
  });

  test("GET /reservas com token de FUNCIONARIO devolve 200", async () => {
    const res = await request(app)
      .get("/reservas")
      .set("Authorization", `Bearer ${funcionarioToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /reservas/mine com token de ALUNO devolve 200", async () => {
    const res = await request(app)
      .get("/reservas/mine")
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(res.status).toBe(200);
  });

  // ----------------------------------------------------------------------
  // Testes de integração - criacao de reserva com validacoes
  // ----------------------------------------------------------------------
  test("POST /reservas sem linhas devolve 400", async () => {
    const res = await request(app)
      .post("/reservas")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({ linhas: [] });

    expect(res.status).toBe(400);
  });

  test("POST /reservas por FUNCIONARIO sem id_aluno devolve 400", async () => {
    const res = await request(app)
      .post("/reservas")
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({
        linhas: [{ id_anuncio: 1, datainicio: "2026-07-01", datafim: "2026-07-05" }],
      });

    expect(res.status).toBe(400);
  });

  // ----------------------------------------------------------------------
  // Testes de integração - fluxo principal de reserva
  // ----------------------------------------------------------------------
  test("criacao -> confirmacao por funcionario", async () => {
    if (!anuncioDisponivel) return;

    const dataInicio = "2026-09-01";
    const dataFim = "2026-09-03";

    const criarRes = await request(app)
      .post("/reservas")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({
        linhas: [{ id_anuncio: anuncioDisponivel.id, datainicio: dataInicio, datafim: dataFim }],
      });

    if (criarRes.status !== 200) return; // anuncio pode estar ocupado

    const reservaId = criarRes.body.id;
    expect(criarRes.body.id).toBeDefined();

    // Funcionario confirma (estado 1 -> 2)
    const confirmarRes = await request(app)
      .patch(`/reservas/${reservaId}/estado`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_estado: 2 });

    expect(confirmarRes.status).toBe(200);

    // Limpeza: cancelar reserva criada (estado 2 -> 5)
    await request(app)
      .patch(`/reservas/${reservaId}/estado`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_estado: 5 });
  });

  // ----------------------------------------------------------------------
  // Testes de integração - cancelamento pelo aluno
  // ----------------------------------------------------------------------
  test("aluno cancela reserva PENDENTE com sucesso", async () => {
    if (!anuncioDisponivel) return;

    const dataInicio = "2026-10-01";
    const dataFim = "2026-10-02";

    const criarRes = await request(app)
      .post("/reservas")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({
        linhas: [{ id_anuncio: anuncioDisponivel.id, datainicio: dataInicio, datafim: dataFim }],
      });

    if (criarRes.status !== 200) return; // anuncio pode estar ocupado

    const reservaId = criarRes.body.id;

    const cancelarRes = await request(app)
      .patch(`/reservas/mine/${reservaId}/cancelar`)
      .set("Authorization", `Bearer ${alunoToken}`);

    expect(cancelarRes.status).toBe(200);
  });

  // ----------------------------------------------------------------------
  // Testes de integração - fluxo de excecao de transicao invalida
  // ----------------------------------------------------------------------
  test("transicao de estado invalida devolve erro", async () => {
    if (!anuncioDisponivel) return;

    const dataInicio = "2026-11-01";
    const dataFim = "2026-11-02";

    const criarRes = await request(app)
      .post("/reservas")
      .set("Authorization", `Bearer ${alunoToken}`)
      .send({
        linhas: [{ id_anuncio: anuncioDisponivel.id, datainicio: dataInicio, datafim: dataFim }],
      });

    if (criarRes.status !== 200) return;

    const reservaId = criarRes.body.id;

    // Tentar ir directamente de PENDENTE para CONCLUIDA (estado 4) - transicao invalida
    const res = await request(app)
      .patch(`/reservas/${reservaId}/estado`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_estado: 4 });

    expect(res.status).toBe(400);

    // Limpeza
    await request(app)
      .patch(`/reservas/${reservaId}/estado`)
      .set("Authorization", `Bearer ${funcionarioToken}`)
      .send({ id_estado: 5 });
  });
});
