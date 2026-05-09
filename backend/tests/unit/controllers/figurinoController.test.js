/**
 * ------------------------------------------------------------------------
 * File: figurinoController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de figurinos
 * ------------------------------------------------------------------------
 */

const mockService = {
  associarAcessorio: jest.fn(),
  obterTodosFigurinos: jest.fn(),
  obterFigurino: jest.fn(),
  obterHistoricoFigurino: jest.fn(),
  criarFigurino: jest.fn(),
  atualizarFigurino: jest.fn(),
  obterDisponibilidadeFigurino: jest.fn(),
  desativarFigurino: jest.fn(),
  eliminarFigurino: jest.fn(),
};

jest.mock("../../../services/figurinoService", () => mockService);

const controller = require("../../../controllers/figurinoController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("figurinoController", () => {
  beforeEach(() => jest.clearAllMocks());

  // associarAcessorio
  test("associarAcessorio retorna 400 quando id do figurino invalido", async () => {
    const res = mockRes();
    await controller.associarAcessorio({ params: { id: "abc" }, body: { id_acessorio: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("associarAcessorio retorna 400 quando id_acessorio em falta", async () => {
    const res = mockRes();
    await controller.associarAcessorio({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("associarAcessorio retorna 404 quando figurino nao encontrado", async () => {
    const err = new Error("Figurino nao encontrado."); err.code = "FIGURINO_NOT_FOUND";
    mockService.associarAcessorio.mockRejectedValue(err);
    const res = mockRes();
    await controller.associarAcessorio({ params: { id: "1" }, body: { id_acessorio: 1 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("associarAcessorio retorna 409 quando associacao ja existe", async () => {
    const err = new Error("Ja associado."); err.code = "ASSOCIATION_ALREADY_EXISTS";
    mockService.associarAcessorio.mockRejectedValue(err);
    const res = mockRes();
    await controller.associarAcessorio({ params: { id: "1" }, body: { id_acessorio: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("associarAcessorio retorna 201 em sucesso", async () => {
    mockService.associarAcessorio.mockResolvedValue({ id_figurino: 1, id_acessorio: 2 });
    const res = mockRes();
    await controller.associarAcessorio({ params: { id: "1" }, body: { id_acessorio: 2 } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  // obterTodosFigurinos
  test("obterTodosFigurinos retorna 200 com lista", async () => {
    mockService.obterTodosFigurinos.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = mockRes();
    await controller.obterTodosFigurinos({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("obterTodosFigurinos retorna 400 quando id_categoria nao e numero", async () => {
    const res = mockRes();
    await controller.obterTodosFigurinos({ query: { id_categoria: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterTodosFigurinos passa filtros correctamente ao service", async () => {
    mockService.obterTodosFigurinos.mockResolvedValue([]);
    const res = mockRes();
    await controller.obterTodosFigurinos({ query: { id_categoria: "2", tamanho: "M" } }, res);
    expect(mockService.obterTodosFigurinos).toHaveBeenCalledWith(
      expect.objectContaining({ id_categoria: 2, tamanho: "M" })
    );
  });

  // obterFigurino
  test("obterFigurino retorna 400 quando id nao e numero", async () => {
    const res = mockRes();
    await controller.obterFigurino({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterFigurino retorna 404 quando nao encontrado", async () => {
    mockService.obterFigurino.mockResolvedValue(null);
    const res = mockRes();
    await controller.obterFigurino({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("obterFigurino retorna 200 quando encontrado", async () => {
    mockService.obterFigurino.mockResolvedValue({ id: 1 });
    const res = mockRes();
    await controller.obterFigurino({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // obterHistoricoFigurino
  test("obterHistoricoFigurino retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.obterHistoricoFigurino({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterHistoricoFigurino retorna 404 quando nao encontrado", async () => {
    mockService.obterHistoricoFigurino.mockResolvedValue(null);
    const res = mockRes();
    await controller.obterHistoricoFigurino({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // criarFigurino
  test("criarFigurino retorna 201 em criacao valida", async () => {
    mockService.criarFigurino.mockResolvedValue({ id: 1, descricao: "Fato Preto" });
    const res = mockRes();
    await controller.criarFigurino({ body: { descricao: "Fato Preto" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("criarFigurino retorna 400 quando ACESSORIO_NOT_FOUND", async () => {
    const err = new Error("Acessorio nao encontrado."); err.code = "ACESSORIO_NOT_FOUND";
    mockService.criarFigurino.mockRejectedValue(err);
    const res = mockRes();
    await controller.criarFigurino({ body: { descricao: "X", id_acessorios: [999] } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // atualizarFigurino
  test("atualizarFigurino retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.atualizarFigurino({ params: { id: "abc" }, body: { descricao: "X" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("atualizarFigurino retorna 404 quando nao encontrado", async () => {
    mockService.obterFigurino.mockResolvedValue(null);
    const res = mockRes();
    await controller.atualizarFigurino({ params: { id: "999" }, body: { descricao: "X" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("atualizarFigurino retorna 400 quando body vazio", async () => {
    mockService.obterFigurino.mockResolvedValue({ id: 1 });
    const res = mockRes();
    await controller.atualizarFigurino({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("atualizarFigurino retorna 200 em actualizacao valida", async () => {
    mockService.obterFigurino.mockResolvedValue({ id: 1 });
    mockService.atualizarFigurino.mockResolvedValue({ id: 1, descricao: "Fato Azul" });
    const res = mockRes();
    await controller.atualizarFigurino({ params: { id: "1" }, body: { descricao: "Fato Azul" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // obterDisponibilidadeFigurino
  test("obterDisponibilidadeFigurino retorna 400 quando faltam datas", async () => {
    const res = mockRes();
    await controller.obterDisponibilidadeFigurino({ params: { id: "1" }, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("obterDisponibilidadeFigurino retorna 404 quando nao encontrado", async () => {
    mockService.obterDisponibilidadeFigurino.mockResolvedValue(null);
    const res = mockRes();
    await controller.obterDisponibilidadeFigurino({
      params: { id: "999" },
      query: { dataInicio: "2026-06-01", dataFim: "2026-06-10" },
    }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("obterDisponibilidadeFigurino retorna 200 com disponibilidade", async () => {
    mockService.obterDisponibilidadeFigurino.mockResolvedValue({ id: 1, disponivel: true });
    const res = mockRes();
    await controller.obterDisponibilidadeFigurino({
      params: { id: "1" },
      query: { dataInicio: "2026-06-01", dataFim: "2026-06-10" },
    }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // desativarFigurino
  test("desativarFigurino retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.desativarFigurino({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("desativarFigurino retorna 200 em sucesso", async () => {
    mockService.desativarFigurino.mockResolvedValue({ id: 1, ativo: false });
    const res = mockRes();
    await controller.desativarFigurino({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // eliminarFigurino
  test("eliminarFigurino retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.eliminarFigurino({ params: { id: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("eliminarFigurino propaga status do erro do service", async () => {
    const err = new Error("Tem anuncios associados."); err.status = 409;
    mockService.eliminarFigurino.mockRejectedValue(err);
    const res = mockRes();
    await controller.eliminarFigurino({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("eliminarFigurino retorna 200 em sucesso", async () => {
    mockService.eliminarFigurino.mockResolvedValue({ id: 1, eliminado: true });
    const res = mockRes();
    await controller.eliminarFigurino({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
