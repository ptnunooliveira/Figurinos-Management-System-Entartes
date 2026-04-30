/**
 * ------------------------------------------------------------------------
 * File: marketplaceService.test.js
 * Author: Tiago Gonçalves
 * Date: 2026-04-29
 * Version: 1.0
 * Description:
 * Unit testing dos services do marketplace
 * ------------------------------------------------------------------------
 */

const mockPrisma = {
  estado_anuncio: { findFirst: jest.fn() },
  anuncio_marketplace: {
    aggregate: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockStorage = {
  uploadImagensAnuncio: jest.fn(),
  listarImagensAnuncio: jest.fn(),
  substituirImagensAnuncio: jest.fn(),
};

jest.mock("../../../prisma/client", () => mockPrisma);
jest.mock("../../../utils/marketplaceStorage", () => mockStorage);

const service = require("../../../services/marketplaceService");

describe("marketplaceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.listarImagensAnuncio.mockResolvedValue([]);
  });

  test("criarAnuncioMarketplace cria anuncio como Submetido", async () => {
    mockPrisma.estado_anuncio.findFirst.mockResolvedValueOnce({ id: 2, nome: "Submetido" });
    mockPrisma.anuncio_marketplace.aggregate.mockResolvedValue({ _max: { id: 10 } });
    mockPrisma.anuncio_marketplace.create.mockResolvedValue({ id: 11 });
    mockPrisma.anuncio_marketplace.findUnique.mockResolvedValue({
      id: 11,
      titulo: "Titulo",
      descricao: "Desc",
      tamanho: "M",
      dataanuncio: new Date("2026-01-01"),
      dataaprovacao: null,
      categoria: null,
      tipo_figurino: null,
      sexo: null,
      estado_anuncio: { nome: "Submetido" },
      utilizador: { nome: "Ana" },
    });

    await service.criarAnuncioMarketplace({
      titulo: "Titulo",
      descricao: "Desc",
      tamanho: "M",
      imagens: [],
      id_categoria: 1,
      id_tipo: 1,
      id_sexo: 1,
      id_utilizador: 3,
    });

    expect(mockPrisma.anuncio_marketplace.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id_estado: 2, id_utilizador: 3 }) })
    );
  });

  test("atualizarEstadoAnuncioMarketplace aprova anuncio submetido", async () => {
    mockPrisma.anuncio_marketplace.findUnique
      .mockResolvedValueOnce({ id: 5, id_estado: 1 })
      .mockResolvedValueOnce({
        id: 5,
        titulo: "A",
        descricao: "B",
        tamanho: "M",
        dataanuncio: new Date("2026-01-01"),
        dataaprovacao: new Date("2026-01-02"),
        categoria: null,
        tipo_figurino: null,
        sexo: null,
        estado_anuncio: { nome: "Publicado" },
        utilizador: { nome: "Ana" },
      });
    mockPrisma.estado_anuncio.findFirst
      .mockResolvedValueOnce({ id: 1, nome: "Submetido" })
      .mockResolvedValueOnce({ id: 3, nome: "Publicado" });
    mockPrisma.anuncio_marketplace.update.mockResolvedValue({});

    await service.atualizarEstadoAnuncioMarketplace(5, true, null);

    expect(mockPrisma.anuncio_marketplace.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id_estado: 3, motivorejeicao: null }) })
    );
  });

  test("ressubmeterAnuncioMarketplace bloqueia quando utilizador nao e dono", async () => {
    mockPrisma.anuncio_marketplace.findUnique.mockResolvedValue({ id: 7, id_utilizador: 10, id_estado: 4 });

    await expect(
      service.ressubmeterAnuncioMarketplace(7, 12, { titulo: "Novo" }, [])
    ).rejects.toMatchObject({ code: "FORBIDDEN_OWNER" });
  });

  test("continuarAnuncioMarketplace muda PendenteRenovacao para Publicado", async () => {
    mockPrisma.anuncio_marketplace.findUnique
      .mockResolvedValueOnce({ id: 8, id_utilizador: 3, id_estado: 6 })
      .mockResolvedValueOnce({
        id: 8,
        titulo: "A",
        descricao: "B",
        tamanho: "M",
        dataanuncio: new Date("2026-01-01"),
        dataaprovacao: new Date("2026-01-30"),
        categoria: null,
        tipo_figurino: null,
        sexo: null,
        estado_anuncio: { nome: "Publicado" },
        utilizador: { nome: "Ana" },
      });
    mockPrisma.estado_anuncio.findFirst
      .mockResolvedValueOnce({ id: 5, nome: "Publicado" })
      .mockResolvedValueOnce({ id: 6, nome: "PendenteRenovacao" });
    mockPrisma.anuncio_marketplace.update.mockResolvedValue({});

    await service.continuarAnuncioMarketplace(8, 3);

    expect(mockPrisma.anuncio_marketplace.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id_estado: 5 }) })
    );
  });

  test("processarTransicoesTemporaisMarketplace processa rejeitados e publicados expirados", async () => {
    mockPrisma.estado_anuncio.findFirst
      .mockResolvedValueOnce({ id: 2, nome: "Rejeitado" })
      .mockResolvedValueOnce({ id: 9, nome: "Arquivado" })
      .mockResolvedValueOnce({ id: 3, nome: "Publicado" })
      .mockResolvedValueOnce({ id: 6, nome: "PendenteRenovacao" });
    mockPrisma.anuncio_marketplace.updateMany.mockResolvedValue({ count: 1 });

    await service.processarTransicoesTemporaisMarketplace();

    expect(mockPrisma.anuncio_marketplace.updateMany).toHaveBeenCalledTimes(2);
  });
});
