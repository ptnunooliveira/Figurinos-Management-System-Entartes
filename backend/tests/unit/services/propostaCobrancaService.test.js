/**
 * ------------------------------------------------------------------------
 * File: propostaCobrancaService.test.js
 * Date: 2026-05-09
 * Description: Unit testing do service de propostas de cobranca
 * ------------------------------------------------------------------------
 */

const mockTx = {
  propostacobranca: { create: jest.fn(), update: jest.fn() },
  ocorrencia: { update: jest.fn(), findUnique: jest.fn() },
  conta_corrente: { create: jest.fn() },
};

const mockPrisma = {
  propostacobranca: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  ocorrencia: { findUnique: jest.fn() },
  $transaction: jest.fn((fn) => fn(mockTx)),
};

jest.mock("../../../prisma/client", () => mockPrisma);

const service = require("../../../services/propostaCobrancaService");

describe("propostaCobrancaService", () => {
  beforeEach(() => jest.clearAllMocks());

  // obterTodasPropostasCobranca
  test("obterTodasPropostasCobranca retorna lista", async () => {
    mockPrisma.propostacobranca.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.obterTodasPropostasCobranca();
    expect(result).toHaveLength(2);
  });

  // obterPropostaCobranca
  test("obterPropostaCobranca retorna proposta existente", async () => {
    mockPrisma.propostacobranca.findUnique.mockResolvedValue({ id: 1, valor: 50 });
    const result = await service.obterPropostaCobranca(1);
    expect(result.id).toBe(1);
  });

  test("obterPropostaCobranca retorna null quando nao existe", async () => {
    mockPrisma.propostacobranca.findUnique.mockResolvedValue(null);
    const result = await service.obterPropostaCobranca(999);
    expect(result).toBeNull();
  });

  // criarPropostaCobranca
  test("criarPropostaCobranca cria proposta e actualiza ocorrencia em transacao", async () => {
    const propostaCriada = { id: 1, valor: 100, id_ocorrencia: 5 };
    mockTx.propostacobranca.create.mockResolvedValue(propostaCriada);
    mockTx.ocorrencia.update.mockResolvedValue({ id: 5, id_estado: 5 });

    const dados = { id_ocorrencia: 5, valor: 100, id_estadopropostacobranca: 1 };
    const result = await service.criarPropostaCobranca(dados);

    expect(mockTx.propostacobranca.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: dados })
    );
    expect(mockTx.ocorrencia.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 5 } })
    );
  });

  test("criarPropostaCobranca nao actualiza ocorrencia quando id_ocorrencia e null", async () => {
    const propostaCriada = { id: 1, valor: 100, id_ocorrencia: null };
    mockTx.propostacobranca.create.mockResolvedValue(propostaCriada);

    await service.criarPropostaCobranca({ valor: 100, id_estadopropostacobranca: 1 });

    expect(mockTx.ocorrencia.update).not.toHaveBeenCalled();
  });

  // atualizarEstadoPropostaCobranca
  test("atualizarEstadoPropostaCobranca actualiza estado", async () => {
    mockPrisma.propostacobranca.update.mockResolvedValue({ id: 1, id_estadopropostacobranca: 2 });
    const result = await service.atualizarEstadoPropostaCobranca(1, 2);
    expect(mockPrisma.propostacobranca.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 }, data: { id_estadopropostacobranca: 2 } })
    );
  });

  // finalizarPropostaEmContaCorrente
  test("finalizarPropostaEmContaCorrente retorna null quando proposta nao existe", async () => {
    mockPrisma.propostacobranca.findUnique.mockResolvedValue(null);
    const result = await service.finalizarPropostaEmContaCorrente(999, { id_tipo_movimento: 1 });
    expect(result).toBeNull();
  });

  test("finalizarPropostaEmContaCorrente lanca erro quando proposta nao tem ocorrencia", async () => {
    mockPrisma.propostacobranca.findUnique.mockResolvedValue({ id: 1, ocorrencia: null });
    await expect(service.finalizarPropostaEmContaCorrente(1, { id_tipo_movimento: 1 }))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  // aceitarPropostaAluno
  test("aceitarPropostaAluno lanca erro 404 quando proposta nao existe", async () => {
    mockPrisma.propostacobranca.findUnique.mockResolvedValue(null);
    await expect(service.aceitarPropostaAluno(999, 1)).rejects.toMatchObject({ statusCode: 404 });
  });

  test("aceitarPropostaAluno lanca erro 403 quando utilizador nao e o dono", async () => {
    mockPrisma.propostacobranca.findUnique.mockResolvedValue({
      id: 1,
      valor: 50,
      ocorrencia: {
        linha_reserva: {
          reserva: { id_utilizador: 99 }
        }
      }
    });
    await expect(service.aceitarPropostaAluno(1, 1)).rejects.toMatchObject({ statusCode: 403 });
  });

  // resolverComContraproposta
  test("resolverComContraproposta lanca erro 404 quando ocorrencia nao existe", async () => {
    mockPrisma.ocorrencia.findUnique.mockResolvedValue(null);
    await expect(service.resolverComContraproposta(999, 50)).rejects.toMatchObject({ statusCode: 404 });
  });

  test("resolverComContraproposta cria proposta e movimento em transacao", async () => {
    mockPrisma.ocorrencia.findUnique.mockResolvedValue({
      id: 1,
      id_linha_reserva: 2,
      linha_reserva: { reserva: { id_utilizador: 3 } },
    });
    mockTx.propostacobranca.create.mockResolvedValue({ id: 10 });
    mockTx.conta_corrente.create.mockResolvedValue({ id: 1 });
    mockTx.ocorrencia.update.mockResolvedValue({ id: 1 });

    const result = await service.resolverComContraproposta(1, 75);

    expect(mockTx.propostacobranca.create).toHaveBeenCalled();
    expect(mockTx.conta_corrente.create).toHaveBeenCalled();
    expect(mockTx.ocorrencia.update).toHaveBeenCalled();
  });
});
