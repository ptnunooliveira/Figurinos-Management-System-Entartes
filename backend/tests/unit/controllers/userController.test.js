/**
 * ------------------------------------------------------------------------
 * File: userController.test.js
 * Date: 2026-05-09
 * Description: Unit testing do controller de utilizadores
 * ------------------------------------------------------------------------
 */

const mockService = {
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  disableUser: jest.fn(),
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

  // getAllUsers
  test("getAllUsers retorna 200 com lista de utilizadores", async () => {
    mockService.getAllUsers.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const res = mockRes();
    await controller.getAllUsers({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
  });

  test("getAllUsers retorna 500 em erro inesperado", async () => {
    mockService.getAllUsers.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.getAllUsers({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // getUserById
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

  // updateUser
  test("updateUser retorna 200 em actualizacao valida", async () => {
    mockService.updateUser.mockResolvedValue({ id: 1, nome: "Novo Nome" });
    const res = mockRes();
    await controller.updateUser({ params: { id: "1" }, body: { nome: "Novo Nome" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateUser retorna 404 quando utilizador nao existe", async () => {
    mockService.updateUser.mockRejectedValue(new Error("USER_NOT_FOUND"));
    const res = mockRes();
    await controller.updateUser({ params: { id: "999" }, body: { nome: "X" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateUser retorna 409 quando email ja existe noutro utilizador", async () => {
    mockService.updateUser.mockRejectedValue(new Error("EMAIL_ALREADY_EXISTS"));
    const res = mockRes();
    await controller.updateUser({ params: { id: "1" }, body: { email: "dup@test.com" } }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("updateUser retorna 500 em erro generico", async () => {
    mockService.updateUser.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.updateUser({ params: { id: "1" }, body: { nome: "X" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // disableUser
  test("disableUser retorna 200 em desativacao valida", async () => {
    mockService.disableUser.mockResolvedValue({ id: 1, ativo: false });
    const res = mockRes();
    await controller.disableUser({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("disableUser retorna 404 quando utilizador nao existe", async () => {
    mockService.disableUser.mockRejectedValue(new Error("USER_NOT_FOUND"));
    const res = mockRes();
    await controller.disableUser({ params: { id: "999" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("disableUser retorna 500 em erro generico", async () => {
    mockService.disableUser.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await controller.disableUser({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
