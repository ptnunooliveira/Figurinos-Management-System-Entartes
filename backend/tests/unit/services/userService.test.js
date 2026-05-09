/**
 * ------------------------------------------------------------------------
 * File: userService.test.js
 * Date: 2026-05-09
 * Description: Unit testing do service de utilizadores
 * ------------------------------------------------------------------------
 */

const mockPrisma = {
  utilizador: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock("../../../prisma/client", () => mockPrisma);
jest.mock("bcrypt", () => ({ hash: jest.fn().mockResolvedValue("hashed_pw") }));

const service = require("../../../services/userService");

describe("userService", () => {
  beforeEach(() => jest.clearAllMocks());

  // getAllUsers
  test("getAllUsers retorna lista de alunos ativos", async () => {
    mockPrisma.utilizador.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.getAllUsers();
    expect(result).toHaveLength(2);
    expect(mockPrisma.utilizador.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { ativo: true, perfil: "ALUNO" } })
    );
  });

  // getUserById
  test("getUserById retorna utilizador existente", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, nome: "Ana" });
    const result = await service.getUserById(1);
    expect(result.id).toBe(1);
  });

  test("getUserById retorna null quando nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    const result = await service.getUserById(999);
    expect(result).toBeNull();
  });

  // updateUser
  test("updateUser lanca erro quando utilizador nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    await expect(service.updateUser(999, { nome: "Novo" })).rejects.toThrow("USER_NOT_FOUND");
  });

  test("updateUser lanca erro quando email ja existe noutro utilizador", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, email: "ana@test.com" });
    mockPrisma.utilizador.findFirst.mockResolvedValue({ id: 2, email: "novo@test.com" });
    await expect(service.updateUser(1, { email: "novo@test.com" })).rejects.toThrow("EMAIL_ALREADY_EXISTS");
  });

  test("updateUser actualiza utilizador com sucesso", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, email: "ana@test.com" });
    mockPrisma.utilizador.findFirst.mockResolvedValue(null);
    mockPrisma.utilizador.update.mockResolvedValue({ id: 1, nome: "Ana Nova" });

    await service.updateUser(1, { nome: "Ana Nova" });

    expect(mockPrisma.utilizador.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ nome: "Ana Nova" }) })
    );
  });

  test("updateUser encripta nova password quando fornecida", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.utilizador.findFirst.mockResolvedValue(null);
    mockPrisma.utilizador.update.mockResolvedValue({ id: 1 });

    await service.updateUser(1, { password: "novaPass" });

    expect(mockPrisma.utilizador.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ pw_hashed: "hashed_pw" }) })
    );
  });

  // disableUser
  test("disableUser lanca erro quando utilizador nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    await expect(service.disableUser(999)).rejects.toThrow("USER_NOT_FOUND");
  });

  test("disableUser desativa utilizador existente", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, ativo: true });
    mockPrisma.utilizador.update.mockResolvedValue({ id: 1, ativo: false });

    await service.disableUser(1);

    expect(mockPrisma.utilizador.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { ativo: false } })
    );
  });
});
