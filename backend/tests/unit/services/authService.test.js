/**
 * ------------------------------------------------------------------------
 * File: authService.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Unit testing do service de autenticação
 * ------------------------------------------------------------------------
 */

const mockPrisma = {
  utilizador: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockHash = {
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
};

const mockToken = {
  generateToken: jest.fn(),
};

jest.mock("../../../prisma/client", () => mockPrisma);
jest.mock("../../../utils/hash", () => mockHash);
jest.mock("../../../utils/token", () => mockToken);

const service = require("../../../services/authService");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  // register - validação de perfil
  // ----------------------------------------------------------------------
  test("register lanca erro quando perfil e invalido", async () => {
    await expect(
      service.register({ nome: "Ana", email: "ana@test.com", password: "123", perfil: "INVALIDO", perfilCriador: "ADMIN" })
    ).rejects.toMatchObject({ code: "INVALID_PROFILE" });
  });

  test("register lanca erro quando perfil esta vazio", async () => {
    await expect(
      service.register({ nome: "Ana", email: "ana@test.com", password: "123", perfil: "", perfilCriador: "ADMIN" })
    ).rejects.toMatchObject({ code: "INVALID_PROFILE" });
  });

  test("register lanca erro quando FUNCIONARIO tenta criar nao-ALUNO", async () => {
    await expect(
      service.register({ nome: "Ana", email: "ana@test.com", password: "123", perfil: "FUNCIONARIO", perfilCriador: "FUNCIONARIO" })
    ).rejects.toMatchObject({ code: "FORBIDDEN_PROFILE_CREATION" });
  });

  test("register lanca erro quando nao-ADMIN tenta criar perfil privilegiado", async () => {
    await expect(
      service.register({ nome: "Ana", email: "ana@test.com", password: "123", perfil: "ADMIN", perfilCriador: "FUNCIONARIO" })
    ).rejects.toMatchObject({ code: "FORBIDDEN_PROFILE_CREATION" });
  });

  // ----------------------------------------------------------------------
  // register - validação de email duplicado
  // ----------------------------------------------------------------------
  test("register lanca erro quando email ja existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, email: "ana@test.com" });

    await expect(
      service.register({ nome: "Ana", email: "ana@test.com", password: "123", perfil: "ALUNO", perfilCriador: "FUNCIONARIO" })
    ).rejects.toMatchObject({ code: "EMAIL_ALREADY_EXISTS" });
  });

  // ----------------------------------------------------------------------
  // register - perfect path
  // ----------------------------------------------------------------------
  test("register cria utilizador ALUNO com sucesso por FUNCIONARIO", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    mockHash.hashPassword.mockResolvedValue("hashed_pw");
    mockPrisma.utilizador.create.mockResolvedValue({
      id: 1, nome: "Ana", email: "ana@test.com", perfil: "ALUNO", ativo: true,
    });

    const result = await service.register({
      nome: "Ana", email: "ana@test.com", password: "123", perfil: "ALUNO", perfilCriador: "FUNCIONARIO",
    });

    expect(mockPrisma.utilizador.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ perfil: "ALUNO", ativo: true }) })
    );
    expect(result.user.email).toBe("ana@test.com");
  });

  test("register cria ADMIN com sucesso por ADMIN", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    mockHash.hashPassword.mockResolvedValue("hashed_pw");
    mockPrisma.utilizador.create.mockResolvedValue({
      id: 2, nome: "Boss", email: "boss@test.com", perfil: "ADMIN", ativo: true,
    });

    const result = await service.register({
      nome: "Boss", email: "boss@test.com", password: "123", perfil: "ADMIN", perfilCriador: "ADMIN",
    });

    expect(result.user.perfil).toBe("ADMIN");
  });

  // ----------------------------------------------------------------------
  // login - erros
  // ----------------------------------------------------------------------
  test("login lanca erro quando utilizador nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: "noexiste@test.com", password: "123" })
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  test("login lanca erro quando utilizador esta inativo", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, ativo: false, pw_hashed: "hash" });

    await expect(
      service.login({ email: "ana@test.com", password: "123" })
    ).rejects.toMatchObject({ code: "INACTIVE_USER" });
  });

  test("login lanca erro quando password e incorreta", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, ativo: true, pw_hashed: "hash" });
    mockHash.comparePassword.mockResolvedValue(false);

    await expect(
      service.login({ email: "ana@test.com", password: "errada" })
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" });
  });

  // ----------------------------------------------------------------------
  // login - perfect path
  // ----------------------------------------------------------------------
  test("login retorna token em login valido", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({
      id: 1, nome: "Ana", email: "ana@test.com", perfil: "ALUNO", ativo: true, pw_hashed: "hash",
    });
    mockHash.comparePassword.mockResolvedValue(true);
    mockToken.generateToken.mockReturnValue("token_jwt");

    const result = await service.login({ email: "ana@test.com", password: "123" });

    expect(result.token).toBe("token_jwt");
    expect(mockToken.generateToken).toHaveBeenCalledTimes(1);
  });

  // ----------------------------------------------------------------------
  // getMe
  // ----------------------------------------------------------------------
  test("getMe lanca erro quando utilizador nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);

    await expect(service.getMe(999)).rejects.toThrow("Utilizador não encontrado.");
  });

  test("getMe retorna dados do utilizador autenticado", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({
      id: 1, nome: "Ana", email: "ana@test.com", contacto: null, data_registo: new Date(), perfil: "ALUNO",
    });

    const result = await service.getMe(1);

    expect(result.id).toBe(1);
    expect(result.email).toBe("ana@test.com");
    expect(result).not.toHaveProperty("pw_hashed");
  });
});
