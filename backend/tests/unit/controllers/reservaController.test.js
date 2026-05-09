/**
 * ------------------------------------------------------------------------
 * File: reservaController.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Unit testing do controller de reservas
 * ------------------------------------------------------------------------
 */

const mockService = require("../../../services/reservaService");
mockService.obterTodasReservas = jest.fn();
mockService.obterReservasDoUtilizador = jest.fn();
mockService.obterReservaPorID = jest.fn();
mockService.obterDetalhesReserva = jest.fn();
mockService.criarReserva = jest.fn();
mockService.atualizarEstadoReserva = jest.fn();
mockService.atualizarEstadoLinhaReserva = jest.fn();
mockService.cancelarReserva = jest.fn();

const controller = require("../../../controllers/reservaController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("reservaController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  // obterReservasDoAluno - validacao de input
  // ----------------------------------------------------------------------
  test("obterReservasDoAluno retorna 400 para ID invalido", async () => {
    const req = { params: { id: "abc" } };
    const res = mockRes();

    await controller.obterReservasDoAluno(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterReservasDoAluno retorna 200 com reservas", async () => {
    mockService.obterReservasDoUtilizador.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const req = { params: { id: "5" } };
    const res = mockRes();

    await controller.obterReservasDoAluno(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ----------------------------------------------------------------------
  // obterReservaPorID - validacao de acesso
  // ----------------------------------------------------------------------
  test("obterReservaPorID retorna 400 para ID invalido", async () => {
    const req = { params: { id: "xyz" }, user: { id: 1, perfil: "ALUNO" } };
    const res = mockRes();

    await controller.obterReservaPorID(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterReservaPorID retorna 404 quando reserva nao existe", async () => {
    mockService.obterReservaPorID.mockResolvedValue(null);

    const req = { params: { id: "999" }, user: { id: 1, perfil: "ALUNO" } };
    const res = mockRes();

    await controller.obterReservaPorID(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("obterReservaPorID retorna 403 quando aluno tenta ver reserva de outro utilizador", async () => {
    mockService.obterReservaPorID.mockResolvedValue({ id: 1, id_utilizador: 99 });

    const req = { params: { id: "1" }, user: { id: 1, perfil: "ALUNO" } };
    const res = mockRes();

    await controller.obterReservaPorID(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("obterReservaPorID retorna 200 quando funcionario acede a qualquer reserva", async () => {
    mockService.obterReservaPorID.mockResolvedValue({ id: 1, id_utilizador: 99 });

    const req = { params: { id: "1" }, user: { id: 1, perfil: "FUNCIONARIO" } };
    const res = mockRes();

    await controller.obterReservaPorID(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ----------------------------------------------------------------------
  // criarReserva - validacao de input
  // ----------------------------------------------------------------------
  test("criarReserva retorna 400 quando funcionario nao envia id_aluno", async () => {
    const req = {
      user: { id: 1, perfil: "FUNCIONARIO" },
      body: { linhas: [{ id_anuncio: 1, datainicio: "2026-06-01", datafim: "2026-06-05" }] },
    };
    const res = mockRes();

    await controller.criarReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("criarReserva retorna 400 quando linhas estao vazias", async () => {
    const req = {
      user: { id: 1, perfil: "ALUNO" },
      body: { linhas: [] },
    };
    const res = mockRes();

    await controller.criarReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("criarReserva retorna 200 em criacao valida por aluno", async () => {
    mockService.criarReserva.mockResolvedValue({ id: 10, linha_reserva: [] });

    const req = {
      user: { id: 1, perfil: "ALUNO" },
      body: { linhas: [{ id_anuncio: 1, datainicio: "2026-06-01", datafim: "2026-06-05" }] },
    };
    const res = mockRes();

    await controller.criarReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ----------------------------------------------------------------------
  // atualizarEstadoReserva - validacao de input
  // ----------------------------------------------------------------------
  test("atualizarEstadoReserva retorna 400 para ID invalido", async () => {
    const req = {
      params: { id: "abc" },
      body: { id_estado: 2 },
      user: { id: 1, perfil: "FUNCIONARIO" },
    };
    const res = mockRes();

    await controller.atualizarEstadoReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("atualizarEstadoReserva retorna 400 quando falta id_estado", async () => {
    const req = {
      params: { id: "1" },
      body: {},
      user: { id: 1, perfil: "FUNCIONARIO" },
    };
    const res = mockRes();

    await controller.atualizarEstadoReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("atualizarEstadoReserva retorna 200 em actualizacao valida", async () => {
    mockService.atualizarEstadoReserva.mockResolvedValue({ id: 1, id_estado: 2 });

    const req = {
      params: { id: "1" },
      body: { id_estado: 2 },
      user: { id: 1, perfil: "FUNCIONARIO" },
    };
    const res = mockRes();

    await controller.atualizarEstadoReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ----------------------------------------------------------------------
  // cancelarReserva - validacao e perfect path
  // ----------------------------------------------------------------------
  test("cancelarReserva retorna 400 para ID invalido", async () => {
    const req = { params: { id: "xyz" }, user: { id: 1 } };
    const res = mockRes();

    await controller.cancelarReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("cancelarReserva retorna 200 em cancelamento valido", async () => {
    mockService.cancelarReserva.mockResolvedValue({ id: 1, id_estado: 5 });

    const req = { params: { id: "1" }, user: { id: 1 } };
    const res = mockRes();

    await controller.cancelarReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("cancelarReserva retorna 404 quando reserva nao existe", async () => {
    const error = new Error("Reserva nao encontrada.");
    error.code = "P2025";
    mockService.cancelarReserva.mockRejectedValue(error);

    const req = { params: { id: "999" }, user: { id: 1 } };
    const res = mockRes();

    await controller.cancelarReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("cancelarReserva retorna 403 quando aluno tenta cancelar reserva de outro", async () => {
    const error = new Error("Acesso negado.");
    error.status = 403;
    mockService.cancelarReserva.mockRejectedValue(error);

    const req = { params: { id: "1" }, user: { id: 1 } };
    const res = mockRes();

    await controller.cancelarReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  // ----------------------------------------------------------------------
  // atualizarEstadoLinhaReserva - validacao
  // ----------------------------------------------------------------------
  test("atualizarEstadoLinhaReserva retorna 400 para IDs invalidos", async () => {
    const req = {
      params: { id: "abc", idLinha: "xyz" },
      body: { id_estado: 2 },
      user: { id: 1 },
    };
    const res = mockRes();

    await controller.atualizarEstadoLinhaReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("atualizarEstadoLinhaReserva retorna 400 quando falta id_estado", async () => {
    const req = {
      params: { id: "1", idLinha: "5" },
      body: {},
      user: { id: 1 },
    };
    const res = mockRes();

    await controller.atualizarEstadoLinhaReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("atualizarEstadoLinhaReserva retorna 200 em actualizacao valida", async () => {
    mockService.atualizarEstadoLinhaReserva.mockResolvedValue({ id: 5, id_estado_linha_reserva: 2 });

    const req = {
      params: { id: "1", idLinha: "5" },
      body: { id_estado: 2 },
      user: { id: 1 },
    };
    const res = mockRes();

    await controller.atualizarEstadoLinhaReserva(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
