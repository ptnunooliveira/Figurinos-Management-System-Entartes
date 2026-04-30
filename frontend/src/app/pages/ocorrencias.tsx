import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  Eye,
  FileText,
  Hammer,
  PackageX,
  Wrench,
  X,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  getOcorrencias,
  getMinhasOcorrencias,
  getOcorrencia,
  atualizarEstadoOcorrencia,
  atualizarEstadoProposta,
  criarPropostaCobranca,
  criarContestacao,
  criarOrcamento,
  desativarFigurino,
  type OcorrenciaDetalhada,
} from "../lib/services";
import { getUtilizadorAtual } from "../lib/auth";
import { toast } from "sonner";

// Ids da tabela estadopropostacobranca
const ESTADO_PROPOSTA = {
  PENDENTE: 1,
  ACEITE: 2,
  REJEITADA: 3,
} as const;

// Ids da tabela estado_ocorrencia (sincronizados com a BD)
const ESTADO = {
  AGUARDAR: 1,            // A aguardar
  RESOLVIDA: 2,           // Resolvida
  AGUARDAR_ORCAMENTO: 3,  // A aguardar orçamento
} as const;

type AcaoTipo =
  | "registar_orcamento"
  | "item_em_falta"
  | "atualizar_especificacao"
  | "abate";

const TITULOS_ACAO: Record<AcaoTipo, string> = {
  registar_orcamento: "Registar Orçamento",
  item_em_falta: "Registar item em falta",
  atualizar_especificacao: "Atualizar especificação do figurino",
  abate: "Figurino para abate",
};

