/**
 * ------------------------------------------------------------------------
 * File: devolucaoService.test.js
 * Date: 2026-05-09
 * Description: Unit testing do service de devolucoes, ocorrencias e orcamentos
 * ------------------------------------------------------------------------
 */

const mockPrisma = {
  linha_reserva: { findUnique: jest.fn() },
  checklist: { findUnique: jest.fn(), findFirst: jest.fn() },
  checklist_item: { findFirst: jest.fn() },
  devolucao: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  conta_corrente: { create: jest.fn() },
  ocorrencia: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  },
  estado_ocorrencia: { findUnique: jest.fn() },
  orcamento: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  figurino: { findUnique: jest.fn() },
};

jest.mock("../../../prisma/client", () => mockPrisma);

const service = require("../../../services/devolucaoService");

describe("devolucaoService", () => {
  beforeEach(() => jest.clearAllMocks());

  // criarDevolucao - validacoes
  test("criarDevolucao lanca NOT_FOUND quando linha_reserva nao existe", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue(null);
    await expect(service.criarDevolucao({ id_linha_reserva: 999, id_checklist: 1 }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("criarDevolucao lanca NOT_FOUND quando checklist nao existe", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue({ id: 1, id_reserva: 10, anuncio_escola: {}, reserva: {} });
    mockPrisma.checklist.findUnique.mockResolvedValue(null);
    await expect(service.criarDevolucao({ id_linha_reserva: 1, id_checklist: 999 }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("criarDevolucao lanca INVALID_TYPE quando checklist nao e do tipo Devolucao", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue({ id: 1, id_reserva: 10, anuncio_escola: {}, reserva: {} });
    mockPrisma.checklist.findUnique.mockResolvedValue({
      id: 2, id_reserva: 10, id_tipo_checklist: 1, tipo_checklist: { nome: "Levantamento" }
    });
    await expect(service.criarDevolucao({ id_linha_reserva: 1, id_checklist: 2 }))
      .rejects.toMatchObject({ code: "INVALID_TYPE" });
  });

  test("criarDevolucao lanca INVALID_TYPE quando checklist pertence a reserva diferente", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue({ id: 1, id_reserva: 10, anuncio_escola: {}, reserva: {} });
    mockPrisma.checklist.findUnique.mockResolvedValue({
      id: 2, id_reserva: 99, id_tipo_checklist: 2, tipo_checklist: { nome: "Devolucao" }
    });
    await expect(service.criarDevolucao({ id_linha_reserva: 1, id_checklist: 2 }))
      .rejects.toMatchObject({ code: "INVALID_TYPE" });
  });

  test("criarDevolucao lanca CONFLICT quando ja existe devolucao para a linha", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue({ id: 1, id_reserva: 10, anuncio_escola: {}, reserva: {} });
    mockPrisma.checklist.findUnique.mockResolvedValue({ id: 2, id_reserva: 10, id_tipo_checklist: 2 });
    mockPrisma.devolucao.findFirst.mockResolvedValue({ id: 5 });
    await expect(service.criarDevolucao({ id_linha_reserva: 1, id_checklist: 2 }))
      .rejects.toMatchObject({ code: "CONFLICT" });
  });

  test("criarDevolucao cria devolucao com sucesso sem danos nem conta_corrente", async () => {
    // Primeiro findUnique (validacao linha)
    mockPrisma.linha_reserva.findUnique
      .mockResolvedValueOnce({
        id: 1, id_reserva: 10,
        anuncio_escola: null,
        reserva: null,
        valordiario: null, datainicio: null, datafim: null,
      })
      // Segundo findUnique (figurinoTemDanoPorComparacao)
      .mockResolvedValueOnce({ id: 1, id_reserva: 10, anuncio_escola: null });

    mockPrisma.checklist.findUnique.mockResolvedValue({ id: 2, id_reserva: 10, id_tipo_checklist: 2 });
    mockPrisma.devolucao.findFirst.mockResolvedValue(null);
    mockPrisma.devolucao.create.mockResolvedValue({ id: 1, id_linha_reserva: 1, id_checklist: 2 });

    const result = await service.criarDevolucao({ id_linha_reserva: 1, id_checklist: 2 });

    expect(mockPrisma.devolucao.create).toHaveBeenCalled();
    expect(result).toMatchObject({ id: 1 });
  });

  // criarOcorrencia - validacoes
  test("criarOcorrencia lanca NOT_FOUND quando linha_reserva nao existe", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue(null);
    await expect(service.criarOcorrencia({ descricao: "Dano", id_linha_reserva: 999 }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("criarOcorrencia lanca MISSING_DEVOLUCAO quando nao existe devolucao", async () => {
    mockPrisma.linha_reserva.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.devolucao.findFirst.mockResolvedValue(null);
    await expect(service.criarOcorrencia({ descricao: "Dano", id_linha_reserva: 1 }))
      .rejects.toMatchObject({ code: "MISSING_DEVOLUCAO" });
  });

  // criarOrcamento
  test("criarOrcamento lanca NOT_FOUND quando ocorrencia nao existe", async () => {
    mockPrisma.ocorrencia.findUnique.mockResolvedValue(null);
    await expect(service.criarOrcamento({ id_ocorrencia: 999, fornecedor: "X", valor: 100 }))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("criarOrcamento cria orcamento com sucesso", async () => {
    mockPrisma.ocorrencia.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.orcamento.create.mockResolvedValue({ id: 1, id_ocorrencia: 1, fornecedor: "Costureira" });
    const result = await service.criarOrcamento({ id_ocorrencia: 1, fornecedor: "Costureira", valor: 50 });
    expect(mockPrisma.orcamento.create).toHaveBeenCalled();
  });

  // atualizarEstadoOcorrencia
  test("atualizarEstadoOcorrencia lanca NOT_FOUND quando estado nao existe", async () => {
    mockPrisma.estado_ocorrencia.findUnique.mockResolvedValue(null);
    await expect(service.atualizarEstadoOcorrencia(1, 99))
      .rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  test("atualizarEstadoOcorrencia actualiza estado com sucesso", async () => {
    mockPrisma.estado_ocorrencia.findUnique.mockResolvedValue({ id: 2 });
    mockPrisma.ocorrencia.update.mockResolvedValue({ id: 1, id_estado: 2 });
    const result = await service.atualizarEstadoOcorrencia(1, 2);
    expect(mockPrisma.ocorrencia.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 }, data: { id_estado: 2 } })
    );
  });
});
