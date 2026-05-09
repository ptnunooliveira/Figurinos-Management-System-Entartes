/**
 * ------------------------------------------------------------------------
 * File: checklistService.test.js
 * Date: 2026-05-09
 * Description: Unit testing do service de checklists
 * ------------------------------------------------------------------------
 */

const mockPrisma = {
  reserva: { findUnique: jest.fn(), update: jest.fn() },
  linha_reserva: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    updateMany: jest.fn(),
    update: jest.fn(),
  },
  checklist: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
};

jest.mock("../../../prisma/client", () => mockPrisma);

const mockDevolucaoService = { criarDevolucao: jest.fn() };
jest.mock("../../../services/devolucaoService", () => mockDevolucaoService);

const service = require("../../../services/checklistService");

describe("checklistService", () => {
  beforeEach(() => jest.clearAllMocks());

  // obterChecklistPorID
  test("obterChecklistPorID retorna checklist existente", async () => {
    mockPrisma.checklist.findUnique.mockResolvedValue({ id: 1 });
    const result = await service.obterChecklistPorID(1);
    expect(result).toMatchObject({ id: 1 });
  });

  test("obterChecklistPorID retorna null quando nao existe", async () => {
    mockPrisma.checklist.findUnique.mockResolvedValue(null);
    const result = await service.obterChecklistPorID(999);
    expect(result).toBeNull();
  });

  // obterChecklistReserva
  test("obterChecklistReserva retorna lista de checklists", async () => {
    mockPrisma.checklist.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.obterChecklistReserva(10);
    expect(result).toHaveLength(2);
  });

  // criarChecklist
  test("criarChecklist lanca erro 404 quando reserva nao existe", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue(null);
    const dados = { id_tipo_checklist: 1, itens: [{ id_linha_reserva: 1, idfigurino: 5 }] };
    await expect(service.criarChecklist(1, dados, 999)).rejects.toMatchObject({ status: 404 });
  });

  test("criarChecklist lanca erro 400 quando item sem id_linha_reserva", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id: 10 });
    const dados = { id_tipo_checklist: 1, itens: [{ idfigurino: 5 }] };
    await expect(service.criarChecklist(1, dados, 10)).rejects.toMatchObject({ status: 400 });
  });

  test("criarChecklist lanca erro 403 quando linha nao pertence a reserva", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id: 10 });
    mockPrisma.linha_reserva.findFirst.mockResolvedValue(null);
    const dados = { id_tipo_checklist: 1, itens: [{ id_linha_reserva: 99, idfigurino: 5 }] };
    await expect(service.criarChecklist(1, dados, 10)).rejects.toMatchObject({ status: 403 });
  });

  test("criarChecklist lanca erro 400 quando figurino nao corresponde a linha", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id: 10 });
    mockPrisma.linha_reserva.findFirst.mockResolvedValue({
      id: 1,
      id_reserva: 10,
      anuncio_escola: { id_figurino: 5 },
    });
    const dados = { id_tipo_checklist: 1, itens: [{ id_linha_reserva: 1, idfigurino: 99 }] };
    await expect(service.criarChecklist(1, dados, 10)).rejects.toMatchObject({ status: 400 });
  });

  test("criarChecklist cria checklist de levantamento (tipo 1) e actualiza reserva", async () => {
    mockPrisma.reserva.findUnique.mockResolvedValue({ id: 10 });
    mockPrisma.linha_reserva.findFirst.mockResolvedValue({
      id: 1,
      id_reserva: 10,
      anuncio_escola: { id_figurino: 5 },
    });
    mockPrisma.checklist.create.mockResolvedValue({ id: 1, id_reserva: 10, checklist_item: [] });
    mockPrisma.linha_reserva.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.reserva.update.mockResolvedValue({ id: 10, id_estado: 3 });

    const dados = {
      id_tipo_checklist: 1,
      itens: [{ id_linha_reserva: 1, idfigurino: 5, id_estado: 1 }],
    };
    const result = await service.criarChecklist(1, dados, 10);

    expect(mockPrisma.checklist.create).toHaveBeenCalled();
    expect(mockPrisma.linha_reserva.updateMany).toHaveBeenCalled();
    expect(mockPrisma.reserva.update).toHaveBeenCalled();
  });
});