export function Ocorrencias() {
  const utilizador = getUtilizadorAtual();
  const isFuncionario = utilizador?.tipo === "funcionario";

  const [ocorrencias, setOcorrencias] = useState<OcorrenciaDetalhada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionada, setSelecionada] = useState<OcorrenciaDetalhada | null>(null);

  // Modal "Proposta de valor ao cliente"
  const [acaoAtiva, setAcaoAtiva] = useState<AcaoTipo | null>(null);
  const [valorProposto, setValorProposto] = useState("");
  const [descricaoProposta, setDescricaoProposta] = useState("");
  // Bloqueia clicks repetidos enquanto a submissão está em curso
  const [submetendoProposta, setSubmetendoProposta] = useState(false);

  // Campos extra para o fluxo de "Registar Orçamento"
  const [orcamentoFornecedor, setOrcamentoFornecedor] = useState("");
  const [orcamentoValor, setOrcamentoValor] = useState("");
  const [orcamentoDescricao, setOrcamentoDescricao] = useState("");

  // Modal "Contestar proposta" (aluno)
  const [propostaAContestar, setPropostaAContestar] = useState<number | null>(null);
  const [valorContraproposta, setValorContraproposta] = useState("");
  const [descricaoContestacao, setDescricaoContestacao] = useState("");

  // Modal "Ver detalhes da proposta"
  const [propostaAVisualizar, setPropostaAVisualizar] = useState<number | null>(null);

  const carregar = () => {
    setCarregando(true);
    const fn = isFuncionario ? getOcorrencias : getMinhasOcorrencias;
    fn()
      .then(setOcorrencias)
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregar();
  }, [isFuncionario]);

  const recarregarSelecionada = async (id: number) => {
    if (isFuncionario) {
      const detalhe = await getOcorrencia(id);
      setSelecionada(detalhe);
    } else {
      const lista = await getMinhasOcorrencias();
      setOcorrencias(lista);
      setSelecionada(lista.find((o) => o.id === id) ?? null);
      return;
    }
    carregar();
  };

  const corEstado = (estado: string) => {
    const e = (estado || "").toLowerCase();
    if (e === "resolvida") return "bg-green-100 text-green-700";
    if (e === "a aguardar orçamento") return "bg-amber-100 text-amber-800";
    if (e === "a aguardar") return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };

  const iconeEstado = (estado: string) => {
    const e = (estado || "").toLowerCase();
    if (e === "resolvida") return CheckCircle;
    if (e === "a aguardar orçamento") return Clock;
    return AlertTriangle;
  };

  // === Ações ===

  const handleNecessitaOrcamento = async () => {
    if (!selecionada) return;
    try {
      await atualizarEstadoOcorrencia(selecionada.id, ESTADO.AGUARDAR_ORCAMENTO);
      toast.success("Ocorrência marcada como 'A aguardar orçamento'");
      await recarregarSelecionada(selecionada.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar ocorrência");
    }
  };

  const handleItemEmFalta = async () => {
    if (!selecionada?.figurino_id) {
      toast.error("Esta ocorrência não tem figurino associado.");
      return;
    }
    if (!window.confirm(
      "Figurino removido. Verifique a possibilidade de criar figurino sem o item em falta."
    )) return;
    try {
      await desativarFigurino(selecionada.figurino_id);
      toast.success("Figurino desativado");
      // Abre formulário de proposta de valor ao cliente
      setAcaoAtiva("item_em_falta");
    } catch (err: any) {
      toast.error(err.message || "Erro ao desativar figurino");
    }
  };

  const handleAtualizarEspecificacao = () => {
    setAcaoAtiva("atualizar_especificacao");
  };

  const handleAbate = () => {
    setAcaoAtiva("abate");
  };

  const handleRegistarOrcamento = () => {
    setAcaoAtiva("registar_orcamento");
  };

  const fecharFormProposta = () => {
    setAcaoAtiva(null);
    setValorProposto("");
    setDescricaoProposta("");
    setOrcamentoFornecedor("");
    setOrcamentoValor("");
    setOrcamentoDescricao("");
  };

  // === Ações do aluno sobre uma proposta ===

  const handleAceitarProposta = async (idProposta: number) => {
    if (!window.confirm("Confirma que aceita esta proposta de cobrança?")) return;
    try {
      await atualizarEstadoProposta(idProposta, ESTADO_PROPOSTA.ACEITE);
      toast.success("Proposta aceite. Será adicionada à sua conta corrente.");
      if (selecionada) await recarregarSelecionada(selecionada.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao aceitar proposta");
    }
  };

  const abrirContestacao = (idProposta: number) => {
    setPropostaAContestar(idProposta);
    setValorContraproposta("");
    setDescricaoContestacao("");
  };

  const fecharContestacao = () => {
    setPropostaAContestar(null);
    setValorContraproposta("");
    setDescricaoContestacao("");
  };

  const submeterContestacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propostaAContestar) return;
    if (!descricaoContestacao.trim()) {
      toast.error("Descreva o motivo da contestação.");
      return;
    }
    const valor = valorContraproposta ? parseFloat(valorContraproposta) : null;
    if (valor !== null && (isNaN(valor) || valor < 0)) {
      toast.error("O valor de contestação tem de ser um número válido.");
      return;
    }
    try {
      // O backend, em transação, marca a proposta como Rejeitada e a ocorrência
      // como "proposta contestada" — o aluno não precisa (nem pode) chamar
      // PATCH /propostas-cobranca/:id/estado.
      await criarContestacao({
        id_proposta_cobranca: propostaAContestar,
        descricao: descricaoContestacao.trim(),
        valorcontraproposta: valor,
      });
      toast.success("Contestação registada");
      fecharContestacao();
      if (selecionada) await recarregarSelecionada(selecionada.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao registar contestação");
    }
  };

  const submeterProposta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submetendoProposta) return;
    if (!selecionada || !acaoAtiva) return;
    const valor = parseFloat(valorProposto);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Indique um valor válido para a proposta ao cliente.");
      return;
    }

    // Validação extra para o fluxo de orçamento: o fornecedor é obrigatório
    if (acaoAtiva === "registar_orcamento") {
      if (!orcamentoFornecedor.trim()) {
        toast.error("Indique o fornecedor do orçamento.");
        return;
      }
      const valorOrc = orcamentoValor ? parseFloat(orcamentoValor) : NaN;
      if (isNaN(valorOrc) || valorOrc <= 0) {
        toast.error("Indique o valor do orçamento do fornecedor.");
        return;
      }
    }

    setSubmetendoProposta(true);
    try {
      // 1. Se for registar orçamento, gravar primeiro os dados do fornecedor
      if (acaoAtiva === "registar_orcamento") {
        await criarOrcamento(selecionada.id, {
          fornecedor: orcamentoFornecedor.trim(),
          descricao: orcamentoDescricao.trim() || null,
          valor: parseFloat(orcamentoValor),
        });
      }

      // 2. Criar a proposta de cobrança ao cliente (incluindo notas/descrição)
      await criarPropostaCobranca(selecionada.id, valor, descricaoProposta);

      // 3. Atualizar o estado da ocorrência
      // Após registar orçamento, volta a "A aguardar" (resposta do cliente).
      // Nos outros fluxos mantém-se "A aguardar" também.
      await atualizarEstadoOcorrencia(selecionada.id, ESTADO.AGUARDAR);

      toast.success(
        acaoAtiva === "registar_orcamento"
          ? "Orçamento registado e proposta enviada ao cliente"
          : "Proposta de valor enviada ao cliente"
      );
      fecharFormProposta();
      await recarregarSelecionada(selecionada.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao registar proposta");
    } finally {
      setSubmetendoProposta(false);
    }
  };

  // === Render ===

  if (selecionada) {
    return (
      <DetalheOcorrencia
        ocorrencia={selecionada}
        isFuncionario={isFuncionario}
        onVoltar={() => setSelecionada(null)}
        onNecessitaOrcamento={handleNecessitaOrcamento}
        onItemEmFalta={handleItemEmFalta}
        onAtualizarEspecificacao={handleAtualizarEspecificacao}
        onAbate={handleAbate}
        onRegistarOrcamento={handleRegistarOrcamento}
        onAceitarProposta={handleAceitarProposta}
        onAbrirContestacao={abrirContestacao}
        corEstado={corEstado}
        iconeEstado={iconeEstado}
        acaoAtiva={acaoAtiva}
        valorProposto={valorProposto}
        descricaoProposta={descricaoProposta}
        onValorChange={setValorProposto}
        onDescricaoChange={setDescricaoProposta}
        onCancelarProposta={fecharFormProposta}
        onSubmeterProposta={submeterProposta}
        submetendoProposta={submetendoProposta}
        orcamentoFornecedor={orcamentoFornecedor}
        orcamentoValor={orcamentoValor}
        orcamentoDescricao={orcamentoDescricao}
        onOrcamentoFornecedorChange={setOrcamentoFornecedor}
        onOrcamentoValorChange={setOrcamentoValor}
        onOrcamentoDescricaoChange={setOrcamentoDescricao}
        propostaAContestar={propostaAContestar}
        valorContraproposta={valorContraproposta}
        descricaoContestacao={descricaoContestacao}
        onValorContrapropostaChange={setValorContraproposta}
        onDescricaoContestacaoChange={setDescricaoContestacao}
        onCancelarContestacao={fecharContestacao}
        onSubmeterContestacao={submeterContestacao}
        propostaAVisualizar={propostaAVisualizar}
        onAbrirVisualizacao={setPropostaAVisualizar}
        onFecharVisualizacao={() => setPropostaAVisualizar(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ocorrências</h1>
        <p className="text-gray-600">Lista de ocorrências geradas no processo de devolução</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {carregando ? (
          <p className="text-center text-gray-500 py-8">A carregar...</p>
        ) : ocorrencias.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
            <p className="text-gray-600">Nenhuma ocorrência registada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ocorrencias.map((o) => {
              const IconeEstado = iconeEstado(o.estado);
              return (
                <button
                  key={o.id}
                  onClick={() => setSelecionada(o)}
                  className="w-full text-left border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <IconeEstado className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-gray-900">
                          Ocorrência #{o.id}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${corEstado(o.estado)}`}>
                          {o.estado || "—"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1 truncate">{o.descricao}</p>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-x-4">
                        {o.figurino_nome && <span>Figurino: {o.figurino_nome}</span>}
                        {isFuncionario && o.cliente_nome && <span>Cliente: {o.cliente_nome}</span>}
                        {o.data_criacao && (
                          <span>
                            {new Date(o.data_criacao).toLocaleDateString("pt-PT")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================================
// Subcomponente: detalhe da ocorrência
// =====================================================================

interface DetalheProps {
  ocorrencia: OcorrenciaDetalhada;
  isFuncionario: boolean;
  onVoltar: () => void;
  onNecessitaOrcamento: () => void;
  onItemEmFalta: () => void;
  onAtualizarEspecificacao: () => void;
  onAbate: () => void;
  onRegistarOrcamento: () => void;
  onAceitarProposta: (idProposta: number) => void;
  onAbrirContestacao: (idProposta: number) => void;
  corEstado: (estado: string) => string;
  iconeEstado: (estado: string) => any;
  acaoAtiva: AcaoTipo | null;
  valorProposto: string;
  descricaoProposta: string;
  onValorChange: (v: string) => void;
  onDescricaoChange: (v: string) => void;
  onCancelarProposta: () => void;
  onSubmeterProposta: (e: React.FormEvent) => void;
  submetendoProposta: boolean;
  orcamentoFornecedor: string;
  orcamentoValor: string;
  orcamentoDescricao: string;
  onOrcamentoFornecedorChange: (v: string) => void;
  onOrcamentoValorChange: (v: string) => void;
  onOrcamentoDescricaoChange: (v: string) => void;
  propostaAContestar: number | null;
  valorContraproposta: string;
  descricaoContestacao: string;
  onValorContrapropostaChange: (v: string) => void;
  onDescricaoContestacaoChange: (v: string) => void;
  onCancelarContestacao: () => void;
  onSubmeterContestacao: (e: React.FormEvent) => void;
  propostaAVisualizar: number | null;
  onAbrirVisualizacao: (idProposta: number) => void;
  onFecharVisualizacao: () => void;
}

function DetalheOcorrencia(props: DetalheProps) {
  const {
    ocorrencia: o,
    isFuncionario,
    onVoltar,
    onNecessitaOrcamento,
    onItemEmFalta,
    onAtualizarEspecificacao,
    onAbate,
    onRegistarOrcamento,
    onAceitarProposta,
    onAbrirContestacao,
    corEstado,
    iconeEstado,
    acaoAtiva,
    valorProposto,
    descricaoProposta,
    onValorChange,
    onDescricaoChange,
    onCancelarProposta,
    onSubmeterProposta,
    submetendoProposta,
    orcamentoFornecedor,
    orcamentoValor,
    orcamentoDescricao,
    onOrcamentoFornecedorChange,
    onOrcamentoValorChange,
    onOrcamentoDescricaoChange,
    propostaAContestar,
    valorContraproposta,
    descricaoContestacao,
    onValorContrapropostaChange,
    onDescricaoContestacaoChange,
    onCancelarContestacao,
    onSubmeterContestacao,
    propostaAVisualizar,
    onAbrirVisualizacao,
    onFecharVisualizacao,
  } = props;

  const estadoLower = (o.estado || "").toLowerCase();
  const aguardar = estadoLower === "a aguardar";
  const aguardarOrcamento = estadoLower === "a aguardar orçamento";
  const resolvida = estadoLower === "resolvida";
  const IconeEstado = iconeEstado(o.estado);

  // Existe uma proposta a aguardar resposta do cliente?
  // (estado != "aceite" e != "rejeitada" → cliente ainda não respondeu)
  const temPropostaPendente = (o.propostas ?? []).some(p => {
    const est = (p.estado || "").toLowerCase();
    return est !== "aceite" && est !== "rejeitada";
  });

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={onVoltar}
          className="inline-flex items-center gap-2 text-fig-purple hover:text-fig-magenta mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às Ocorrências
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-bold text-gray-900">Ocorrência #{o.id}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${corEstado(o.estado)}`}>
            <IconeEstado className="w-4 h-4 inline mr-1 -mt-0.5" />
            {o.estado || "—"}
          </span>
        </div>
      </div>

      {/* Detalhes */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Detalhes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Campo label="Descrição" valor={o.descricao} />
          <Campo
            label="Data de criação"
            valor={
              o.data_criacao
                ? new Date(o.data_criacao).toLocaleDateString("pt-PT")
                : "—"
            }
          />
          {isFuncionario && <Campo label="Cliente" valor={o.cliente_nome || "—"} />}
          {isFuncionario && <Campo label="Email do cliente" valor={o.cliente_email || "—"} />}
          <Campo label="Figurino" valor={o.figurino_nome || "—"} />
          <Campo label="Categoria" valor={o.figurino_categoria || "—"} />
          {isFuncionario && (
            <Campo
              label="Figurino ativo?"
              valor={o.figurino_ativo === false ? "Não" : "Sim"}
            />
          )}
        </div>
      </div>

      {/* Propostas existentes */}
      {o.propostas && o.propostas.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Propostas de cobrança
          </h2>
          <div className="space-y-3">
            {o.propostas.map((p) => {
              const estadoLower = (p.estado || "").toLowerCase();
              // O aluno pode aceitar/contestar qualquer proposta que ainda não tenha
              // resposta final (ou seja, que não esteja "aceite" nem "rejeitada").
              // O nome do estado em BD pode ser "Criada", "Pendente", etc.
              const podeAgir = !isFuncionario && estadoLower !== "aceite" && estadoLower !== "rejeitada";
              return (
                <div key={p.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                    <div>
                      <p className="font-medium text-gray-900">Proposta #{p.id}</p>
                      <p className="text-sm text-gray-600">
                        Valor: <span className="font-semibold text-gray-900">€{p.valor.toFixed(2)}</span>
                      </p>
                      {p.dataproposta && (
                        <p className="text-xs text-gray-500">
                          {new Date(p.dataproposta).toLocaleDateString("pt-PT")}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {p.estado || "—"}
                    </span>
                  </div>

                  {/* Contestações já registadas */}
                  {p.contestacoes && p.contestacoes.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {p.contestacoes.map((c) => (
                        <div
                          key={c.id}
                          className="bg-orange-50 border border-orange-200 rounded p-3 text-sm"
                        >
                          <p className="font-medium text-orange-900">
                            Contestação registada
                          </p>
                          <p className="text-gray-700 mt-1">{c.descricao}</p>
                          {c.valorcontraproposta !== null && c.valorcontraproposta !== undefined && (
                            <p className="text-orange-800 mt-1">
                              Valor proposto pelo cliente: €{Number(c.valorcontraproposta).toFixed(2)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botão Ver: disponível para qualquer utilizador, em qualquer estado */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      onClick={() => onAbrirVisualizacao(p.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalhes
                    </button>
                    {podeAgir && (
                      <>
                        <button
                          onClick={() => onAceitarProposta(p.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Aceitar
                        </button>
                        <button
                          onClick={() => onAbrirContestacao(p.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Contestar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ações — só visíveis enquanto não existir proposta a aguardar resposta do cliente */}
      {isFuncionario && !resolvida && !temPropostaPendente && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações</h2>

          {aguardar && !acaoAtiva && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <BotaoAcao
                onClick={onNecessitaOrcamento}
                cor="amber"
                icone={Clock}
                titulo="Necessita orçamento"
                descricao="A peça precisa de reparação por um fornecedor externo (ex: costureira). Coloca a ocorrência em 'A aguardar orçamento' até o fornecedor responder."
              />
              <BotaoAcao
                onClick={onItemEmFalta}
                cor="red"
                icone={PackageX}
                titulo="Registar item em falta"
                descricao="A peça em falta impede a utilização do figurino. Desativa o figurino do catálogo e abre proposta de valor a cobrar ao cliente. A ocorrência mantém-se 'A aguardar' até o cliente aceitar."
              />
              <BotaoAcao
                onClick={onAtualizarEspecificacao}
                cor="blue"
                icone={Wrench}
                titulo="Atualizar especificação do figurino"
                descricao="O dano não impede a utilização. Mantém o figurino ativo (atualizando a descrição/estado) e abre proposta de valor de penalização ao cliente."
              />
              <BotaoAcao
                onClick={onAbate}
                cor="gray"
                icone={Hammer}
                titulo="Figurino para abate"
                descricao="O figurino está irrecuperável. Marca-o para abate e abre proposta de valor a cobrar ao cliente."
              />
            </div>
          )}

          {aguardarOrcamento && !acaoAtiva && (
            <BotaoAcao
              onClick={onRegistarOrcamento}
              cor="purple"
              icone={FileText}
              titulo="Registar Orçamento"
              descricao="Recebeu o orçamento do fornecedor? Registe os dados (fornecedor, valor da reparação) e envie a proposta de valor ao cliente. A ocorrência volta a 'A aguardar' resposta do cliente."
            />
          )}
        </div>
      )}

      {/* Aviso quando há proposta a aguardar resposta do cliente */}
      {isFuncionario && !resolvida && temPropostaPendente && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              Existe uma proposta enviada ao cliente. As próximas ações ficam
              disponíveis quando o cliente aceitar ou contestar.
            </p>
          </div>
        </div>
      )}

      {/* Modal contestação (aluno) */}
      {propostaAContestar !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Contestar Proposta</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Proposta #{propostaAContestar}
                </p>
              </div>
              <button
                onClick={onCancelarContestacao}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmeterContestacao} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da contestação *
                </label>
                <textarea
                  value={descricaoContestacao}
                  onChange={(e) => onDescricaoContestacaoChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                  rows={3}
                  placeholder="Descreva por que motivo não concorda com o valor proposto..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor de contestação (€)
                </label>
                <div className="relative">
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorContraproposta}
                    onChange={(e) => onValorContrapropostaChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                    placeholder="Indique o valor que considera adequado"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancelarContestacao}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Submeter Contestação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal proposta valor */}
      {acaoAtiva && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {TITULOS_ACAO[acaoAtiva]}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {acaoAtiva === "registar_orcamento"
                    ? `Registar orçamento do fornecedor e enviar proposta ao cliente — Ocorrência #${o.id}`
                    : `Proposta de valor ao cliente — Ocorrência #${o.id}`}
                </p>
              </div>
              <button
                onClick={onCancelarProposta}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmeterProposta} className="p-6 space-y-4">
              {acaoAtiva === "registar_orcamento" && (
                <div className="space-y-4 pb-4 border-b">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Dados do orçamento (fornecedor)
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fornecedor *
                    </label>
                    <input
                      type="text"
                      value={orcamentoFornecedor}
                      onChange={(e) => onOrcamentoFornecedorChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                      placeholder="Ex: Costureira Maria, Lavandaria Central"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor do orçamento (€) *
                    </label>
                    <div className="relative">
                      <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={orcamentoValor}
                        onChange={(e) => onOrcamentoValorChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do trabalho (opcional)
                    </label>
                    <textarea
                      value={orcamentoDescricao}
                      onChange={(e) => onOrcamentoDescricaoChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                      rows={2}
                      placeholder="Ex: Reparar rasgão na manga, substituir botões..."
                    />
                  </div>
                </div>
              )}

              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {acaoAtiva === "registar_orcamento"
                  ? "Proposta de valor ao cliente"
                  : "Valor a cobrar"}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor a cobrar ao cliente (€) *
                </label>
                <div className="relative">
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorProposto}
                    onChange={(e) => onValorChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas para o cliente (opcional)
                </label>
                <textarea
                  value={descricaoProposta}
                  onChange={(e) => onDescricaoChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                  rows={3}
                  placeholder="Notas para o cliente..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onCancelarProposta}
                  disabled={submetendoProposta}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submetendoProposta}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submetendoProposta ? "A submeter..." : "Submeter Proposta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal "Ver detalhes da proposta" */}
      {propostaAVisualizar !== null && (() => {
        const p = (o.propostas ?? []).find(pp => pp.id === propostaAVisualizar);
        if (!p) return null;
        // Encontra o orçamento mais recente associado à ocorrência (se existir)
        const orcamento = (o.orcamentos ?? [])[0];
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Proposta #{p.id}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Detalhes da proposta de cobrança
                  </p>
                </div>
                <button
                  onClick={onFecharVisualizacao}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Valor a cobrar</p>
                    <p className="font-semibold text-gray-900 text-lg">€{p.valor.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <p className="font-medium text-gray-900">{p.estado || "—"}</p>
                  </div>
                  {p.dataproposta && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Data da proposta</p>
                      <p className="font-medium text-gray-900">
                        {new Date(p.dataproposta).toLocaleDateString("pt-PT")}
                      </p>
                    </div>
                  )}
                </div>

                {p.descricao && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Notas do funcionário</p>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                      {p.descricao}
                    </p>
                  </div>
                )}

                {orcamento && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      Orçamento do fornecedor
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Fornecedor</p>
                        <p className="font-medium text-gray-900">{orcamento.fornecedor || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor do orçamento</p>
                        <p className="font-medium text-gray-900">€{orcamento.valor.toFixed(2)}</p>
                      </div>
                      {orcamento.descricao && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Descrição do trabalho</p>
                          <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 mt-1">
                            {orcamento.descricao}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {p.contestacoes && p.contestacoes.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      Contestações registadas
                    </h3>
                    <div className="space-y-2">
                      {p.contestacoes.map(c => (
                        <div key={c.id} className="bg-orange-50 border border-orange-200 rounded p-3 text-sm">
                          <p className="text-gray-700">{c.descricao}</p>
                          {c.valorcontraproposta != null && (
                            <p className="text-orange-800 mt-1">
                              Valor proposto pelo cliente: €{Number(c.valorcontraproposta).toFixed(2)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onFecharVisualizacao}
                  className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// =====================================================================
// Helpers de UI
// =====================================================================

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900">{valor}</p>
    </div>
  );
}

interface BotaoAcaoProps {
  onClick: () => void;
  cor: "amber" | "red" | "blue" | "gray" | "purple";
  icone: any;
  titulo: string;
  descricao: string;
}

function BotaoAcao({ onClick, cor, icone: Icone, titulo, descricao }: BotaoAcaoProps) {
  const cores: Record<BotaoAcaoProps["cor"], string> = {
    amber: "border-amber-200 hover:bg-amber-50 text-amber-700",
    red: "border-red-200 hover:bg-red-50 text-red-700",
    blue: "border-blue-200 hover:bg-blue-50 text-blue-700",
    gray: "border-gray-300 hover:bg-gray-50 text-gray-700",
    purple: "border-fig-purple/30 hover:bg-fig-purple/5 text-fig-purple",
  };
  return (
    <button
      onClick={onClick}
      className={`w-full text-left border-2 rounded-lg p-4 transition-colors ${cores[cor]}`}
    >
      <div className="flex items-start gap-3">
        <Icone className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">{titulo}</p>
          <p className="text-xs opacity-80">{descricao}</p>
        </div>
      </div>
    </button>
  );
}
