/**
 * ------------------------------------------------------------------------
 * File: userService.test.js
 * Date: 2026-05-09
 * Description: Unit testing do service de utilizadores
 *
 * Cobre o CRUD basico e a regra de quem pode atuar sobre quem
 * nas operacoes de (des)ativacao:
 *   - ADMIN pode atuar sobre ALUNOS e FUNCIONARIOS.
 *   - ADMIN nao pode atuar sobre ADMINs (regra absoluta).
 *   - FUNCIONARIO so pode atuar sobre ALUNOS.
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

  // ----------------------------------------------------------------------
  // getAllUsers (alunos ativos)
  // ----------------------------------------------------------------------
  test("getAllUsers retorna lista de alunos ativos", async () => {
    mockPrisma.utilizador.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.getAllUsers();
    expect(result).toHaveLength(2);
    expect(mockPrisma.utilizador.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { ativo: true, perfil: "ALUNO" } })
    );
  });

  // ----------------------------------------------------------------------
  // getAllUsersAdmin (todos os perfis, inclui suspensos)
  // ----------------------------------------------------------------------
  test("getAllUsersAdmin retorna todos os utilizadores sem filtro de perfil/ativo", async () => {
    mockPrisma.utilizador.findMany.mockResolvedValue([
      { id: 1, perfil: "ADMIN", ativo: true },
      { id: 2, perfil: "ALUNO", ativo: false },
    ]);
    const result = await service.getAllUsersAdmin();
    expect(result).toHaveLength(2);
    // Confirmar que NAO ha clausula where (ou que ela nao filtra)
    const callArgs = mockPrisma.utilizador.findMany.mock.calls[0][0];
    expect(callArgs.where).toBeUndefined();
  });

  // ----------------------------------------------------------------------
  // getUserById
  // ----------------------------------------------------------------------
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

  // ----------------------------------------------------------------------
  // updateUser
  // ----------------------------------------------------------------------
  test("updateUser lanca erro quando utilizador nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    await expect(service.updateUser(999, { nome: "Novo" })).rejects.toThrow("USER_NOT_FOUND");
  });

  test("updateUser actualiza utilizador com sucesso", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, email: "ana@test.com" });
    mockPrisma.utilizador.update.mockResolvedValue({ id: 1, nome: "Ana Nova" });

    await service.updateUser(1, { nome: "Ana Nova" });

    expect(mockPrisma.utilizador.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ nome: "Ana Nova" }) })
    );
  });

  test("updateUser encripta nova password quando fornecida", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.utilizador.update.mockResolvedValue({ id: 1 });

    await service.updateUser(1, { password: "novaPass" });

    expect(mockPrisma.utilizador.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ pw_hashed: "hashed_pw" }) })
    );
  });

  // ----------------------------------------------------------------------
  // disableUser - caminhos basicos
  // ----------------------------------------------------------------------
  test("disableUser lanca erro quando utilizador nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    await expect(
      service.disableUser(999, { actorPerfil: "ADMIN" })
    ).rejects.toThrow("USER_NOT_FOUND");
  });

  test("disableUser desativa ALUNO quando actor e' ADMIN", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, perfil: "ALUNO" });
    mockPrisma.utilizador.update.mockResolvedValue({ id: 1, ativo: false });

    await service.disableUser(1, { actorPerfil: "ADMIN" });

    expect(mockPrisma.utilizador.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { ativo: false } })
    );
  });

  test("disableUser desativa FUNCIONARIO quando actor e' ADMIN", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 2, perfil: "FUNCIONARIO" });
    mockPrisma.utilizador.update.mockResolvedValue({ id: 2, ativo: false });

    await service.disableUser(2, { actorPerfil: "ADMIN" });

    expect(mockPrisma.utilizador.update).toHaveBeenCalled();
  });

  test("disableUser desativa ALUNO quando actor e' FUNCIONARIO", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 3, perfil: "ALUNO" });
    mockPrisma.utilizador.update.mockResolvedValue({ id: 3, ativo: false });

    await service.disableUser(3, { actorPerfil: "FUNCIONARIO" });

    expect(mockPrisma.utilizador.update).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------------
  // disableUser - regras de permissao (FORBIDDEN_TARGET)
  // ----------------------------------------------------------------------
  test("disableUser bloqueia ADMIN a desativar outro ADMIN (regra absoluta)", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 9, perfil: "ADMIN" });

    await expect(
      service.disableUser(9, { actorPerfil: "ADMIN" })
    ).rejects.toThrow("FORBIDDEN_TARGET");

    expect(mockPrisma.utilizador.update).not.toHaveBeenCalled();
  });

  test("disableUser bloqueia FUNCIONARIO a desativar FUNCIONARIO", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 5, perfil: "FUNCIONARIO" });

    await expect(
      service.disableUser(5, { actorPerfil: "FUNCIONARIO" })
    ).rejects.toThrow("FORBIDDEN_TARGET");

    expect(mockPrisma.utilizador.update).not.toHaveBeenCalled();
  });

  test("disableUser bloqueia FUNCIONARIO a desativar ADMIN", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 7, perfil: "ADMIN" });

    await expect(
      service.disableUser(7, { actorPerfil: "FUNCIONARIO" })
    ).rejects.toThrow("FORBIDDEN_TARGET");
  });

  // ----------------------------------------------------------------------
  // enableUser - caminhos basicos e simetria com disableUser
  // ----------------------------------------------------------------------
  test("enableUser lanca erro quando utilizador nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    await expect(
      service.enableUser(999, { actorPerfil: "ADMIN" })
    ).rejects.toThrow("USER_NOT_FOUND");
  });

  test("enableUser reativa ALUNO quando actor e' FUNCIONARIO", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, perfil: "ALUNO" });
    mockPrisma.utilizador.update.mockResolvedValue({ id: 1, ativo: true });

    await service.enableUser(1, { actorPerfil: "FUNCIONARIO" });

    expect(mockPrisma.utilizador.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { ativo: true } })
    );
  });

  test("enableUser bloqueia FUNCIONARIO a reativar FUNCIONARIO", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 5, perfil: "FUNCIONARIO" });

    await expect(
      service.enableUser(5, { actorPerfil: "FUNCIONARIO" })
    ).rejects.toThrow("FORBIDDEN_TARGET");
  });

  test("enableUser bloqueia mesmo um ADMIN a reativar outro ADMIN (regra absoluta)", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 9, perfil: "ADMIN" });

    await expect(
      service.enableUser(9, { actorPerfil: "ADMIN" })
    ).rejects.toThrow("FORBIDDEN_TARGET");
  });
});
