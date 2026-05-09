/**
 * ------------------------------------------------------------------------
 * File: auxiliaresService.test.js
 * Date: 2026-05-09
 * Description: Unit testing do service de auxiliares
 * ------------------------------------------------------------------------
 */

const mockPrisma = {
  categoria: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
  tipo_figurino: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  acessorio: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
  estado_anuncio: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
  estado_reserva: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

jest.mock("../../../prisma/client", () => mockPrisma);

const service = require("../../../services/auxiliaresService");

describe("auxiliaresService", () => {
  beforeEach(() => jest.clearAllMocks());

  // obterCategorias
  test("obterCategorias retorna lista ordenada por nomecategoria", async () => {
    mockPrisma.categoria.findMany.mockResolvedValue([{ id: 1, nomecategoria: "Vestidos" }]);
    const result = await service.obterCategorias();
    expect(result).toHaveLength(1);
    expect(mockPrisma.categoria.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { nomecategoria: "asc" } })
    );
  });

  // criarCategoria
  test("criarCategoria lanca P2002 quando nome ja existe", async () => {
    mockPrisma.categoria.findFirst.mockResolvedValue({ id: 1, nomecategoria: "Vestidos" });
    await expect(service.criarCategoria("Vestidos")).rejects.toMatchObject({ code: "P2002" });
  });

  test("criarCategoria cria nova categoria quando nome nao existe", async () => {
    mockPrisma.categoria.findFirst.mockResolvedValue(null);
    mockPrisma.categoria.aggregate.mockResolvedValue({ _max: { id: 1 } });
    mockPrisma.categoria.create.mockResolvedValue({ id: 2, nomecategoria: "Fatos" });
    await service.criarCategoria("Fatos");
    expect(mockPrisma.categoria.create).toHaveBeenCalledWith({ data: { id: 2, nomecategoria: "Fatos" } });
  });

  // atualizarCategoria
  test("atualizarCategoria lanca P2002 quando nome duplicado noutro registo", async () => {
    mockPrisma.categoria.findFirst.mockResolvedValue({ id: 2, nomecategoria: "Vestidos" });
    await expect(service.atualizarCategoria(1, "Vestidos")).rejects.toMatchObject({ code: "P2002" });
  });

  test("atualizarCategoria actualiza com sucesso quando nome e unico", async () => {
    mockPrisma.categoria.findFirst.mockResolvedValue(null);
    mockPrisma.categoria.update.mockResolvedValue({ id: 1, nomecategoria: "Novo Nome" });
    await service.atualizarCategoria(1, "Novo Nome");
    expect(mockPrisma.categoria.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 }, data: { nomecategoria: "Novo Nome" } })
    );
  });

  // criarTipoFigurino
  test("criarTipoFigurino lanca P2002 quando tipo ja existe", async () => {
    mockPrisma.tipo_figurino.findFirst.mockResolvedValue({ id: 1, nome: "Vestido" });
    await expect(service.criarTipoFigurino("Vestido")).rejects.toMatchObject({ code: "P2002" });
  });

  test("criarTipoFigurino cria novo tipo quando nome nao existe", async () => {
    mockPrisma.tipo_figurino.findFirst.mockResolvedValue(null);
    mockPrisma.tipo_figurino.create.mockResolvedValue({ id: 2, nome: "Casaco" });
    await service.criarTipoFigurino("Casaco");
    expect(mockPrisma.tipo_figurino.create).toHaveBeenCalledWith({ data: { nome: "Casaco" } });
  });

  // criarAcessorio (usa obterProximoIdAuxiliar internamente)
  test("criarAcessorio lanca P2002 quando acessorio ja existe", async () => {
    mockPrisma.acessorio.findFirst.mockResolvedValue({ id: 1, nome: "Chapeu" });
    await expect(service.criarAcessorio("Chapeu")).rejects.toMatchObject({ code: "P2002" });
  });

  test("criarAcessorio cria acessorio com proximo ID calculado", async () => {
    mockPrisma.acessorio.findFirst.mockResolvedValue(null);
    mockPrisma.acessorio.aggregate.mockResolvedValue({ _max: { id: 3 } });
    mockPrisma.acessorio.create.mockResolvedValue({ id: 4, nome: "Cinto" });
    await service.criarAcessorio("Cinto");
    expect(mockPrisma.acessorio.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: 4, nome: "Cinto" }) })
    );
  });

  test("criarAcessorio usa ID 1 quando tabela esta vazia", async () => {
    mockPrisma.acessorio.findFirst.mockResolvedValue(null);
    mockPrisma.acessorio.aggregate.mockResolvedValue({ _max: { id: null } });
    mockPrisma.acessorio.create.mockResolvedValue({ id: 1, nome: "Chapeu" });
    await service.criarAcessorio("Chapeu");
    expect(mockPrisma.acessorio.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: 1 }) })
    );
  });

  // criarEstadoAnuncio (usa criarAuxiliarPorModelo)
  test("criarEstadoAnuncio lanca P2002 quando estado ja existe", async () => {
    mockPrisma.estado_anuncio.findFirst.mockResolvedValue({ id: 1, nome: "Ativo" });
    await expect(service.criarEstadoAnuncio("Ativo")).rejects.toMatchObject({ code: "P2002" });
  });

  test("criarEstadoAnuncio cria estado com proximo ID", async () => {
    mockPrisma.estado_anuncio.findFirst.mockResolvedValue(null);
    mockPrisma.estado_anuncio.aggregate.mockResolvedValue({ _max: { id: 2 } });
    mockPrisma.estado_anuncio.create.mockResolvedValue({ id: 3, nome: "Inativo" });
    await service.criarEstadoAnuncio("Inativo");
    expect(mockPrisma.estado_anuncio.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: 3, nome: "Inativo" }) })
    );
  });

  // obterEstadosReserva
  test("obterEstadosReserva retorna lista", async () => {
    mockPrisma.estado_reserva.findMany.mockResolvedValue([{ id: 1, nome: "Pendente" }]);
    const result = await service.obterEstadosReserva();
    expect(result).toHaveLength(1);
  });
});
