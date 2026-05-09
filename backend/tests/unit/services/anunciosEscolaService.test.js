/**
 * ------------------------------------------------------------------------
 * File: anunciosEscolaService.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Unit testing do service de anúncios da escola
 * ------------------------------------------------------------------------
 */

const mockPrisma = {
  anuncio_escola: {
    aggregate: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  linha_reserva: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  $queryRawUnsafe: jest.fn(),
};

jest.mock("../../../prisma/client", () => mockPrisma);

const service = require("../../../services/anunciosEscolaService");

describe("anunciosEscolaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  // criarAnuncioEscola - perfect path
  // ----------------------------------------------------------------------
  test("criarAnuncioEscola cria anuncio com id incrementado a partir do maximo", async () => {
    mockPrisma.anuncio_escola.aggregate.mockResolvedValue({ _max: { id: 5 } });
    mockPrisma.anuncio_escola.create.mockResolvedValue({ id: 6, id_figurino: 1, valordiarioaluguer: 10.0 });

    await service.criarAnuncioEscola({ id_figurino: 1, valordiarioaluguer: 10.0, id_estado: 1 });

    expect(mockPrisma.anuncio_escola.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: 6 }) })
    );
  });

  test("criarAnuncioEscola usa id 1 quando nao existem anuncios", async () => {
    mockPrisma.anuncio_escola.aggregate.mockResolvedValue({ _max: { id: null } });
    mockPrisma.anuncio_escola.create.mockResolvedValue({ id: 1, id_figurino: 2 });

    await service.criarAnuncioEscola({ id_figurino: 2, valordiarioaluguer: 5.0, id_estado: 1 });

    expect(mockPrisma.anuncio_escola.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id: 1 }) })
    );
  });

  // ----------------------------------------------------------------------
  // eliminarAnuncioEscola - regras de negocio
  // ----------------------------------------------------------------------
  test("eliminarAnuncioEscola lanca erro quando tem reservas associadas", async () => {
    mockPrisma.linha_reserva.count.mockResolvedValue(3);

    await expect(service.eliminarAnuncioEscola(1)).rejects.toMatchObject({ code: "HAS_RESERVAS" });
    expect(mockPrisma.anuncio_escola.delete).not.toHaveBeenCalled();
  });

  test("eliminarAnuncioEscola elimina anuncio sem reservas", async () => {
    mockPrisma.linha_reserva.count.mockResolvedValue(0);
    mockPrisma.anuncio_escola.delete.mockResolvedValue({ id: 1 });

    await service.eliminarAnuncioEscola(1);

    expect(mockPrisma.anuncio_escola.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  // ----------------------------------------------------------------------
  // obterDisponibilidadeAnuncio - validacao de datas
  // ----------------------------------------------------------------------
  test("obterDisponibilidadeAnuncio lanca erro quando data fim e anterior a data inicio", async () => {
    await expect(
      service.obterDisponibilidadeAnuncio(1, "2026-06-10", "2026-06-05")
    ).rejects.toMatchObject({ status: 400 });
  });

  test("obterDisponibilidadeAnuncio lanca erro para datas invalidas", async () => {
    await expect(
      service.obterDisponibilidadeAnuncio(1, "data-invalida", "tambem-invalida")
    ).rejects.toMatchObject({ status: 400 });
  });

  test("obterDisponibilidadeAnuncio lanca erro quando anuncio nao existe", async () => {
    mockPrisma.anuncio_escola.findUnique.mockResolvedValue(null);

    await expect(
      service.obterDisponibilidadeAnuncio(999, "2026-06-01", "2026-06-10")
    ).rejects.toMatchObject({ status: 404 });
  });

  test("obterDisponibilidadeAnuncio retorna disponibilidade para intervalo valido", async () => {
    mockPrisma.anuncio_escola.findUnique.mockResolvedValue({
      id: 1,
      id_figurino: 10,
      figurino: { id: 10, titulo: "Vestido Azul", descricao: "Vestido" },
    });
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ quantidade_stock: 2 }]);
    mockPrisma.linha_reserva.findMany.mockResolvedValue([]);

    const result = await service.obterDisponibilidadeAnuncio(1, "2026-06-01", "2026-06-03");

    expect(result).toHaveProperty("datas");
    expect(result.datas).toHaveLength(3); // 3 dias
    expect(result.datas_indisponiveis).toHaveLength(0);
  });

  test("obterDisponibilidadeAnuncio marca reserva e 3 dias apos devolucao como indisponiveis", async () => {
    const hoje = "2026-06-01";
    const amanha = "2026-06-02";

    mockPrisma.anuncio_escola.findUnique.mockResolvedValue({
      id: 1,
      id_figurino: 10,
      figurino: { id: 10, titulo: "Fato", descricao: "Fato" },
    });
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ quantidade_stock: 1 }]);
    mockPrisma.linha_reserva.findMany.mockResolvedValue([
      {
        id: 1,
        id_anuncio: 1,
        datainicio: new Date("2026-06-01T00:00:00.000Z"),
        datafim: new Date("2026-06-02T00:00:00.000Z"),
      },
    ]);

    const result = await service.obterDisponibilidadeAnuncio(1, hoje, "2026-06-05");

    expect(result.datas_indisponiveis).toContain(hoje);
    expect(result.datas_indisponiveis).toContain(amanha);
    expect(result.datas_indisponiveis).toContain("2026-06-03");
    expect(result.datas_indisponiveis).toContain("2026-06-04");
    expect(result.datas_indisponiveis).toContain("2026-06-05");
  });

  // ----------------------------------------------------------------------
  // obterTodosAnunciosEscola - filtros
  // ----------------------------------------------------------------------
  test("obterTodosAnunciosEscola retorna anuncios e exclui figurinos desativados por defeito", async () => {
    mockPrisma.anuncio_escola.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const result = await service.obterTodosAnunciosEscola({});

    expect(result).toHaveLength(2);
    // Mesmo sem filtros do utilizador, o servico aplica sempre uma
    // clausula where que exclui figurinos com ativo=false. Esta
    // confirmacao protege contra regressoes em que o filtro fosse
    // removido por engano e voltassem a aparecer figurinos suspensos.
    expect(mockPrisma.anuncio_escola.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { figurino: { ativo: { not: false } } },
      })
    );
  });

  test("obterTodosAnunciosEscola aplica filtro de categoria", async () => {
    mockPrisma.anuncio_escola.findMany.mockResolvedValue([{ id: 1 }]);

    await service.obterTodosAnunciosEscola({ categoria: "3" });

    expect(mockPrisma.anuncio_escola.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ figurino: expect.objectContaining({ id_categoria: 3 }) }),
      })
    );
  });

  // ----------------------------------------------------------------------
  // atualizarAnuncioEscola - perfect path
  // ----------------------------------------------------------------------
  test("atualizarAnuncioEscola actualiza os dados do anuncio", async () => {
    mockPrisma.anuncio_escola.update.mockResolvedValue({ id: 1, valordiarioaluguer: 15.0 });

    const result = await service.atualizarAnuncioEscola(1, { valordiarioaluguer: 15.0 });

    expect(mockPrisma.anuncio_escola.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { valordiarioaluguer: 15.0 },
    });
  });
});
