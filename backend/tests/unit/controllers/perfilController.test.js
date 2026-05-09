/**
 * ------------------------------------------------------------------------
 * File: perfilController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de perfis
 * ------------------------------------------------------------------------
 */

const mockService = {
  preencherDadosAluno: jest.fn(),
  preencherDadosFuncionario: jest.fn(),
};

jest.mock("../../../services/perfilService", () => mockService);

const controller = require("../../../controllers/perfilController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("perfilController", () => {
  beforeEach(() => jest.clearAllMocks());

  // preencherDadosAluno
  test("preencherDadosAluno retorna 400 quando idUtilizador invalido", async () => {
    const res = mockRes();
    await controller.preencherDadosAluno({ params: { idUtilizador: "abc" }, body: { numeroaluno: 123 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("preencherDadosAluno retorna 400 quando numeroaluno invalido", async () => {
    const res = mockRes();
    await controller.preencherDadosAluno({ params: { idUtilizador: "1" }, body: { numeroaluno: "abc" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("preencherDadosAluno retorna 404 quando utilizador nao existe", async () => {
    mockService.preencherDadosAluno.mockRejectedValue(new Error("USER_NOT_FOUND"));
    const res = mockRes();
    await controller.preencherDadosAluno({ params: { idUtilizador: "999" }, body: { numeroaluno: 123 } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("preencherDadosAluno retorna 400 quando perfil nao e ALUNO", async () => {
    mockService.preencherDadosAluno.mockRejectedValue(new Error("USER_NOT_ALUNO"));
    const res = mockRes();
    await controller.preencherDadosAluno({ params: { idUtilizador: "1" }, body: { numeroaluno: 123 } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("preencherDadosAluno retorna 200 em sucesso", async () => {
    mockService.preencherDadosAluno.mockResolvedValue({ id_utilizador: 1, numeroaluno: 123 });
    const res = mockRes();
    await controller.preencherDadosAluno({ params: { idUtilizador: "1" }, body: { numeroaluno: 123 } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // preencherDadosFuncionario
  test("preencherDadosFuncionario retorna 400 quando idUtilizador invalido", async () => {
    const res = mockRes();
    await controller.preencherDadosFuncionario({ params: { idUtilizador: "xyz" }, body: { n_mecanografico: 111, cargo: "Diretor" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("preencherDadosFuncionario retorna 400 quando n_mecanografico invalido", async () => {
    const res = mockRes();
    await controller.preencherDadosFuncionario({ params: { idUtilizador: "1" }, body: { n_mecanografico: "abc", cargo: "Diretor" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("preencherDadosFuncionario retorna 400 quando cargo em falta", async () => {
    const res = mockRes();
    await controller.preencherDadosFuncionario({ params: { idUtilizador: "1" }, body: { n_mecanografico: 111, cargo: "" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("preencherDadosFuncionario retorna 404 quando utilizador nao existe", async () => {
    mockService.preencherDadosFuncionario.mockRejectedValue(new Error("USER_NOT_FOUND"));
    const res = mockRes();
    await controller.preencherDadosFuncionario({ params: { idUtilizador: "999" }, body: { n_mecanografico: 111, cargo: "Diretor" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("preencherDadosFuncionario retorna 400 quando perfil nao e FUNCIONARIO", async () => {
    mockService.preencherDadosFuncionario.mockRejectedValue(new Error("USER_NOT_FUNCIONARIO"));
    const res = mockRes();
    await controller.preencherDadosFuncionario({ params: { idUtilizador: "1" }, body: { n_mecanografico: 111, cargo: "Diretor" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("preencherDadosFuncionario retorna 200 em sucesso", async () => {
    mockService.preencherDadosFuncionario.mockResolvedValue({ id_utilizador: 2 });
    const res = mockRes();
    await controller.preencherDadosFuncionario({ params: { idUtilizador: "2" }, body: { n_mecanografico: 111, cargo: "Diretor" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
