/**
 * ------------------------------------------------------------------------
 * File: contaCorrenteController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de conta corrente
 * ------------------------------------------------------------------------
 */

const mockService = {
  obterTodosMovimentosContaCorrente: jest.fn(),
  obterMovimentoContaCorrente: jest.fn(),
  obterContaCorrentePorUtilizador: jest.fn(),
  marcarMovimentoComoExportado: jest.fn(),
  sincronizarMovimentosAluguer: jest.fn(),
};

jest.mock("../../../services/contaCorrenteService", () => mockService);

const controller = require("../../../controllers/contaCorrenteController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("contaCorrenteController", () => {
  beforeEach(() => jest.clearAllMocks());

  // obterTodosMovimentosContaCorrente
  test("obterTodosMovimentosContaCorrente retorna 200 com lista", async () => {
    mockService.obterTodosMovimentosContaCorrente.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await controller.obterTodosMovimentosContaCorrente({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("obterTodosMovimentosContaCorrente retorna 200 com mensagem quando vazia", async () => {
    mockService.obterTodosMovimentosContaCorrente.mockResolvedValue([]);
    const res = mockRes();
    await controller.obterTodosMovimentosContaCorrente({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // obterMovimentoContaCorrente
  test("obterMovimentoContaCorrente retorna 400 quando id nao e numero", async () => {
    const res = mockRes();
    await controller.obterMovimentoContaCorrente({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterMovimentoContaCorrente retorna 404 quando nao encontrado", async () => {
    mockService.obterMovimentoContaCorrente.mockResolvedValue(null);
    const res = mockRes();
    await controller.obterMovimentoContaCorrente({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("obterMovimentoContaCorrente retorna 200 quando encontrado", async () => {
    mockService.obterMovimentoContaCorrente.mockResolvedValue({ id: 1, valor: 50 });
    const res = mockRes();
    await controller.obterMovimentoContaCorrente({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // obterMinhaContaCorrente
  test("obterMinhaContaCorrente retorna 200 com conta do utilizador autenticado", async () => {
    mockService.obterContaCorrentePorUtilizador.mockResolvedValue({ id_utilizador: 1, saldo: 100 });
    const res = mockRes();
    await controller.obterMinhaContaCorrente({ user: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockService.obterContaCorrentePorUtilizador).toHaveBeenCalledWith(1);
  });

  // obterContaCorrentePorUtilizador
  test("obterContaCorrentePorUtilizador retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.obterContaCorrentePorUtilizador({ params: { idUtilizador: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterContaCorrentePorUtilizador retorna 200 com conta corrente", async () => {
    mockService.obterContaCorrentePorUtilizador.mockResolvedValue({ id_utilizador: 5, saldo: 200 });
    const res = mockRes();
    await controller.obterContaCorrentePorUtilizador({ params: { idUtilizador: "5" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // marcarMovimentoComoExportado
  test("marcarMovimentoComoExportado retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.marcarMovimentoComoExportado({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("marcarMovimentoComoExportado retorna 404 quando nao encontrado", async () => {
    mockService.obterMovimentoContaCorrente.mockResolvedValue(null);
    const res = mockRes();
    await controller.marcarMovimentoComoExportado({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("marcarMovimentoComoExportado retorna 200 em sucesso", async () => {
    mockService.obterMovimentoContaCorrente.mockResolvedValue({ id: 1 });
    mockService.marcarMovimentoComoExportado.mockResolvedValue({ id: 1, exportadofaturacao: true });
    const res = mockRes();
    await controller.marcarMovimentoComoExportado({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // sincronizarMovimentosAluguer
  test("sincronizarMovimentosAluguer retorna 200 com resultado", async () => {
    mockService.sincronizarMovimentosAluguer.mockResolvedValue({ criados: 3 });
    const res = mockRes();
    await controller.sincronizarMovimentosAluguer({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ criados: 3 });
  });
});
