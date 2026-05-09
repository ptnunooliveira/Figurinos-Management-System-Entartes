import { useState, useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  Eye,
  FileText,
  PackageX,
  Wrench,
  X,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter
} from "lucide-react";
import {
  getOcorrencias,
  getMinhasOcorrencias,
  getOcorrencia,
  atualizarEstadoOcorrencia,
  aceitarProposta,
  resolverComContraproposta,
  criarPropostaCobranca,
  criarContestacao,
  criarOrcamento,
  desativarFigurino,
  atualizarFigurino,
  getEstadosCondicao
} from "../lib/services";
import { getUtilizadorAtual } from "../lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
const ESTADO = {
  AGUARDAR: 1,
  // A aguardar (ação do funcionário)
  RESOLVIDA: 2,
  // Resolvida
  AGUARDAR_ORCAMENTO: 3,
  // A aguardar orçamento
  CONTESTADA: 4,
  // Contestada pelo aluno
  AGUARDAR_ALUNO: 5
  // A aguardar resposta do aluno
};
const TITULOS_ACAO = {
  registar_orcamento: "Registar Or\xE7amento",
  atualizar_especificacao: "Atualizar especifica\xE7\xE3o do figurino",
  abate: "Registar baixa do figurino"
};
function Ocorrencias() {
  const utilizador = getUtilizadorAtual();
  const isFuncionario = utilizador?.tipo === "funcionario" || utilizador?.tipo === "admin";
  const queryClient = useQueryClient();
  const ocorrenciasQueryKey = isFuncionario ? ["ocorrencias"] : ["minhasOcorrencias"];
  const { data: ocorrencias = [], isFetching: carregando } = useQuery({
    queryKey: ocorrenciasQueryKey,
    queryFn: isFuncionario ? getOcorrencias : getMinhasOcorrencias
  });
  const [selecionada, setSelecionada] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("em_curso");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroAluno, setFiltroAluno] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [acaoAtiva, setAcaoAtiva] = useState(null);
  const [valorProposto, setValorProposto] = useState("");
  const [descricaoProposta, setDescricaoProposta] = useState("");
  const [submetendoProposta, setSubmetendoProposta] = useState(false);
  const [orcamentoFornecedor, setOrcamentoFornecedor] = useState("");
  const [orcamentoValor, setOrcamentoValor] = useState("");
  const [orcamentoDescricao, setOrcamentoDescricao] = useState("");
  const [propostaAContestar, setPropostaAContestar] = useState(null);
  const [valorContraproposta, setValorContraproposta] = useState("");
  const [descricaoContestacao, setDescricaoContestacao] = useState("");
  const [propostaAVisualizar, setPropostaAVisualizar] = useState(null);
  const [editandoFigurino, setEditandoFigurino] = useState(false);
  const [figDescricao, setFigDescricao] = useState("");
  const [figTamanho, setFigTamanho] = useState("");
  const [figLocalizacao, setFigLocalizacao] = useState("");
  const [figEstadoId, setFigEstadoId] = useState(null);
  const { data: estadosCondicao = [] } = useQuery({ queryKey: ["estadosCondicao"], queryFn: getEstadosCondicao });
  const [submetendoFigurino, setSubmetendoFigurino] = useState(false);
  const recarregarSelecionada = async (id) => {
    queryClient.invalidateQueries({ queryKey: ocorrenciasQueryKey });
    if (isFuncionario) {
      const detalhe = await getOcorrencia(id);
      setSelecionada(detalhe);
    } else {
      const lista = await getMinhasOcorrencias();
      setSelecionada(lista.find((o) => o.id === id) ?? null);
    }
  };
  const corEstado = (estado) => {
    const e = (estado || "").toLowerCase();
    if (e === "resolvida") return "bg-green-100 text-green-700";
    if (e === "a aguardar or\xE7amento") return "bg-amber-100 text-amber-800";
    if (e === "a aguardar resposta do aluno") return "bg-blue-100 text-blue-700";
    if (e === "contestada pelo aluno") return "bg-red-100 text-red-700";
    if (e === "a aguardar") return "bg-orange-100 text-orange-700";
    return "bg-gray-100 text-gray-700";
  };
  const iconeEstado = (estado) => {
    const e = (estado || "").toLowerCase();
    if (e === "resolvida") return CheckCircle;
    if (e === "a aguardar or\xE7amento") return Clock;
    if (e === "a aguardar resposta do aluno") return Clock;
    return AlertTriangle;
  };
  const handleNecessitaOrcamento = async () => {
    if (!selecionada) return;
    try {
      await atualizarEstadoOcorrencia(selecionada.id, ESTADO.AGUARDAR_ORCAMENTO);
      toast.success("Ocorr\xEAncia marcada como 'A aguardar or\xE7amento'");
      await recarregarSelecionada(selecionada.id);
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar ocorr\xEAncia");
    }
  };
  const handleAtualizarEspecificacao = () => {
    if (!selecionada) return;
    setFigDescricao(selecionada.figurino_descricao ?? "");
    setFigTamanho("");
    setFigLocalizacao(selecionada.figurino_localizacao ?? "");
    setFigEstadoId(selecionada.figurino_estado_id ?? null);
    setEditandoFigurino(true);
  };
  const fecharEditarFigurino = () => {
    setEditandoFigurino(false);
    setFigDescricao("");
    setFigTamanho("");
    setFigLocalizacao("");
    setFigEstadoId(null);
  };
  const submeterEdicaoFigurino = async (e) => {
    e.preventDefault();
    if (submetendoFigurino) return;
    if (!selecionada?.figurino_id) {
      toast.error("Esta ocorr\xEAncia n\xE3o tem figurino associado.");
      return;
    }
    setSubmetendoFigurino(true);
    try {
      await atualizarFigurino(selecionada.figurino_id, {
        descricao: figDescricao.trim() || void 0,
        tamanho: figTamanho.trim() || void 0,
        localizacao: figLocalizacao.trim() || void 0,
        id_estado_figurino: figEstadoId ?? void 0
      });
      toast.success("Figurino atualizado");
      fecharEditarFigurino();
      setAcaoAtiva("atualizar_especificacao");
      await recarregarSelecionada(selecionada.id);
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar figurino");
    } finally {
      setSubmetendoFigurino(false);
    }
  };
  const handleAbate = async () => {
    if (!selecionada?.figurino_id) {
      toast.error("Esta ocorr\xEAncia n\xE3o tem figurino associado.");
      return;
    }
    if (!window.confirm("A pe\xE7a impede a utiliza\xE7\xE3o do figurino? O figurino ser\xE1 desativado do cat\xE1logo e ficar\xE1 inativo.")) return;
    try {
      await desativarFigurino(selecionada.figurino_id);
      toast.success("Figurino desativado (Baixa registada)");
      setAcaoAtiva("abate");
    } catch (err) {
      toast.error(err.message || "Erro ao desativar figurino");
    }
  };
  const handleRegistarOrcamento = () => {
    setAcaoAtiva("registar_orcamento");
  };
  const handleAceitarContraproposta = async (valor) => {
    if (!selecionada) return;
    if (submetendoProposta) return;
    if (!window.confirm(`Aceitar a contraproposta do aluno (\u20AC${valor.toFixed(2)}) e resolver a ocorr\xEAncia?`)) return;
    setSubmetendoProposta(true);
    try {
      await resolverComContraproposta(selecionada.id, valor);
      toast.success("Contraproposta aceite. Ocorr\xEAncia resolvida.");
      await recarregarSelecionada(selecionada.id);
    } catch (err) {
      toast.error(err.message || "Erro ao aceitar contraproposta");
    } finally {
      setSubmetendoProposta(false);
    }
  };
  const handleContrapor = () => {
    setAcaoAtiva("atualizar_especificacao");
  };
  const fecharFormProposta = () => {
    setAcaoAtiva(null);
    setValorProposto("");
    setDescricaoProposta("");
    setOrcamentoFornecedor("");
    setOrcamentoValor("");
    setOrcamentoDescricao("");
  };
  const handleAceitarProposta = async (idProposta) => {
    if (!window.confirm("Confirma que aceita esta proposta de cobran\xE7a?")) return;
    try {
      await aceitarProposta(idProposta);
      toast.success("Proposta aceite. Ser\xE1 adicionada \xE0 sua conta corrente.");
      if (selecionada) await recarregarSelecionada(selecionada.id);
    } catch (err) {
      toast.error(err.message || "Erro ao aceitar proposta");
    }
  };
  const abrirContestacao = (idProposta) => {
    setPropostaAContestar(idProposta);
    setValorContraproposta("");
    setDescricaoContestacao("");
  };
  const fecharContestacao = () => {
    setPropostaAContestar(null);
    setValorContraproposta("");
    setDescricaoContestacao("");
  };
  const submeterContestacao = async (e) => {
    e.preventDefault();
    if (!propostaAContestar) return;
    if (!descricaoContestacao.trim()) {
      toast.error("Descreva o motivo da contesta\xE7\xE3o.");
      return;
    }
    const valor = valorContraproposta ? parseFloat(valorContraproposta) : null;
    if (valor !== null && (isNaN(valor) || valor < 0)) {
      toast.error("O valor de contesta\xE7\xE3o tem de ser um n\xFAmero v\xE1lido.");
      return;
    }
    try {
      await criarContestacao({
        id_proposta_cobranca: propostaAContestar,
        descricao: descricaoContestacao.trim(),
        valorcontraproposta: valor
      });
      toast.success("Contesta\xE7\xE3o registada");
      fecharContestacao();
      if (selecionada) await recarregarSelecionada(selecionada.id);
    } catch (err) {
      toast.error(err.message || "Erro ao registar contesta\xE7\xE3o");
    }
  };
  const submeterProposta = async (e) => {
    e.preventDefault();
    if (submetendoProposta) return;
    if (!selecionada || !acaoAtiva) return;
    const valor = parseFloat(valorProposto);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Indique um valor v\xE1lido para a proposta ao cliente.");
      return;
    }
    if (acaoAtiva === "registar_orcamento") {
      if (!orcamentoFornecedor.trim()) {
        toast.error("Indique o fornecedor do or\xE7amento.");
        return;
      }
      const valorOrc = orcamentoValor ? parseFloat(orcamentoValor) : NaN;
      if (isNaN(valorOrc) || valorOrc <= 0) {
        toast.error("Indique o valor do or\xE7amento do fornecedor.");
        return;
      }
    }
    setSubmetendoProposta(true);
    try {
      if (acaoAtiva === "registar_orcamento") {
        await criarOrcamento(selecionada.id, {
          fornecedor: orcamentoFornecedor.trim(),
          descricao: orcamentoDescricao.trim() || null,
          valor: parseFloat(orcamentoValor)
        });
      }
      await criarPropostaCobranca(selecionada.id, valor, descricaoProposta);
      toast.success(
        acaoAtiva === "registar_orcamento" ? "Or\xE7amento registado e proposta enviada ao cliente" : "Proposta de valor enviada ao cliente"
      );
      fecharFormProposta();
      await recarregarSelecionada(selecionada.id);
    } catch (err) {
      toast.error(err.message || "Erro ao registar proposta");
    } finally {
      setSubmetendoProposta(false);
    }
  };
  const ocorrenciasEmCurso = useMemo(
    () => [...ocorrencias].filter((o) => (o.estado || "").toLowerCase() !== "resolvida").sort((a, b) => b.id - a.id),
    [ocorrencias]
  );
  const ocorrenciasResolvidas = useMemo(
    () => [...ocorrencias].filter((o) => (o.estado || "").toLowerCase() === "resolvida").sort((a, b) => b.id - a.id),
    [ocorrencias]
  );
  const ocorrenciasDaAba = abaAtiva === "em_curso" ? ocorrenciasEmCurso : ocorrenciasResolvidas;
  const ocorrenciasFiltradas = useMemo(() => {
    return ocorrenciasDaAba.filter((o) => {
      if (filtroTexto) {
        const termo = filtroTexto.toLowerCase();
        const corresponde = o.descricao?.toLowerCase().includes(termo) || String(o.id).includes(termo) || o.figurino_nome?.toLowerCase().includes(termo);
        if (!corresponde) return false;
      }
      if (isFuncionario && filtroAluno) {
        const termo = filtroAluno.toLowerCase();
        if (!o.cliente_nome?.toLowerCase().includes(termo)) return false;
      }
      if (filtroEstado) {
        if ((o.estado || "").toLowerCase() !== filtroEstado.toLowerCase()) return false;
      }
      if (filtroDataInicio) {
        const dataOcorrencia = new Date(o.data_criacao).setHours(0, 0, 0, 0);
        const inicio = new Date(filtroDataInicio).setHours(0, 0, 0, 0);
        if (dataOcorrencia < inicio) return false;
      }
      if (filtroDataFim) {
        const dataOcorrencia = new Date(o.data_criacao).setHours(0, 0, 0, 0);
        const fim = new Date(filtroDataFim).setHours(23, 59, 59, 999);
        if (dataOcorrencia > fim) return false;
      }
      return true;
    });
  }, [ocorrenciasDaAba, filtroTexto, filtroAluno, filtroEstado, filtroDataInicio, filtroDataFim, isFuncionario]);
  const estadosUnicos = useMemo(() => {
    const set = new Set(ocorrenciasDaAba.map((o) => o.estado).filter(Boolean));
    return Array.from(set).sort();
  }, [ocorrenciasDaAba]);
  const temFiltroAtivo = filtroTexto || filtroAluno || filtroEstado || filtroDataInicio || filtroDataFim;
  const limparFiltros = () => {
    setFiltroTexto("");
    setFiltroAluno("");
    setFiltroEstado("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
  };
  if (selecionada) {
    return <DetalheOcorrencia
      ocorrencia={selecionada}
      isFuncionario={isFuncionario}
      onVoltar={() => setSelecionada(null)}
      onNecessitaOrcamento={handleNecessitaOrcamento}
      onAtualizarEspecificacao={handleAtualizarEspecificacao}
      onAbate={handleAbate}
      onRegistarOrcamento={handleRegistarOrcamento}
      onAceitarContraproposta={handleAceitarContraproposta}
      onContrapor={handleContrapor}
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
      editandoFigurino={editandoFigurino}
      figDescricao={figDescricao}
      figTamanho={figTamanho}
      figLocalizacao={figLocalizacao}
      figEstadoId={figEstadoId}
      estadosCondicao={estadosCondicao}
      submetendoFigurino={submetendoFigurino}
      onFigDescricaoChange={setFigDescricao}
      onFigTamanhoChange={setFigTamanho}
      onFigLocalizacaoChange={setFigLocalizacao}
      onFigEstadoChange={setFigEstadoId}
      onCancelarEditarFigurino={fecharEditarFigurino}
      onSubmeterEdicaoFigurino={submeterEdicaoFigurino}
    />;
  }
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ocorrências</h1>
        <p className="text-gray-600">Lista de ocorrências geradas no processo de devolução</p>
      </div>

      {
    /* Separadores */
  }
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex gap-1">
        <button
    onClick={() => setAbaAtiva("em_curso")}
    className={`px-5 py-1.5 rounded-lg text-sm transition-colors ${abaAtiva === "em_curso" ? "bg-gradient-to-r from-fig-purple to-fig-magenta text-white" : "text-gray-600 hover:bg-gray-100"}`}
  >
          Em curso ({ocorrenciasEmCurso.length})
        </button>
        <button
    onClick={() => setAbaAtiva("resolvidas")}
    className={`px-5 py-1.5 rounded-lg text-sm transition-colors ${abaAtiva === "resolvidas" ? "bg-gradient-to-r from-fig-purple to-fig-magenta text-white" : "text-gray-600 hover:bg-gray-100"}`}
  >
          Resolvidas ({ocorrenciasResolvidas.length})
        </button>
      </div>

      {
    /* Painel de filtros */
  }
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          {temFiltroAtivo && <button
    onClick={limparFiltros}
    className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1"
  >
              <X className="w-3 h-3" /> Limpar filtros
            </button>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {
    /* Texto livre */
  }
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
    type="text"
    placeholder="Pesquisar descrição, #id, figurino…"
    value={filtroTexto}
    onChange={(e) => setFiltroTexto(e.target.value)}
    className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
          </div>

          {
    /* Aluno (só para funcionário) */
  }
          {isFuncionario && <input
    type="text"
    placeholder="Filtrar por aluno…"
    value={filtroAluno}
    onChange={(e) => setFiltroAluno(e.target.value)}
    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />}

          {
    /* Estado */
  }
          <select
    value={filtroEstado}
    onChange={(e) => setFiltroEstado(e.target.value)}
    className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
  >
            <option value="">Todos os estados</option>
            {estadosUnicos.map((est) => <option key={est} value={est}>{est}</option>)}
          </select>

          {
    /* Intervalo de datas */
  }
          <div className="flex gap-2">
            <input
    type="date"
    value={filtroDataInicio}
    onChange={(e) => setFiltroDataInicio(e.target.value)}
    title="Data início"
    className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
            <input
    type="date"
    value={filtroDataFim}
    onChange={(e) => setFiltroDataFim(e.target.value)}
    title="Data fim"
    className="w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {carregando ? <p className="text-center text-gray-500 py-8">A carregar...</p> : ocorrencias.length === 0 ? <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
            <p className="text-gray-600">Nenhuma ocorrência registada</p>
          </div> : ocorrenciasDaAba.length === 0 ? <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
            <p className="text-gray-600">
              {abaAtiva === "em_curso" ? "Sem ocorr\xEAncias em curso" : "Sem ocorr\xEAncias resolvidas"}
            </p>
          </div> : ocorrenciasFiltradas.length === 0 ? <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Nenhuma ocorrência corresponde aos filtros</p>
            <button onClick={limparFiltros} className="mt-2 text-sm text-blue-600 hover:underline">
              Limpar filtros
            </button>
          </div> : <div className="space-y-3">
            {ocorrenciasFiltradas.map((o) => {
    const IconeEstado = iconeEstado(o.estado);
    return <button
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
                          {o.estado || "\u2014"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1 truncate">{o.descricao}</p>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-x-4">
                        {o.figurino_nome && <span>Figurino: {o.figurino_nome}</span>}
                        {isFuncionario && o.cliente_nome && <span>Cliente: {o.cliente_nome}</span>}
                        {o.data_criacao && <span>
                            {new Date(o.data_criacao).toLocaleDateString("pt-PT")}
                          </span>}
                      </div>
                    </div>
                  </div>
                </button>;
  })}
          </div>}
      </div>
    </div>;
}
function DetalheOcorrencia(props) {
  const {
    ocorrencia: o,
    isFuncionario,
    onVoltar,
    onNecessitaOrcamento,
    onAtualizarEspecificacao,
    onAbate,
    onRegistarOrcamento,
    onAceitarContraproposta,
    onContrapor,
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
    editandoFigurino,
    figDescricao,
    figTamanho,
    figLocalizacao,
    figEstadoId,
    estadosCondicao,
    submetendoFigurino,
    onFigDescricaoChange,
    onFigTamanhoChange,
    onFigLocalizacaoChange,
    onFigEstadoChange,
    onCancelarEditarFigurino,
    onSubmeterEdicaoFigurino
  } = props;
  const estadoLower = (o.estado || "").toLowerCase();
  const aguardar = estadoLower === "a aguardar";
  const contestadaPeloAluno = estadoLower === "contestada pelo aluno";
  const aguardarOrcamento = estadoLower === "a aguardar or\xE7amento";
  const resolvida = estadoLower === "resolvida";
  const IconeEstado = iconeEstado(o.estado);
  const contestacoesOrdenadas = (o.propostas ?? []).flatMap((p) => (p.contestacoes ?? []).map((c) => ({ ...c, idProposta: p.id }))).sort((a, b) => {
    if (b.idProposta !== a.idProposta) return b.idProposta - a.idProposta;
    return b.id - a.id;
  });
  const ultimaContestacao = contestacoesOrdenadas[0];
  const valorContrapropostaAluno = ultimaContestacao?.valorcontraproposta ?? null;
  const propostasOrdenadas = [...o.propostas ?? []].sort((a, b) => b.id - a.id);
  const ultimaPropostaPendenteId = propostasOrdenadas.find((p) => {
    const est = (p.estado || "").toLowerCase();
    return est !== "aceite" && est !== "rejeitada";
  })?.id ?? null;
  const temPropostaPendente = ultimaPropostaPendenteId !== null;
  return <div className="space-y-6">
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
            {o.estado || "\u2014"}
          </span>
        </div>
      </div>

      {
    /* Detalhes */
  }
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Detalhes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Campo label="Descrição" valor={o.descricao} />
          <Campo
    label="Data de criação"
    valor={o.data_criacao ? new Date(o.data_criacao).toLocaleDateString("pt-PT") : "\u2014"}
  />
          {isFuncionario && <Campo label="Cliente" valor={o.cliente_nome || "\u2014"} />}
          {isFuncionario && <Campo label="Email do cliente" valor={o.cliente_email || "\u2014"} />}
          <Campo label="Figurino" valor={o.figurino_nome || "\u2014"} />
          <Campo label="Categoria" valor={o.figurino_categoria || "\u2014"} />
          {isFuncionario && <Campo
    label="Figurino ativo?"
    valor={o.figurino_ativo === false ? "N\xE3o" : "Sim"}
  />}
        </div>
      </div>

      {
    /* Propostas existentes */
  }
      {o.propostas && o.propostas.length > 0 && <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Propostas de cobrança
          </h2>
          <div className="space-y-3">
            {o.propostas.map((p) => {
    const podeAgir = !isFuncionario && p.id === ultimaPropostaPendenteId && !contestadaPeloAluno;
    return <div key={p.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                    <div>
                      <p className="font-medium text-gray-900">Proposta #{p.id}</p>
                      <p className="text-sm text-gray-600">
                        Valor: <span className="font-semibold text-gray-900">€{p.valor.toFixed(2)}</span>
                      </p>
                      {p.dataproposta && <p className="text-xs text-gray-500">
                          {new Date(p.dataproposta).toLocaleDateString("pt-PT")}
                        </p>}
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {p.estado || "\u2014"}
                    </span>
                  </div>

                  {p.descricao && <p className="text-sm text-gray-700 mb-2 italic">{p.descricao}</p>}

                  {
      /* Contestações já registadas */
    }
                  {p.contestacoes && p.contestacoes.length > 0 && <div className="mt-2 space-y-2">
                      {p.contestacoes.map((c) => <div
      key={c.id}
      className="bg-orange-50 border border-orange-200 rounded p-3 text-sm"
    >
                          <p className="font-medium text-orange-900">
                            Contestação registada
                          </p>
                          <p className="text-gray-700 mt-1">{c.descricao}</p>
                          {c.valorcontraproposta !== null && c.valorcontraproposta !== void 0 && <p className="text-orange-800 mt-1">
                              Valor proposto pelo cliente: €{Number(c.valorcontraproposta).toFixed(2)}
                            </p>}
                        </div>)}
                    </div>}

                  {
      /* Botão Ver: disponível para qualquer utilizador, em qualquer estado */
    }
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
      onClick={() => onAbrirVisualizacao(p.id)}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
    >
                      <Eye className="w-4 h-4" />
                      Ver detalhes
                    </button>
                    {podeAgir && <>
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
                      </>}
                  </div>
                </div>;
  })}
          </div>
        </div>}

      {
    /* Ações — ocultas quando há proposta pendente, exceto se a ocorrência está contestada
       (nesse caso o funcionário deve sempre poder aceitar a contraproposta ou propor novo valor) */
  }
      {isFuncionario && !resolvida && (!temPropostaPendente || contestadaPeloAluno) && <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações</h2>

          {aguardar && !acaoAtiva && <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <BotaoAcao
    onClick={onNecessitaOrcamento}
    cor="amber"
    icone={Clock}
    titulo="Necessita orçamento"
    descricao="A peça precisa de reparação externa. Coloca a ocorrência em 'A aguardar orçamento'."
  />
              <BotaoAcao
    onClick={onAtualizarEspecificacao}
    cor="blue"
    icone={Wrench}
    titulo="Atualizar especificação"
    descricao="O dano/falta NÃO impede a utilização. Mantém o figurino ativo e envia proposta de penalização."
  />
              <BotaoAcao
    onClick={onAbate}
    cor="red"
    icone={PackageX}
    titulo="Registar baixa"
    descricao="O dano/falta IMPEDE a utilização. Desativa o figurino do catálogo e envia proposta de cobrança."
  />
            </div>}

          {contestadaPeloAluno && !acaoAtiva && <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {valorContrapropostaAluno != null && <BotaoAcao
    onClick={() => onAceitarContraproposta(Number(valorContrapropostaAluno))}
    cor="green"
    icone={ThumbsUp}
    titulo={`Aceitar proposta do aluno \u2014 \u20AC${Number(valorContrapropostaAluno).toFixed(2)}`}
    descricao="Concorda com o valor sugerido pelo aluno. A ocorrência fica resolvida e o montante é lançado em conta corrente."
  />}
              <BotaoAcao
    onClick={onContrapor}
    cor="purple"
    icone={Euro}
    titulo="Enviar nova proposta de valor"
    descricao="Não aceita o valor do aluno. Indique um novo montante — a ocorrência fica 'A aguardar resposta do aluno'."
  />
            </div>}

          {aguardarOrcamento && !acaoAtiva && <BotaoAcao
    onClick={onRegistarOrcamento}
    cor="purple"
    icone={FileText}
    titulo="Registar Orçamento"
    descricao="Recebeu o orçamento do fornecedor? Registe os dados (fornecedor, valor da reparação) e envie a proposta de valor ao cliente. A ocorrência volta a 'A aguardar' resposta do cliente."
  />}
        </div>}

      {
    /* Aviso quando há proposta a aguardar resposta do cliente (não mostrar no estado "contestada") */
  }
      {isFuncionario && !resolvida && temPropostaPendente && !contestadaPeloAluno && <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              Existe uma proposta enviada ao cliente. As próximas ações ficam
              disponíveis quando o cliente aceitar ou contestar.
            </p>
          </div>
        </div>}

      {
    /* Modal contestação (aluno) */
  }
      {propostaAContestar !== null && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
        </div>}

      {
    /* Modal proposta valor */
  }
      {acaoAtiva && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {TITULOS_ACAO[acaoAtiva]}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {acaoAtiva === "registar_orcamento" ? `Registar or\xE7amento do fornecedor e enviar proposta ao cliente \u2014 Ocorr\xEAncia #${o.id}` : `Proposta de valor ao cliente \u2014 Ocorr\xEAncia #${o.id}`}
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
              {acaoAtiva === "registar_orcamento" && <div className="space-y-4 pb-4 border-b">
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
                </div>}

              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {acaoAtiva === "registar_orcamento" ? "Proposta de valor ao cliente" : "Valor a cobrar"}
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
        </div>}

      {
    /* Modal "Editar figurino" — primeiro passo de "Atualizar especificação" */
  }
      {editandoFigurino && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Atualizar especificação do figurino</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Reveja os dados do figurino antes de enviar a proposta de penalização ao cliente.
                </p>
              </div>
              <button
    onClick={onCancelarEditarFigurino}
    className="text-gray-400 hover:text-gray-600"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmeterEdicaoFigurino} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
    value={figDescricao}
    onChange={(e) => onFigDescricaoChange(e.target.value)}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    rows={3}
  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
                <input
    type="text"
    value={figTamanho}
    onChange={(e) => onFigTamanhoChange(e.target.value)}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    placeholder="Ex: M, 38, 12 anos"
  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                <input
    type="text"
    value={figLocalizacao}
    onChange={(e) => onFigLocalizacaoChange(e.target.value)}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    placeholder="Ex: Armário 3, Prateleira B"
  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado de condição</label>
                <select
    value={figEstadoId ?? ""}
    onChange={(e) => onFigEstadoChange(e.target.value === "" ? null : Number(e.target.value))}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  >
                  <option value="">— Selecione —</option>
                  {estadosCondicao.map((est) => <option key={est.id} value={est.id}>{est.nome}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
    type="button"
    onClick={onCancelarEditarFigurino}
    disabled={submetendoFigurino}
    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
  >
                  Cancelar
                </button>
                <button
    type="submit"
    disabled={submetendoFigurino}
    className="flex-1 px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
  >
                  {submetendoFigurino ? "A guardar..." : "Guardar e prosseguir"}
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* Modal "Ver detalhes da proposta" */
  }
      {propostaAVisualizar !== null && (() => {
    const p = (o.propostas ?? []).find((pp) => pp.id === propostaAVisualizar);
    if (!p) return null;
    const orcamento = (o.orcamentos ?? [])[0];
    return <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
                    <p className="font-medium text-gray-900">{p.estado || "\u2014"}</p>
                  </div>
                  {p.dataproposta && <div className="col-span-2">
                      <p className="text-sm text-gray-600">Data da proposta</p>
                      <p className="font-medium text-gray-900">
                        {new Date(p.dataproposta).toLocaleDateString("pt-PT")}
                      </p>
                    </div>}
                </div>

                {p.descricao && <div>
                    <p className="text-sm text-gray-600 mb-1">Notas do funcionário</p>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                      {p.descricao}
                    </p>
                  </div>}

                {orcamento && isFuncionario && <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      Orçamento do fornecedor
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Fornecedor</p>
                        <p className="font-medium text-gray-900">{orcamento.fornecedor || "\u2014"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Valor do orçamento</p>
                        <p className="font-medium text-gray-900">€{orcamento.valor.toFixed(2)}</p>
                      </div>
                      {orcamento.descricao && <div className="col-span-2">
                          <p className="text-sm text-gray-600">Descrição do trabalho</p>
                          <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 mt-1">
                            {orcamento.descricao}
                          </p>
                        </div>}
                    </div>
                  </div>}

                {p.contestacoes && p.contestacoes.length > 0 && <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                      Contestações registadas
                    </h3>
                    <div className="space-y-2">
                      {p.contestacoes.map((c) => <div key={c.id} className="bg-orange-50 border border-orange-200 rounded p-3 text-sm">
                          <p className="text-gray-700">{c.descricao}</p>
                          {c.valorcontraproposta != null && <p className="text-orange-800 mt-1">
                              Valor proposto pelo cliente: €{Number(c.valorcontraproposta).toFixed(2)}
                            </p>}
                        </div>)}
                    </div>
                  </div>}

                <button
      type="button"
      onClick={onFecharVisualizacao}
      className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
    >
                  Fechar
                </button>
              </div>
            </div>
          </div>;
  })()}
    </div>;
}
function Campo({ label, valor }) {
  return <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium text-gray-900">{valor}</p>
    </div>;
}
function BotaoAcao({ onClick, cor, icone: Icone, titulo, descricao }) {
  const cores = {
    amber: "border-amber-200 hover:bg-amber-50 text-amber-700",
    red: "border-red-200 hover:bg-red-50 text-red-700",
    blue: "border-blue-200 hover:bg-blue-50 text-blue-700",
    gray: "border-gray-300 hover:bg-gray-50 text-gray-700",
    purple: "border-fig-purple/30 hover:bg-fig-purple/5 text-fig-purple",
    green: "border-green-200 hover:bg-green-50 text-green-700"
  };
  return <button
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
    </button>;
}
export {
  Ocorrencias
};
