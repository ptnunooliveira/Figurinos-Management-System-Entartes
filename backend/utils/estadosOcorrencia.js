/**
 * ------------------------------------------------------------------------
 * File: estadosOcorrencia.js
 * Description:
 * Ids dos estados da tabela `estado_ocorrencia`. Os ids têm de
 * corresponder aos registos existentes na base de dados (semente manual,
 * sem auto-incremento na inserção inicial).
 * ------------------------------------------------------------------------
 */

const ID_ESTADO_OCORRENCIA = {
  AGUARDAR: 1,             // A aguardar (ação do funcionário)
  RESOLVIDA: 2,            // Resolvida
  AGUARDAR_ORCAMENTO: 3,   // A aguardar orçamento
  PROPOSTA_CONTESTADA: 4,  // Proposta contestada (aluno rejeitou a proposta)
  AGUARDAR_ALUNO: 5,       // A aguardar resposta do aluno (proposta enviada)
};

module.exports = { ID_ESTADO_OCORRENCIA };
