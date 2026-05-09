/**
 * ------------------------------------------------------------------------
 * File: authController.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Unit testing do controller de autenticação
 * ------------------------------------------------------------------------
 */

const mockService = require("../../../services/authService");
mockService.register = jest.fn();
mockService.login = jest.fn();
mockService.getMe = jest.fn();

const controller = require("../../../controllers/authController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("authController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  // register - validação de input
  // ----------------------------------------------------------------------
  test("register retorna 400 quando faltam campos obrigatorios", async () => {
    const req = { body: { nome: "Ana", email: "ana@test.com" }, user: { perfil: "ADMIN" } };
    const res = mockRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("register retorna 400 quando perfil e invalido", async () => {
    const error = new Error("Perfil invalido.");
    error.code = "INVALID_PROFILE";
    mockService.register.mockRejectedValue(error);

    const req = {
      body: { nome: "Ana", email: "ana@test.com", password: "123", perfil: "INVALIDO" },
      user: { perfil: "ADMIN" },
    };
    const res = mockRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("register retorna 403 quando perfil de criacao e proibido", async () => {
    const error = new Error("Acesso proibido.");
    error.code = "FORBIDDEN_PROFILE_CREATION";
    mockService.register.mockRejectedValue(error);

    const req = {
      body: { nome: "Ana", email: "ana@test.com", password: "123", perfil: "ADMIN" },
      user: { perfil: "FUNCIONARIO" },
    };
    const res = mockRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("register retorna 409 quando email ja existe", async () => {
    const error = new Error("Email existe.");
    error.code = "EMAIL_ALREADY_EXISTS";
    mockService.register.mockRejectedValue(error);

    const req = {
      body: { nome: "Ana", email: "ana@test.com", password: "123", perfil: "ALUNO" },
      user: { perfil: "ADMIN" },
    };
    const res = mockRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  // ----------------------------------------------------------------------
  // register - perfect path
  // ----------------------------------------------------------------------
  test("register retorna 201 em criacao valida", async () => {
    mockService.register.mockResolvedValue({ message: "Registado.", user: { id: 1, email: "ana@test.com" } });

    const req = {
      body: { nome: "Ana", email: "ana@test.com", password: "123", perfil: "ALUNO" },
      user: { perfil: "ADMIN" },
    };
    const res = mockRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockService.register).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@test.com", perfilCriador: "ADMIN" })
    );
  });

  // ----------------------------------------------------------------------
  // login - validação de input
  // ----------------------------------------------------------------------
  test("login retorna 400 quando faltam email e password", async () => {
    const req = { body: {} };
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("login retorna 400 quando falta password", async () => {
    const req = { body: { email: "ana@test.com" } };
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("login retorna 401 com credenciais invalidas", async () => {
    const error = new Error("Credenciais invalidas.");
    error.code = "INVALID_CREDENTIALS";
    mockService.login.mockRejectedValue(error);

    const req = { body: { email: "ana@test.com", password: "errada" } };
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("login retorna 403 quando utilizador esta inativo", async () => {
    const error = new Error("Utilizador inativo.");
    error.code = "INACTIVE_USER";
    mockService.login.mockRejectedValue(error);

    const req = { body: { email: "ana@test.com", password: "123" } };
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  // ----------------------------------------------------------------------
  // login - perfect path
  // ----------------------------------------------------------------------
  test("login retorna 200 com token valido", async () => {
    mockService.login.mockResolvedValue({ message: "Login efetuado.", token: "fake_token" });

    const req = { body: { email: "ana@test.com", password: "123" } };
    const res = mockRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: "fake_token" }));
  });

  // ----------------------------------------------------------------------
  // me
  // ----------------------------------------------------------------------
  test("me retorna 200 com dados do utilizador autenticado", async () => {
    mockService.getMe.mockResolvedValue({ id: 1, nome: "Ana", email: "ana@test.com", perfil: "ALUNO" });

    const req = { user: { id: 1 } };
    const res = mockRes();

    await controller.me(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  test("me retorna 500 em erro inesperado", async () => {
    mockService.getMe.mockRejectedValue(new Error("Erro interno."));

    const req = { user: { id: 1 } };
    const res = mockRes();

    await controller.me(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
