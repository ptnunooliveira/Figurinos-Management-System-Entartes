/**
 * ------------------------------------------------------------------------
 * File: figurinoService.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Unit testing do service de figurinos
 * ------------------------------------------------------------------------
 */

const mockTx = {
  acessorio: { count: jest.fn() },
  figurino: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  figurino_acessorio: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  anuncio_escola: { count: jest.fn() },
  checklist_item: { count: jest.fn() },
  $executeRawUnsafe: jest.fn(),
  $queryRawUnsafe: jest.fn(),
};

const mockPrisma = {
  figurino: {
    aggregate: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  acessorio: { findUnique: jest.fn() },
  figurino_acessorio: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(mockTx)),
  $executeRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
};

jest.mock("../../../prisma/client", () => mockPrisma);

const service = require("../../../services/figurinoService");

describe("figurinoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  // associarAcessorio - validacoes
  // ----------------------------------------------------------------------
  test("associarAcessorio lanca erro para IDs invalidos", async () => {
    await expect(service.associarAcessorio(0, 1)).rejects.toMatchObject({ code: "INVALID_ID" });
    await expect(service.associarAcessorio(1, -1)).rejects.toMatchObject({ code: "INVALID_ID" });
  });

  test("associarAcessorio lanca erro quando figurino nao existe", async () => {
    mockPrisma.figurino.findUnique.mockResolvedValue(null);

    await expect(service.associarAcessorio(1, 1)).rejects.toMatchObject({ code: "FIGURINO_NOT_FOUND" });
  });

  test("associarAcessorio lanca erro quando acessorio nao existe", async () => {
    mockPrisma.figurino.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.acessorio.findUnique.mockResolvedValue(null);

    await expect(service.associarAcessorio(1, 99)).rejects.toMatchObject({ code: "ACESSORIO_NOT_FOUND" });
  });

  test("associarAcessorio lanca erro quando associacao ja existe", async () => {
    mockPrisma.figurino.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.acessorio.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.figurino_acessorio.findFirst.mockResolvedValue({ id_figurino: 1, id_acessorio: 1 });

    await expect(service.associarAcessorio(1, 1)).rejects.toMatchObject({ code: "ASSOCIATION_ALREADY_EXISTS" });
  });

  test("associarAcessorio cria associacao com sucesso", async () => {
    mockPrisma.figurino.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.acessorio.findUnique.mockResolvedValue({ id: 2 });
    mockPrisma.figurino_acessorio.findFirst.mockResolvedValue(null);
    mockPrisma.figurino_acessorio.create.mockResolvedValue({ id_figurino: 1, id_acessorio: 2 });

    const result = await service.associarAcessorio(1, 2);

    expect(mockPrisma.figurino_acessorio.create).toHaveBeenCalledWith({
      data: { id_figurino: 1, id_acessorio: 2 },
    });
  });

  // ----------------------------------------------------------------------
  // criarFigurino - validacoes e perfect path
  // ----------------------------------------------------------------------
  test("criarFigurino lanca erro quando acessorio nao existe", async () => {
    mockPrisma.figurino.aggregate.mockResolvedValue({ _max: { id: 5 } });
    mockTx.acessorio.count.mockResolvedValue(0); // nenhum acessorio encontrado
    mockTx.figurino.create.mockResolvedValue({ id: 6 });

    await expect(
      service.criarFigurino({ descricao: "Fato", id_acessorios: [99] })
    ).rejects.toMatchObject({ code: "ACESSORIO_NOT_FOUND" });
  });

  test("criarFigurino cria figurino sem acessorios", async () => {
    mockPrisma.figurino.aggregate.mockResolvedValue({ _max: { id: 5 } });
    mockTx.figurino.create.mockResolvedValue({ id: 6 });
    mockTx.$executeRawUnsafe.mockResolvedValue(1);
    mockTx.figurino.findUnique.mockResolvedValue({
      id: 6,
      descricao: "Fato",
      categoria: null,
      tipo_figurino: null,
      sexo: null,
      estado_condicao: null,
      figurino_acessorio: [],
    });
    mockTx.$queryRawUnsafe.mockResolvedValue([{ id: 6, titulo: "Fato Preto" }]);

    const result = await service.criarFigurino({ descricao: "Fato" });

    expect(mockTx.figurino.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: 6 }) })
    );
  });

  // ----------------------------------------------------------------------
  // eliminarFigurino - regras de negocio
  // ----------------------------------------------------------------------
  test("eliminarFigurino lanca erro quando figurino nao existe", async () => {
    mockTx.figurino.findUnique.mockResolvedValue(null);

    await expect(service.eliminarFigurino(999)).rejects.toMatchObject({ status: 404 });
  });

  test("eliminarFigurino lanca erro quando figurino tem anuncios associados", async () => {
    mockTx.figurino.findUnique.mockResolvedValue({ id: 1 });
    mockTx.anuncio_escola.count.mockResolvedValue(2);
    mockTx.checklist_item.count.mockResolvedValue(0);

    await expect(service.eliminarFigurino(1)).rejects.toMatchObject({ status: 409 });
  });

  test("eliminarFigurino lanca erro quando figurino tem checklists associados", async () => {
    mockTx.figurino.findUnique.mockResolvedValue({ id: 1 });
    mockTx.anuncio_escola.count.mockResolvedValue(0);
    mockTx.checklist_item.count.mockResolvedValue(1);

    await expect(service.eliminarFigurino(1)).rejects.toMatchObject({ status: 409 });
  });

  test("eliminarFigurino elimina figurino sem dependencias", async () => {
    mockTx.figurino.findUnique.mockResolvedValue({ id: 1 });
    mockTx.anuncio_escola.count.mockResolvedValue(0);
    mockTx.checklist_item.count.mockResolvedValue(0);
    mockTx.figurino_acessorio.deleteMany.mockResolvedValue({ count: 0 });
    mockTx.figurino.delete.mockResolvedValue({ id: 1 });

    const result = await service.eliminarFigurino(1);

    expect(mockTx.figurino_acessorio.deleteMany).toHaveBeenCalledWith({ where: { id_figurino: 1 } });
    expect(mockTx.figurino.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toMatchObject({ id: 1, eliminado: true });
  });

  // ----------------------------------------------------------------------
  // desativarFigurino
  // ----------------------------------------------------------------------
  test("desativarFigurino desativa figurino existente", async () => {
    mockPrisma.$executeRaw.mockResolvedValue(1);

    const result = await service.desativarFigurino(1);

    expect(result).toMatchObject({ id: 1, ativo: false });
  });
});
