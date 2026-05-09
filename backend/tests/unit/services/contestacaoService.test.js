/**
 * ------------------------------------------------------------------------
 * File: contestacaoService.test.js
 * Date: 2026-05-09
 * Description: Unit testing do service de contestacoes
 * ------------------------------------------------------------------------
 */

const mockTx = {
  contestacao: { create: jest.fn() },
  propostacobranca: { update: jest.fn() },
  ocorrencia: { update: jest.fn() },
};

const mockPrisma = {
  contestacao: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(mockTx)),
};

jest.mock("../../../prisma/client", () => mockPrisma);

const service = require("../../../services/contestacaoService");

describe("contestacaoService", () => {
  beforeEach(() => jest.clearAllMocks());

  // obterTodasContestacoes
  test("obterTodasContestacoes retorna lista", async () => {
    mockPrisma.contestacao.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await service.obterTodasContestacoes();
    expect(result).toHaveLength(2);
    expect(mockPrisma.contestacao.findMany).toHaveBeenCalled();
  });

  // obterContestacao
  test("obterContestacao retorna contestacao existente", async () => {
    mockPrisma.contestacao.findUnique.mockResolvedValue({ id: 1, descricao: "Dano" });
    const result = await service.obterContestacao(1);
    expect(result.id).toBe(1);
  });

  test("obterContestacao retorna null quando nao existe", async () => {
    mockPrisma.contestacao.findUnique.mockResolvedValue(null);
    const result = await service.obterContestacao(999);
    expect(result).toBeNull();
  });

  // criarContestacao
  test("criarContestacao cria contestacao e actualiza proposta e ocorrencia em transacao", async () => {
    const contestacaoCriada = {
      id: 1,
      id_proposta_cobranca: 5,
      propostacobranca: { id_ocorrencia: 10 },
    };
    mockTx.contestacao.create.mockResolvedValue(contestacaoCriada);
    mockTx.propostacobranca.update.mockResolvedValue({ id: 5 });
    mockTx.ocorrencia.update.mockResolvedValue({ id: 10 });

    const dados = {
      id_proposta_cobranca: 5,
      descricao: "Contestacao valida",
      id_utilizador: 2,
    };

    const result = await service.criarContestacao(dados);

    expect(mockTx.contestacao.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: dados })
    );
    expect(mockTx.propostacobranca.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 5 } })
    );
    expect(mockTx.ocorrencia.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 10 } })
    );
  });

  test("criarContestacao nao actualiza ocorrencia quando proposta sem id_ocorrencia", async () => {
    const contestacaoCriada = {
      id: 1,
      id_proposta_cobranca: 5,
      propostacobranca: { id_ocorrencia: null },
    };
    mockTx.contestacao.create.mockResolvedValue(contestacaoCriada);
    mockTx.propostacobranca.update.mockResolvedValue({ id: 5 });

    await service.criarContestacao({ id_proposta_cobranca: 5, descricao: "X", id_utilizador: 1 });

    expect(mockTx.ocorrencia.update).not.toHaveBeenCalled();
  });

  // obterContestacoesPorProposta
  test("obterContestacoesPorProposta retorna contestacoes filtradas", async () => {
    mockPrisma.contestacao.findMany.mockResolvedValue([{ id: 1 }]);
    const result = await service.obterContestacoesPorProposta(5);
    expect(mockPrisma.contestacao.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id_proposta_cobranca: 5 } })
    );
  });
});
