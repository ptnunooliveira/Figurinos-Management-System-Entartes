/**
 * ------------------------------------------------------------------------
 * File: propostaCobrancaController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de propostas de cobranca
 * ------------------------------------------------------------------------
 */

const mockService = {
  obterTodasPropostasCobranca: jest.fn(),
  obterPropostaCobranca: jest.fn(),
  criarPropostaCobranca: jest.fn(),
  atualizarEstadoPropostaCobranca: jest.fn(),
  finalizarPropostaEmContaCorrente: jest.fn(),
  aceitarPropostaAluno: jest.fn(),
  resolverComContraproposta: jest.fn(),
};

jest.mock("../../../services/propostaCobrancaService", () => mockService);

const controller = require("../../../controllers/propostaCobrancaController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("propostaCobrancaController", () => {
  beforeEach(() => jest.clearAllMocks());

  // obterTodasPropostasCobranca
  test("obterTodasPropostasCobranca retorna 200 com lista", async () => {
    mockService.obterTodasPropostasCobranca.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await controller.obterTodasPropostasCobranca({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("obterTodasPropostasCobranca retorna 200 com mensagem quando vazia", async () => {
    mockService.obterTodasPropostasCobranca.mockResolvedValue([]);
    const res = mockRes();
    await controller.obterTodasPropostasCobranca({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // obterPropostaCobranca
  test("obterPropostaCobranca retorna 400 quando id nao e numero", async () => {
    const res = mockRes();
    await controller.obterPropostaCobranca({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterPropostaCobranca retorna 404 quando nao encontrada", async () => {
    mockService.obterPropostaCobranca.mockResolvedValue(null);
    const res = mockRes();
    await controller.obterPropostaCobranca({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("obterPropostaCobranca retorna 200 quando encontrada", async () => {
    mockService.obterPropostaCobranca.mockResolvedValue({ id: 1, valor: 50 });
    const res = mockRes();
    await controller.obterPropostaCobranca({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // criarPropostaCobranca
  test("criarPropostaCobranca retorna 400 quando id_ocorrencia em falta", async () => {
    const res = mockRes();
    await controller.criarPropostaCobranca({ body: { valor: 100 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("criarPropostaCobranca retorna 400 quando valor em falta", async () => {
    const res = mockRes();
    await controller.criarPropostaCobranca({ body: { id_ocorrencia: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("criarPropostaCobranca retorna 201 em criacao valida", async () => {
    mockService.criarPropostaCobranca.mockResolvedValue({ id: 1, valor: 100 });
    const res = mockRes();
    await controller.criarPropostaCobranca({ body: { id_ocorrencia: 1, valor: 100 } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // atualizarEstadoPropostaCobranca
  test("atualizarEstadoPropostaCobranca retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.atualizarEstadoPropostaCobranca({ params: { id: "abc" }, body: { id_estadopropostacobranca: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("atualizarEstadoPropostaCobranca retorna 400 quando id_estado em falta", async () => {
    const res = mockRes();
    await controller.atualizarEstadoPropostaCobranca({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("atualizarEstadoPropostaCobranca retorna 404 quando proposta nao existe", async () => {
    mockService.obterPropostaCobranca.mockResolvedValue(null);
    const res = mockRes();
    await controller.atualizarEstadoPropostaCobranca({ params: { id: "999" }, body: { id_estadopropostacobranca: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("atualizarEstadoPropostaCobranca retorna 200 em actualizacao valida", async () => {
    mockService.obterPropostaCobranca.mockResolvedValue({ id: 1 });
    mockService.atualizarEstadoPropostaCobranca.mockResolvedValue({ id: 1, id_estadopropostacobranca: 2 });
    const res = mockRes();
    await controller.atualizarEstadoPropostaCobranca({ params: { id: "1" }, body: { id_estadopropostacobranca: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // finalizarPropostaEmContaCorrente
  test("finalizarPropostaEmContaCorrente retorna 400 quando id_tipo_movimento em falta", async () => {
    const res = mockRes();
    await controller.finalizarPropostaEmContaCorrente({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("finalizarPropostaEmContaCorrente retorna 404 quando service retorna null", async () => {
    mockService.finalizarPropostaEmContaCorrente.mockResolvedValue(null);
    const res = mockRes();
    await controller.finalizarPropostaEmContaCorrente({ params: { id: "999" }, body: { id_tipo_movimento: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("finalizarPropostaEmContaCorrente retorna 201 em sucesso", async () => {
    mockService.finalizarPropostaEmContaCorrente.mockResolvedValue({ movimento: { id: 1 } });
    const res = mockRes();
    await controller.finalizarPropostaEmContaCorrente({ params: { id: "1" }, body: { id_tipo_movimento: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // aceitarPropostaAluno
  test("aceitarPropostaAluno retorna 401 quando utilizador nao identificado", async () => {
    const res = mockRes();
    await controller.aceitarPropostaAluno({ params: { id: "1" }, user: null }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("aceitarPropostaAluno retorna 403 quando utilizador nao e dono", async () => {
    const err = new Error("Nao autorizado."); err.statusCode = 403;
    mockService.aceitarPropostaAluno.mockRejectedValue(err);
    const res = mockRes();
    await controller.aceitarPropostaAluno({ params: { id: "1" }, user: { id: 99 } }, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("aceitarPropostaAluno retorna 200 em sucesso", async () => {
    mockService.aceitarPropostaAluno.mockResolvedValue({ proposta_atualizada: { id: 1 } });
    const res = mockRes();
    await controller.aceitarPropostaAluno({ params: { id: "1" }, user: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // resolverComContraproposta
  test("resolverComContraproposta retorna 400 quando valor em falta", async () => {
    const res = mockRes();
    await controller.resolverComContraproposta({ params: { idOcorrencia: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("resolverComContraproposta retorna 200 em sucesso", async () => {
    mockService.resolverComContraproposta.mockResolvedValue({ proposta: { id: 1 } });
    const res = mockRes();
    await controller.resolverComContraproposta({ params: { idOcorrencia: "1" }, body: { valor: 75 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
