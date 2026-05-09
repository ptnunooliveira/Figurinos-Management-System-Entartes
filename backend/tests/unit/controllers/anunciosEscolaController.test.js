/**
 * ------------------------------------------------------------------------
 * File: anunciosEscolaController.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Unit testing do controller de anúncios da escola
 * ------------------------------------------------------------------------
 */

const mockService = require("../../../services/anunciosEscolaService");
mockService.criarAnuncioEscola = jest.fn();
mockService.obterTodosAnunciosEscola = jest.fn();
mockService.obterAnuncioEscolaPorId = jest.fn();
mockService.obterDisponibilidadeAnuncio = jest.fn();
mockService.atualizarAnuncioEscola = jest.fn();
mockService.eliminarAnuncioEscola = jest.fn();

const controller = require("../../../controllers/anunciosEscolaController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("anunciosEscolaController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  // criarAnuncioEscola - perfect path
  // ----------------------------------------------------------------------
  test("criarAnuncioEscola retorna 201 em criacao valida", async () => {
    mockService.criarAnuncioEscola.mockResolvedValue({ id: 1, id_figurino: 10, valordiarioaluguer: 5.0 });

    const req = { body: { id_figurino: 10, valordiarioaluguer: 5.0, id_estado: 1 } };
    const res = mockRes();

    await controller.criarAnuncioEscola(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("criarAnuncioEscola retorna 500 em erro inesperado", async () => {
    mockService.criarAnuncioEscola.mockRejectedValue(new Error("Erro BD."));

    const req = { body: { id_figurino: 10 } };
    const res = mockRes();

    await controller.criarAnuncioEscola(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ----------------------------------------------------------------------
  // listarAnunciosEscola
  // ----------------------------------------------------------------------
  test("listarAnunciosEscola retorna 200 com lista de anuncios", async () => {
    mockService.obterTodosAnunciosEscola.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const req = { query: {} };
    const res = mockRes();

    await controller.listarAnunciosEscola(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
  });

  test("listarAnunciosEscola passa filtros correctamente ao service", async () => {
    mockService.obterTodosAnunciosEscola.mockResolvedValue([]);

    const req = { query: { categoria: "2", tamanho: "M", sexo: "1" } };
    const res = mockRes();

    await controller.listarAnunciosEscola(req, res);

    expect(mockService.obterTodosAnunciosEscola).toHaveBeenCalledWith({
      categoria: "2", tamanho: "M", sexo: "1",
    });
  });

  // ----------------------------------------------------------------------
  // obterAnuncioEscolaPorId
  // ----------------------------------------------------------------------
  test("obterAnuncioEscolaPorId retorna 404 quando anuncio nao existe", async () => {
    mockService.obterAnuncioEscolaPorId.mockResolvedValue(null);

    const req = { params: { id: "999" } };
    const res = mockRes();

    await controller.obterAnuncioEscolaPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("obterAnuncioEscolaPorId retorna 200 quando anuncio existe", async () => {
    mockService.obterAnuncioEscolaPorId.mockResolvedValue({ id: 1, id_figurino: 5 });

    const req = { params: { id: "1" } };
    const res = mockRes();

    await controller.obterAnuncioEscolaPorId(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ----------------------------------------------------------------------
  // obterDisponibilidadeAnuncio - validacao de input
  // ----------------------------------------------------------------------
  test("obterDisponibilidadeAnuncio retorna 400 quando faltam datas", async () => {
    const req = { params: { id: "1" }, query: {} };
    const res = mockRes();

    await controller.obterDisponibilidadeAnuncio(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterDisponibilidadeAnuncio retorna 200 com dados de disponibilidade", async () => {
    mockService.obterDisponibilidadeAnuncio.mockResolvedValue({
      id_anuncio: 1, datas: [], datas_indisponiveis: [],
    });

    const req = { params: { id: "1" }, query: { dataInicio: "2026-06-01", dataFim: "2026-06-10" } };
    const res = mockRes();

    await controller.obterDisponibilidadeAnuncio(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("obterDisponibilidadeAnuncio retorna status do erro do service quando lanca erro com status", async () => {
    const error = new Error("Datas invalidas.");
    error.status = 400;
    mockService.obterDisponibilidadeAnuncio.mockRejectedValue(error);

    const req = { params: { id: "1" }, query: { dataInicio: "2026-06-10", dataFim: "2026-06-05" } };
    const res = mockRes();

    await controller.obterDisponibilidadeAnuncio(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ----------------------------------------------------------------------
  // eliminarAnuncioEscola
  // ----------------------------------------------------------------------
  test("eliminarAnuncioEscola retorna 409 quando anuncio tem reservas", async () => {
    const error = new Error("Tem reservas associadas.");
    error.code = "HAS_RESERVAS";
    mockService.eliminarAnuncioEscola.mockRejectedValue(error);

    const req = { params: { id: "1" } };
    const res = mockRes();

    await controller.eliminarAnuncioEscola(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("eliminarAnuncioEscola retorna 204 em eliminacao com sucesso", async () => {
    mockService.eliminarAnuncioEscola.mockResolvedValue({ id: 1 });

    const req = { params: { id: "1" } };
    const res = mockRes();

    await controller.eliminarAnuncioEscola(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
  });

  // ----------------------------------------------------------------------
  // atualizarAnuncioEscola
  // ----------------------------------------------------------------------
  test("atualizarAnuncioEscola retorna 200 em actualizacao valida", async () => {
    mockService.atualizarAnuncioEscola.mockResolvedValue({ id: 1, valordiarioaluguer: 20.0 });

    const req = { params: { id: "1" }, body: { valordiarioaluguer: 20.0 } };
    const res = mockRes();

    await controller.atualizarAnuncioEscola(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
