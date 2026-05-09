/**
 * ------------------------------------------------------------------------
 * File: contaCorrenteService.test.js
 * Date: 2026-05-09
 * Description: Unit testing do service de conta corrente
 * ------------------------------------------------------------------------
 */

const mockPrisma = {
  conta_corrente: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  devolucao: { findMany: jest.fn() },
};

jest.mock("../../../prisma/client", () => mockPrisma);

const service = require("../../../services/contaCorrenteService");

describe("contaCorrenteService", () => {
  beforeEach(() => jest.clearAllMocks());

  // obterTodosMovimentosContaCorrente
  test("obterTodosMovimentosContaCorrente retorna lista de movimentos", async () => {
    mockPrisma.conta_corrente.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.obterTodosMovimentosContaCorrente();
    expect(result).toHaveLength(2);
    expect(mockPrisma.conta_corrente.findMany).toHaveBeenCalled();
  });

  // obterMovimentoContaCorrente
  test("obterMovimentoContaCorrente retorna movimento existente", async () => {
    mockPrisma.conta_corrente.findUnique.mockResolvedValue({ id: 1, valor: 50 });
    const result = await service.obterMovimentoContaCorrente(1);
    expect(result.id).toBe(1);
  });

  test("obterMovimentoContaCorrente retorna null quando nao existe", async () => {
    mockPrisma.conta_corrente.findUnique.mockResolvedValue(null);
    const result = await service.obterMovimentoContaCorrente(999);
    expect(result).toBeNull();
  });

  // obterContaCorrentePorUtilizador
  test("obterContaCorrentePorUtilizador calcula saldo e total_movimentos correctamente", async () => {
    mockPrisma.conta_corrente.findMany.mockResolvedValue([
      { id: 1, valor: 30 },
      { id: 2, valor: 20 },
    ]);
    const result = await service.obterContaCorrentePorUtilizador(5);
    expect(result.id_utilizador).toBe(5);
    expect(result.saldo).toBe(50);
    expect(result.total_movimentos).toBe(2);
    expect(result.movimentos).toHaveLength(2);
  });

  test("obterContaCorrentePorUtilizador retorna saldo zero quando sem movimentos", async () => {
    mockPrisma.conta_corrente.findMany.mockResolvedValue([]);
    const result = await service.obterContaCorrentePorUtilizador(5);
    expect(result.saldo).toBe(0);
    expect(result.total_movimentos).toBe(0);
  });

  // marcarMovimentoComoExportado
  test("marcarMovimentoComoExportado actualiza exportadofaturacao e dataexportacao", async () => {
    mockPrisma.conta_corrente.update.mockResolvedValue({ id: 1, exportadofaturacao: true });
    const result = await service.marcarMovimentoComoExportado(1);
    expect(mockPrisma.conta_corrente.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ exportadofaturacao: true }),
      })
    );
  });

  // sincronizarMovimentosAluguer
  test("sincronizarMovimentosAluguer ignora devolucoes sem utilizador", async () => {
    mockPrisma.devolucao.findMany.mockResolvedValue([
      { id: 1, linha_reserva: { id: 1, reserva: null, anuncio_escola: null } },
    ]);
    const result = await service.sincronizarMovimentosAluguer();
    expect(result.criados).toBe(0);
    expect(mockPrisma.conta_corrente.create).not.toHaveBeenCalled();
  });

  test("sincronizarMovimentosAluguer ignora devolucoes que ja tem registo", async () => {
    mockPrisma.devolucao.findMany.mockResolvedValue([
      {
        id: 1,
        linha_reserva: {
          id: 10,
          reserva: { id_utilizador: 3 },
          anuncio_escola: { valordiarioaluguer: 5 },
          valordiario: 5,
          datainicio: "2026-01-01",
          datafim: "2026-01-03",
        },
      },
    ]);
    mockPrisma.conta_corrente.findFirst.mockResolvedValue({ id: 1 }); // ja existe
    const result = await service.sincronizarMovimentosAluguer();
    expect(result.criados).toBe(0);
  });

  test("sincronizarMovimentosAluguer cria movimentos em falta", async () => {
    mockPrisma.devolucao.findMany.mockResolvedValue([
      {
        id: 1,
        linha_reserva: {
          id: 10,
          reserva: { id_utilizador: 3 },
          anuncio_escola: { valordiarioaluguer: 5 },
          valordiario: 5,
          datainicio: "2026-01-01",
          datafim: "2026-01-03",
        },
      },
    ]);
    mockPrisma.conta_corrente.findFirst.mockResolvedValue(null); // nao existe
    mockPrisma.conta_corrente.create.mockResolvedValue({ id: 1 });
    const result = await service.sincronizarMovimentosAluguer();
    expect(result.criados).toBe(1);
    expect(mockPrisma.conta_corrente.create).toHaveBeenCalled();
  });
});
