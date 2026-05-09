/**
 * ------------------------------------------------------------------------
 * File: userController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de utilizadores
 *
 * Cobre o mapeamento de erros do dominio em codigos HTTP:
 *   - USER_NOT_FOUND   -> 404
 *   - FORBIDDEN_TARGET -> 403
 *   - auto-suspensao   -> 400
 *   - erro generico    -> 500
 * ------------------------------------------------------------------------
 */

const mockService = {
  getAllUsers: jest.fn(),
  getAllUsersAdmin: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  disableUser: jest.fn(),
  enableUser: jest.fn(),
};

jest.mock("../../../services/userService", () => mockService);

const controller = require("../../../controllers/userController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("userController", () => {
  beforeEach(() => jest.clearAllMocks());

  // ----------------------------------------------------------------------
  // getAllUsers (alunos ativos)
  // ----------------------------------------------------------------------
  test("getAllUsers retorna 200 com lista de utilizadores", async () => {
    mockService.getAllUsers.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = mockRes();
    await controller.getAllUsers({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 1 })])
    );
  });

  test("getAllUsers retorna 500 em erro inesperado", async () => {
    mockService.getAllUsers.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.getAllUsers({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ----------------------------------------------------------------------
  // getAllUsersAdmin (todos os perfis)
  // ----------------------------------------------------------------------
  test("getAllUsersAdmin retorna 200 com lista completa", async () => {
    mockService.getAllUsersAdmin.mockResolvedValue([
      { id: 1, perfil: "ADMIN", ativo: true },
      { id: 2, perfil: "ALUNO", ativo: false },
    ]);
    const res = mockRes();
    await controller.getAllUsersAdmin({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getAllUsersAdmin retorna 500 em erro inesperado", async () => {
    mockService.getAllUsersAdmin.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.getAllUsersAdmin({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ----------------------------------------------------------------------
  // getUserById
  // ----------------------------------------------------------------------
  test("getUserById retorna 200 quando utilizador existe", async () => {
    mockService.getUserById.mockResolvedValue({ id: 1, nome: "Ana" });
    const res = mockRes();
    await controller.getUserById({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getUserById retorna 404 quando utilizador nao existe", async () => {
    mockService.getUserById.mockResolvedValue(null);
    const res = mockRes();
    await controller.getUserById({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getUserById retorna 500 em erro inesperado", async () => {
    mockService.getUserById.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.getUserById({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ----------------------------------------------------------------------
  // updateUser
  // ----------------------------------------------------------------------
  test("updateUser retorna 200 em actualizacao valida", async () => {
    mockService.updateUser.mockResolvedValue({ id: 1, nome: "Novo Nome" });
    const res = mockRes();
    await controller.updateUser(
      { params: { id: "1" }, body: { nome: "Novo Nome" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateUser retorna 404 quando utilizador nao existe", async () => {
    mockService.updateUser.mockRejectedValue(new Error("USER_NOT_FOUND"));
    const res = mockRes();
    await controller.updateUser(
      { params: { id: "999" }, body: { nome: "X" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateUser retorna 500 em erro generico", async () => {
    mockService.updateUser.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.updateUser(
      { params: { id: "1" }, body: { nome: "X" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ----------------------------------------------------------------------
  // disableUser
  // ----------------------------------------------------------------------
  test("disableUser retorna 200 em desativacao valida", async () => {
    mockService.disableUser.mockResolvedValue({ id: 1, ativo: false });
    const res = mockRes();
    await controller.disableUser(
      { params: { id: "1" }, user: { id: 99, perfil: "ADMIN" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
    // Confirma que o controller passa o actorPerfil ao service
    expect(mockService.disableUser).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ actorPerfil: "ADMIN" })
    );
  });

  test("disableUser retorna 400 quando utilizador tenta desativar a propria conta", async () => {
    const res = mockRes();
    await controller.disableUser(
      { params: { id: "5" }, user: { id: 5, perfil: "ADMIN" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockService.disableUser).not.toHaveBeenCalled();
  });

  test("disableUser retorna 404 quando utilizador nao existe", async () => {
    mockService.disableUser.mockRejectedValue(new Error("USER_NOT_FOUND"));
    const res = mockRes();
    await controller.disableUser(
      { params: { id: "999" }, user: { id: 99, perfil: "ADMIN" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("disableUser retorna 403 quando regra de negocio bloqueia o alvo", async () => {
    mockService.disableUser.mockRejectedValue(new Error("FORBIDDEN_TARGET"));
    const res = mockRes();
    await controller.disableUser(
      { params: { id: "7" }, user: { id: 99, perfil: "FUNCIONARIO" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("disableUser retorna 500 em erro generico", async () => {
    mockService.disableUser.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.disableUser(
      { params: { id: "1" }, user: { id: 99, perfil: "ADMIN" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ----------------------------------------------------------------------
  // enableUser
  // ----------------------------------------------------------------------
  test("enableUser retorna 200 em reativacao valida", async () => {
    mockService.enableUser.mockResolvedValue({ id: 1, ativo: true });
    const res = mockRes();
    await controller.enableUser(
      { params: { id: "1" }, user: { id: 99, perfil: "ADMIN" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockService.enableUser).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ actorPerfil: "ADMIN" })
    );
  });

  test("enableUser retorna 404 quando utilizador nao existe", async () => {
    mockService.enableUser.mockRejectedValue(new Error("USER_NOT_FOUND"));
    const res = mockRes();
    await controller.enableUser(
      { params: { id: "999" }, user: { id: 99, perfil: "ADMIN" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("enableUser retorna 403 quando regra de negocio bloqueia o alvo", async () => {
    mockService.enableUser.mockRejectedValue(new Error("FORBIDDEN_TARGET"));
    const res = mockRes();
    await controller.enableUser(
      { params: { id: "9" }, user: { id: 99, perfil: "FUNCIONARIO" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("enableUser retorna 500 em erro generico", async () => {
    mockService.enableUser.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.enableUser(
      { params: { id: "1" }, user: { id: 99, perfil: "ADMIN" } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
