/**
 * ------------------------------------------------------------------------
 * File: devolucaoController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de devolucoes, ocorrencias e orcamentos
 * ------------------------------------------------------------------------
 */

const mockService = {
  obterDevolucoes: jest.fn(),
  obterDevolucaoPorId: jest.fn(),
  criarDevolucao: jest.fn(),
  obterOcorrencias: jest.fn(),
  obterOcorrenciasDoUtilizador: jest.fn(),
  obterOcorrenciaPorId: jest.fn(),
  criarOcorrencia: jest.fn(),
  atualizarEstadoOcorrencia: jest.fn(),
  obterOrcamentosPorOcorrencia: jest.fn(),
  criarOrcamento: jest.fn(),
  atualizarAprovacaoOrcamento: jest.fn(),
};

jest.mock("../../../services/devolucaoService", () => mockService);

const controller = require("../../../controllers/devolucaoController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("devolucaoController", () => {
  beforeEach(() => jest.clearAllMocks());

  // getDevolucoes
  test("getDevolucoes retorna 200 com lista", async () => {
    mockService.obterDevolucoes.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await controller.getDevolucoes({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // getDevolucaoById
  test("getDevolucaoById retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.getDevolucaoById({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getDevolucaoById retorna 404 quando nao encontrada", async () => {
    mockService.obterDevolucaoPorId.mockResolvedValue(null);
    const res = mockRes();
    await controller.getDevolucaoById({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getDevolucaoById retorna 200 quando encontrada", async () => {
    mockService.obterDevolucaoPorId.mockResolvedValue({ id: 1 });
    const res = mockRes();
    await controller.getDevolucaoById({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // createDevolucao
  test("createDevolucao retorna 400 quando campos obrigatorios em falta", async () => {
    const res = mockRes();
    await controller.createDevolucao({ body: { id_linha_reserva: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createDevolucao retorna 400 quando id_linha_reserva nao e positivo", async () => {
    const res = mockRes();
    await controller.createDevolucao({ body: { id_linha_reserva: -1, id_checklist: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createDevolucao retorna 400 quando datadevolucao e futura", async () => {
    const res = mockRes();
    await controller.createDevolucao({
      body: { id_linha_reserva: 1, id_checklist: 1, datadevolucao: "2099-12-31" }
    }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createDevolucao retorna 201 em criacao valida", async () => {
    mockService.criarDevolucao.mockResolvedValue({ id: 1 });
    const res = mockRes();
    await controller.createDevolucao({ body: { id_linha_reserva: 1, id_checklist: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("createDevolucao retorna 409 quando devolucao ja existe (CONFLICT)", async () => {
    const err = new Error("Ja existe."); err.code = "CONFLICT";
    mockService.criarDevolucao.mockRejectedValue(err);
    const res = mockRes();
    await controller.createDevolucao({ body: { id_linha_reserva: 1, id_checklist: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  // getOcorrencias
  test("getOcorrencias retorna 200 com lista", async () => {
    mockService.obterOcorrencias.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await controller.getOcorrencias({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // getMinhasOcorrencias
  test("getMinhasOcorrencias retorna 401 sem utilizador autenticado", async () => {
    const res = mockRes();
    await controller.getMinhasOcorrencias({ user: null }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("getMinhasOcorrencias retorna 200 com ocorrencias do utilizador", async () => {
    mockService.obterOcorrenciasDoUtilizador.mockResolvedValue([]);
    const res = mockRes();
    await controller.getMinhasOcorrencias({ user: { id: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // createOcorrencia
  test("createOcorrencia retorna 400 quando id_linha_reserva em falta", async () => {
    const res = mockRes();
    await controller.createOcorrencia({ body: { descricao: "Dano" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createOcorrencia retorna 400 quando descricao vazia", async () => {
    const res = mockRes();
    await controller.createOcorrencia({ body: { id_linha_reserva: 1, descricao: "  " } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createOcorrencia retorna 400 quando valor nao e positivo", async () => {
    const res = mockRes();
    await controller.createOcorrencia({ body: { id_linha_reserva: 1, descricao: "Dano", valor: -5 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createOcorrencia retorna 201 em criacao valida", async () => {
    mockService.criarOcorrencia.mockResolvedValue({ id: 1 });
    const res = mockRes();
    await controller.createOcorrencia({ body: { id_linha_reserva: 1, descricao: "Dano na manga" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // createOrcamento
  test("createOrcamento retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.createOrcamento({ params: { id: "abc" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createOrcamento retorna 400 quando fornecedor em falta", async () => {
    const res = mockRes();
    await controller.createOrcamento({ params: { id: "1" }, body: { valor: 100 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createOrcamento retorna 400 quando valor negativo", async () => {
    const res = mockRes();
    await controller.createOrcamento({ params: { id: "1" }, body: { fornecedor: "Costureira", valor: -10 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createOrcamento retorna 201 em criacao valida", async () => {
    mockService.criarOrcamento.mockResolvedValue({ id: 1 });
    const res = mockRes();
    await controller.createOrcamento({ params: { id: "1" }, body: { fornecedor: "Costureira", valor: 50 } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // updateAprovacaoOrcamento
  test("updateAprovacaoOrcamento retorna 400 quando aprovado nao e boolean", async () => {
    const res = mockRes();
    await controller.updateAprovacaoOrcamento({ params: { id: "1" }, body: { aprovado: "sim" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateAprovacaoOrcamento retorna 200 em aprovacao valida", async () => {
    mockService.atualizarAprovacaoOrcamento.mockResolvedValue({ id: 1, aprovado: true });
    const res = mockRes();
    await controller.updateAprovacaoOrcamento({ params: { id: "1" }, body: { aprovado: true } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // updateEstadoOcorrencia
  test("updateEstadoOcorrencia retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.updateEstadoOcorrencia({ params: { id: "abc" }, body: { id_estado: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateEstadoOcorrencia retorna 400 quando id_estado em falta", async () => {
    const res = mockRes();
    await controller.updateEstadoOcorrencia({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateEstadoOcorrencia retorna 200 em actualizacao valida", async () => {
    mockService.atualizarEstadoOcorrencia.mockResolvedValue({ id: 1, id_estado: 2 });
    const res = mockRes();
    await controller.updateEstadoOcorrencia({ params: { id: "1" }, body: { id_estado: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
