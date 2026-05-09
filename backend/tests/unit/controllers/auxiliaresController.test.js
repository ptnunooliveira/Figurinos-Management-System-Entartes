/**
 * ------------------------------------------------------------------------
 * File: auxiliaresController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de auxiliares
 * ------------------------------------------------------------------------
 */

jest.mock("../../../services/auxiliaresService");

const service = require("../../../services/auxiliaresService");
const controller = require("../../../controllers/auxiliaresController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("auxiliaresController", () => {
  beforeEach(() => jest.clearAllMocks());

  // getCategorias
  test("getCategorias retorna 200 com lista", async () => {
    service.obterCategorias.mockResolvedValue([{ id: 1, nomecategoria: "Vestidos" }]);
    const res = mockRes();
    await controller.getCategorias({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getCategorias retorna 500 em erro", async () => {
    service.obterCategorias.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.getCategorias({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // createCategoria
  test("createCategoria retorna 400 quando nome em falta", async () => {
    const res = mockRes();
    await controller.createCategoria({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createCategoria retorna 201 em criacao valida", async () => {
    service.criarCategoria.mockResolvedValue({ id: 1, nomecategoria: "Fatos" });
    const res = mockRes();
    await controller.createCategoria({ body: { nomecategoria: "Fatos" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("createCategoria retorna 409 quando categoria ja existe", async () => {
    const err = new Error("Ja existe"); err.code = "P2002";
    service.criarCategoria.mockRejectedValue(err);
    const res = mockRes();
    await controller.createCategoria({ body: { nomecategoria: "Fatos" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  // updateCategoria
  test("updateCategoria retorna 400 quando id invalido", async () => {
    const res = mockRes();
    await controller.updateCategoria({ params: { id: "abc" }, body: { nomecategoria: "X" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateCategoria retorna 400 quando nome em falta", async () => {
    const res = mockRes();
    await controller.updateCategoria({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateCategoria retorna 200 em actualizacao valida", async () => {
    service.atualizarCategoria.mockResolvedValue({ id: 1, nomecategoria: "Novo" });
    const res = mockRes();
    await controller.updateCategoria({ params: { id: "1" }, body: { nomecategoria: "Novo" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateCategoria retorna 404 quando categoria nao encontrada (P2025)", async () => {
    const err = new Error("Not found"); err.code = "P2025";
    service.atualizarCategoria.mockRejectedValue(err);
    const res = mockRes();
    await controller.updateCategoria({ params: { id: "1" }, body: { nomecategoria: "Novo" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // getCategoriaByNome
  test("getCategoriaByNome retorna 404 quando nao existe", async () => {
    service.obterCategoriaPorNome.mockResolvedValue(null);
    const res = mockRes();
    await controller.getCategoriaByNome({ params: { nome: "Inexistente" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getCategoriaByNome retorna 200 quando existe", async () => {
    service.obterCategoriaPorNome.mockResolvedValue({ id: 1, nomecategoria: "Vestidos" });
    const res = mockRes();
    await controller.getCategoriaByNome({ params: { nome: "Vestidos" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // getTiposFigurino
  test("getTiposFigurino retorna 200 com lista", async () => {
    service.obterTiposFigurino.mockResolvedValue([{ id: 1, nome: "Vestido" }]);
    const res = mockRes();
    await controller.getTiposFigurino({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // getSexos
  test("getSexos retorna 200 com lista", async () => {
    service.obterSexos.mockResolvedValue([{ id: 1, nome: "Feminino" }]);
    const res = mockRes();
    await controller.getSexos({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // getAcessorios
  test("getAcessorios retorna 200 com lista", async () => {
    service.obterAcessorios.mockResolvedValue([{ id: 1, nome: "Chapeu" }]);
    const res = mockRes();
    await controller.getAcessorios({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // getEstadosAnuncio (criarControllerAuxiliar)
  test("getEstadosAnuncio retorna 200 com lista", async () => {
    service.obterEstadosAnuncio.mockResolvedValue([{ id: 1, nome: "Disponivel" }]);
    const res = mockRes();
    await controller.getEstadosAnuncio({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("createEstadoAnuncio retorna 400 quando nome em falta", async () => {
    const res = mockRes();
    await controller.createEstadoAnuncio({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("createEstadoAnuncio retorna 201 em criacao valida", async () => {
    service.criarEstadoAnuncio.mockResolvedValue({ id: 1, nome: "Disponivel" });
    const res = mockRes();
    await controller.createEstadoAnuncio({ body: { nome: "Disponivel" } }, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("getEstadoAnuncioByNome retorna 404 quando nao existe", async () => {
    service.obterEstadoAnuncioPorNome.mockResolvedValue(null);
    const res = mockRes();
    await controller.getEstadoAnuncioByNome({ params: { nome: "X" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
