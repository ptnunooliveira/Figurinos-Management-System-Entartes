/**
 * ------------------------------------------------------------------------
 * File: perfilService.test.js
 * Date: 2026-05-09
 * Description: Unit testing do service de perfis
 * ------------------------------------------------------------------------
 */

const mockPrisma = {
  utilizador: { findUnique: jest.fn() },
  aluno: { upsert: jest.fn() },
  funcionario: { upsert: jest.fn() },
};

jest.mock("../../../prisma/client", () => mockPrisma);

const service = require("../../../services/perfilService");

describe("perfilService", () => {
  beforeEach(() => jest.clearAllMocks());

  // preencherDadosAluno
  test("preencherDadosAluno lanca USER_NOT_FOUND quando utilizador nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    await expect(service.preencherDadosAluno(999, 12345)).rejects.toThrow("USER_NOT_FOUND");
  });

  test("preencherDadosAluno lanca USER_NOT_ALUNO quando perfil nao e ALUNO", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, perfil: "FUNCIONARIO" });
    await expect(service.preencherDadosAluno(1, 12345)).rejects.toThrow("USER_NOT_ALUNO");
  });

  test("preencherDadosAluno cria dados do aluno com sucesso via upsert", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, perfil: "ALUNO" });
    mockPrisma.aluno.upsert.mockResolvedValue({ id_utilizador: 1, numeroaluno: 12345 });

    const result = await service.preencherDadosAluno(1, 12345);

    expect(mockPrisma.aluno.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_utilizador: 1 },
        update: { numeroaluno: 12345 },
        create: expect.objectContaining({ id_utilizador: 1, numeroaluno: 12345 }),
      })
    );
  });

  // preencherDadosFuncionario
  test("preencherDadosFuncionario lanca USER_NOT_FOUND quando utilizador nao existe", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);
    await expect(service.preencherDadosFuncionario(999, 111, "Diretor")).rejects.toThrow("USER_NOT_FOUND");
  });

  test("preencherDadosFuncionario lanca USER_NOT_FUNCIONARIO quando perfil nao e FUNCIONARIO", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, perfil: "ALUNO" });
    await expect(service.preencherDadosFuncionario(1, 111, "Diretor")).rejects.toThrow("USER_NOT_FUNCIONARIO");
  });

  test("preencherDadosFuncionario cria dados do funcionario com sucesso via upsert", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 2, perfil: "FUNCIONARIO" });
    mockPrisma.funcionario.upsert.mockResolvedValue({ id_utilizador: 2, n_mecanografico: 111, cargo: "Diretor" });

    await service.preencherDadosFuncionario(2, 111, "Diretor");

    expect(mockPrisma.funcionario.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id_utilizador: 2 },
        update: { n_mecanografico: 111, cargo: "Diretor" },
        create: expect.objectContaining({ id_utilizador: 2, n_mecanografico: 111, cargo: "Diretor" }),
      })
    );
  });
});
