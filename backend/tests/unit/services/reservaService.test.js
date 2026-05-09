/**
 * ------------------------------------------------------------------------
 * File: reservaService.test.js
 * Author: Tiago Goncalves
 * Date: 2026-05-09
 * Version: 1.0
 * Description:
 * Unit testing do service de reservas
 * ------------------------------------------------------------------------
 */

const mockTx = {
  anuncio_escola: { findUnique: jest.fn() },
  linha_reserva: { count: jest.fn() },
  reserva: { create: jest.fn() },
  $queryRawUnsafe: jest.fn(),
};

const mockPrisma = {
  reserva: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  linha_reserva: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  anuncio_escola: { findUnique: jest.fn() },
  utilizador: { findUnique: jest.fn() },
  $transaction: jest.fn((fn) => fn(mockTx)),
  $queryRawUnsafe: jest.fn(),
};

jest.mock("../../../prisma/client", () => mockPrisma);

const service = require("../../../services/reservaService");

describe("reservaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ----------------------------------------------------------------------
  // atualizarEstadoReserva - transições de estado
  // ----------------------------------------------------------------------
  test("atualizarEstadoReserva lanca erro para transicao invalida de CONCLUIDA", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id_estado: 4 }); // CONCLUIDA (estado final)

    await expect(
      service.atualizarEstadoReserva(1, 2, 1)
    ).rejects.toMatchObject({ message: expect.stringContaining("Não é permitido") });
  });

  test("atualizarEstadoReserva actualiza de PENDENTE para CONFIRMADA", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id_estado: 1 }); // PENDENTE
    mockPrisma.reserva.update.mockResolvedValue({ id: 1, id_estado: 2 });

    await service.atualizarEstadoReserva(1, 2, 1);

    expect(mockPrisma.reserva.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id_estado: 2 }) })
    );
  });

  test("atualizarEstadoReserva cancela linhas quando estado passa a CANCELADA", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id_estado: 1 }); // PENDENTE
    mockPrisma.reserva.update.mockResolvedValue({ id: 1, id_estado: 5 });
    mockPrisma.linha_reserva.updateMany.mockResolvedValue({ count: 2 });

    await service.atualizarEstadoReserva(1, 5, 1); // CANCELADA

    expect(mockPrisma.linha_reserva.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { id_estado_linha_reserva: 5 } })
    );
  });

  test("atualizarEstadoReserva cancela linhas quando estado passa a ATRASADA", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id_estado: 3 }); // EM CURSO
    mockPrisma.reserva.update.mockResolvedValue({ id: 1, id_estado: 6 });
    mockPrisma.linha_reserva.updateMany.mockResolvedValue({ count: 1 });

    await service.atualizarEstadoReserva(1, 6, 1); // ATRASADA

    expect(mockPrisma.linha_reserva.updateMany).toHaveBeenCalled();
  });

  // ----------------------------------------------------------------------
  // cancelarReserva - erros
  // ----------------------------------------------------------------------
  test("cancelarReserva lanca erro quando reserva nao existe", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue(null);

    await expect(service.cancelarReserva(999, 1)).rejects.toMatchObject({ code: "P2025" });
  });

  test("cancelarReserva lanca erro quando utilizador nao e dono", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id_estado: 1, id_utilizador: 10 });

    await expect(service.cancelarReserva(1, 99)).rejects.toMatchObject({ status: 403 });
  });

  test("cancelarReserva lanca erro quando reserva nao esta PENDENTE", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id_estado: 2, id_utilizador: 1 }); // CONFIRMADA

    await expect(service.cancelarReserva(1, 1)).rejects.toMatchObject({ status: 400 });
  });

  // ----------------------------------------------------------------------
  // cancelarReserva - perfect path
  // ----------------------------------------------------------------------
  test("cancelarReserva cancela reserva PENDENTE com sucesso", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id_estado: 1, id_utilizador: 1 });
    mockPrisma.reserva.update.mockResolvedValue({ id: 1, id_estado: 5, linha_reserva: [] });

    await service.cancelarReserva(1, 1);

    expect(mockPrisma.reserva.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ id_estado: 5 }) })
    );
  });

  // ----------------------------------------------------------------------
  // atualizarEstadoLinhaReserva - erros
  // ----------------------------------------------------------------------
  test("atualizarEstadoLinhaReserva lanca erro quando linha nao existe", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue(null);

    await expect(service.atualizarEstadoLinhaReserva(1, 999, 2, 1)).rejects.toMatchObject({ status: 404 });
  });

  test("atualizarEstadoLinhaReserva lanca erro quando linha nao pertence a reserva", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue({ id_estado_linha_reserva: 1, id_reserva: 5 });

    await expect(service.atualizarEstadoLinhaReserva(1, 10, 2, 1)).rejects.toMatchObject({ status: 400 });
  });

  test("atualizarEstadoLinhaReserva lanca erro para transicao invalida", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue({ id_estado_linha_reserva: 2, id_reserva: 1 }); // CONFIRMADA - sem transicoes

    await expect(service.atualizarEstadoLinhaReserva(1, 10, 5, 1)).rejects.toMatchObject({ status: 400 });
  });

  // ----------------------------------------------------------------------
  // atualizarEstadoLinhaReserva - perfect path
  // ----------------------------------------------------------------------
  test("atualizarEstadoLinhaReserva actualiza linha de PENDENTE para CONFIRMADA", async () => {
    mockPrisma.linha_reserva.findUnique
      .mockResolvedValueOnce({ id_estado_linha_reserva: 1, id_reserva: 1 }) // linha actual
      .mockResolvedValueOnce({ id: 10, estado_linha_reserva: { nome: "CONFIRMADA" } }); // resultado final
    mockPrisma.linha_reserva.update.mockResolvedValue({});
    mockPrisma.linha_reserva.findMany.mockResolvedValue([
      { id_estado_linha_reserva: 2 }, // todas confirmadas, nenhuma pendente
    ]);
    mockPrisma.reserva.update.mockResolvedValue({});

    const result = await service.atualizarEstadoLinhaReserva(1, 10, 2, 1);

    expect(mockPrisma.linha_reserva.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 10 }, data: { id_estado_linha_reserva: 2 } })
    );
  });

  // ----------------------------------------------------------------------
  // criarReserva - validações de input
  // ----------------------------------------------------------------------
  test("criarReserva lanca erro quando carrinho esta vazio", async () => {
    await expect(
      service.criarReserva(1, null, { linhas: [] })
    ).rejects.toMatchObject({ status: 400 });
  });

  test("criarReserva lanca erro quando aluno nao existe ou nao e ALUNO", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue(null);

    await expect(
      service.criarReserva(999, null, { linhas: [{ id_anuncio: 1, datainicio: "2026-06-01", datafim: "2026-06-05" }] })
    ).rejects.toMatchObject({ status: 400 });
  });

  test("criarReserva valida disponibilidade com 3 dias de margem apos devolucao", async () => {
    mockPrisma.utilizador.findUnique.mockResolvedValue({ id: 1, perfil: "ALUNO", ativo: true });
    mockTx.anuncio_escola.findUnique.mockResolvedValue({
      id: 1,
      id_figurino: 10,
      valordiarioaluguer: 5,
      figurino: { id: 10, titulo: "Fato", descricao: "Descricao do fato" },
    });
    mockTx.linha_reserva.count.mockResolvedValue(1);

    await expect(
      service.criarReserva(1, null, { linhas: [{ id_anuncio: 1, datainicio: "2026-06-05", datafim: "2026-06-07" }] })
    ).rejects.toMatchObject({ status: 409 });

    expect(mockTx.linha_reserva.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          datafim: {
            gte: expect.any(Date),
          },
        }),
      })
    );
    const chamada = mockTx.linha_reserva.count.mock.calls[0][0];
    expect(chamada.where.datafim.gte.toISOString().slice(0, 10)).toBe("2026-06-02");
  });
});
