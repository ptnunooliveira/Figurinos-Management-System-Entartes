/**
 * ------------------------------------------------------------------------
 * File: contestacaoController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de contestacoes
 * ------------------------------------------------------------------------
 */

const mockContestacaoService = {
  obterTodasContestacoes: jest.fn(),
  obterContestacao: jest.fn(),
  criarContestacao: jest.fn(),
  obterContestacoesPorProposta: jest.fn(),
};

const mockPropostaService = {
  obterPropostaCobranca: jest.fn(),
};

jest.mock("../../../services/contestacaoService", () => mockContestacaoService);
jest.mock("../../../services/propostaCobrancaService", () => mockPropostaService);

const controller = require("../../../controllers/contestacaoController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("contestacaoController", () => {
  beforeEach(() => jest.clearAllMocks());

  // obterTodasContestacoes
  test("obterTodasContestacoes retorna 200 com lista", async () => {
    mockContestacaoService.obterTodasContestacoes.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await controller.obterTodasContestacoes({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("obterTodasContestacoes retorna 200 com mensagem quando lista vazia", async () => {
    mockContestacaoService.obterTodasContestacoes.mockResolvedValue([]);
    const res = mockRes();
    await controller.obterTodasContestacoes({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // obterContestacao
  test("obterContestacao retorna 400 quando id nao e numero", async () => {
    const res = mockRes();
    await controller.obterContestacao({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterContestacao retorna 404 quando nao encontrada", async () => {
    mockContestacaoService.obterContestacao.mockResolvedValue(null);
    const res = mockRes();
    await controller.obterContestacao({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("obterContestacao retorna 200 quando encontrada", async () => {
    mockContestacaoService.obterContestacao.mockResolvedValue({ id: 1 });
    const res = mockRes();
    await controller.obterContestacao({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // criarContestacao
  test("criarContestacao retorna 400 quando id_proposta_cobranca em falta", async () => {
    const req = { body: { descricao: "Contestacao" }, user: { id: 1 } };
    const res = mockRes();
    await controller.criarContestacao(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("criarContestacao retorna 400 quando id_proposta_cobranca nao e numero", async () => {
    const req = { body: { id_proposta_cobranca: "abc", descricao: "X" }, user: { id: 1 } };
    const res = mockRes();
    await controller.criarContestacao(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("criarContestacao retorna 400 quando descricao em falta", async () => {
    const req = { body: { id_proposta_cobranca: 5, descricao: "" }, user: { id: 1 } };
    const res = mockRes();
    await controller.criarContestacao(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("criarContestacao retorna 404 quando proposta nao existe", async () => {
    mockPropostaService.obterPropostaCobranca.mockResolvedValue(null);
    const req = { body: { id_proposta_cobranca: 999, descricao: "X" }, user: { id: 1 } };
    const res = mockRes();
    await controller.criarContestacao(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("criarContestacao retorna 201 em criacao valida", async () => {
    mockPropostaService.obterPropostaCobranca.mockResolvedValue({ id: 5 });
    mockContestacaoService.criarContestacao.mockResolvedValue({ id: 1 });
    const req = {
      body: { id_proposta_cobranca: 5, descricao: "Contestacao valida" },
      user: { id: 1 },
    };
    const res = mockRes();
    await controller.criarContestacao(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // obterContestacoesPorProposta
  test("obterContestacoesPorProposta retorna 400 quando id nao e numero", async () => {
    const res = mockRes();
    await controller.obterContestacoesPorProposta({ params: { idProposta: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterContestacoesPorProposta retorna 200 com lista", async () => {
    mockContestacaoService.obterContestacoesPorProposta.mockResolvedValue([{ id: 1 }]);
    const res = mockRes();
    await controller.obterContestacoesPorProposta({ params: { idProposta: "5" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
