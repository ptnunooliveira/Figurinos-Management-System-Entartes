import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Shirt, AlertCircle, Euro, FileText, ListChecks, X } from "lucide-react";
import {
  getMarketplaceGestao, aprovarAnuncioMarketplace,
  getOcorrencias, criarPropostaCobranca, atualizarEstadoOcorrencia,
  getPropostasCobranca, atualizarEstadoProposta, finalizarPropostaContaCorrente,
  type PropostaCobranca,
} from "../lib/services";
import type { AnuncioMarketplace, Ocorrencia } from "../lib/dados-mock";
import { toast } from "sonner";

export function Administracao() {
  const [abaAtiva, setAbaAtiva] = useState<"anuncios" | "ocorrencias" | "propostas">("anuncios");
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<number | null>(null);
  const [valorCobranca, setValorCobranca] = useState("");
  const [descricaoCobranca, setDescricaoCobranca] = useState("");

  const [anunciosPendentes, setAnunciosPendentes] = useState<AnuncioMarketplace[]>([]);
  const [ocorrenciasPendentes, setOcorrenciasPendentes] = useState<Ocorrencia[]>([]);
  const [propostas, setPropostas] = useState<PropostaCobranca[]>([]);
  const [anuncioParaRejeitar, setAnuncioParaRejeitar] = useState<AnuncioMarketplace | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [anuncioDetalhe, setAnuncioDetalhe] = useState<AnuncioMarketplace | null>(null);

  const carregarDados = () => {
    getMarketplaceGestao('Submetido').then(setAnunciosPendentes);
    getOcorrencias().then(ocs => {
      setOcorrenciasPendentes(ocs.filter(o => {
        const e = o.estado?.toLowerCase();
        return e === 'em análise' || e === 'pendente';
      }));
    });
    getPropostasCobranca().then(setPropostas);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const aprovarAnuncio = async (id: number) => {
    try {
      await aprovarAnuncioMarketplace(id, true);
      toast.success("Anúncio aprovado com sucesso!");
      carregarDados();
    } catch (err: any) {
      toast.error(err.message || "Erro ao aprovar anúncio");
    }
  };

  const rejeitarAnuncio = async (id: number, motivo: string) => {
    try {
      await aprovarAnuncioMarketplace(id, false, motivo);
      toast.success("Anúncio rejeitado");
      carregarDados();
    } catch (err: any) {
      toast.error(err.message || "Erro ao rejeitar anúncio");
    }
  };

  const abrirModalRejeicao = (anuncio: AnuncioMarketplace) => {
    setAnuncioParaRejeitar(anuncio);
    setMotivoRejeicao("");
  };

  const fecharModalRejeicao = () => {
    setAnuncioParaRejeitar(null);
    setMotivoRejeicao("");
  };

  const confirmarRejeicao = async () => {
    if (!anuncioParaRejeitar) return;

    const motivo = motivoRejeicao.trim();
    if (!motivo) {
      toast.error("Indique o motivo da rejeição");
      return;
    }

    await rejeitarAnuncio(anuncioParaRejeitar.id, motivo);
    fecharModalRejeicao();
  };

  const abrirDetalhesAnuncio = (anuncio: AnuncioMarketplace) => setAnuncioDetalhe(anuncio);
  const fecharDetalhesAnuncio = () => setAnuncioDetalhe(null);

  const handleResolverOcorrencia = async (id: number) => {
    try {
      // Estado 2 = Resolvida (ajuste conforme a base de dados)
      await atualizarEstadoOcorrencia(id, 2);
      toast.success("Ocorrência marcada como resolvida");
      carregarDados();
    } catch (err: any) {
      toast.error(err.message || "Erro ao resolver ocorrência");
    }
  };

  const handleAtualizarEstadoProposta = async (id: number, idEstado: number, label: string) => {
    try {
      await atualizarEstadoProposta(id, idEstado);
      toast.success(`Proposta marcada como ${label}`);
      carregarDados();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar proposta");
    }
  };

  const handleFinalizarProposta = async (id: number) => {
    try {
      await finalizarPropostaContaCorrente(id);
      toast.success("Proposta finalizada e adicionada à conta corrente");
      carregarDados();
    } catch (err: any) {
      toast.error(err.message || "Erro ao finalizar proposta");
    }
  };

  const handleCriarPropostaCobranca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ocorrenciaSelecionada || !valorCobranca) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const valor = parseFloat(valorCobranca);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }

    try {
      await criarPropostaCobranca(ocorrenciaSelecionada, valor);
      toast.success(`Proposta de cobrança de €${valor.toFixed(2)} criada com sucesso!`);
      setOcorrenciaSelecionada(null);
      setValorCobranca("");
      setDescricaoCobranca("");
      carregarDados();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar proposta");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administração</h1>
        <p className="text-gray-600">Gerencie anúncios e ocorrências</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex gap-1">
        <button
          onClick={() => setAbaAtiva("anuncios")}
          className={`px-6 py-2 rounded-lg transition-colors ${
            abaAtiva === "anuncios"
              ? "text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          style={abaAtiva === "anuncios" ? { backgroundColor: "var(--fig-purple)" } : {}}
        >
          Anúncios ({anunciosPendentes.length})
        </button>
        <button
          onClick={() => setAbaAtiva("ocorrencias")}
          className={`px-6 py-2 rounded-lg transition-colors ${
            abaAtiva === "ocorrencias"
              ? "text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          style={abaAtiva === "ocorrencias" ? { backgroundColor: "var(--fig-purple)" } : {}}
        >
          Ocorrências ({ocorrenciasPendentes.length})
        </button>
        <button
          onClick={() => setAbaAtiva("propostas")}
          className={`px-6 py-2 rounded-lg transition-colors ${
            abaAtiva === "propostas"
              ? "text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          style={abaAtiva === "propostas" ? { backgroundColor: "var(--fig-purple)" } : {}}
        >
          <span className="flex items-center gap-1">
            <ListChecks className="w-4 h-4" />
            Propostas ({propostas.length})
          </span>
        </button>
      </div>

      {abaAtiva === "anuncios" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Anúncios Pendentes de Aprovação
          </h3>
          {anunciosPendentes.length > 0 ? (
            <div className="space-y-4">
              {anunciosPendentes.map((anuncio) => (
                <div key={anuncio.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-fig-purple/20 to-fig-magenta/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      {anuncio.imagens?.length > 0 ? (
                        <img src={anuncio.imagens[0]} alt={anuncio.titulo} className="w-20 h-20 rounded-lg object-cover" />
                      ) : (
                        <Shirt className="w-10 h-10 text-fig-purple" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{anuncio.titulo}</h4>
                      <p className="text-sm text-gray-600 mb-2">{anuncio.descricao}</p>
                      <div className="flex gap-2 mb-2">
                        <span className="px-2 py-1 bg-fig-purple/10 text-fig-purple text-xs rounded">
                          {anuncio.categoria}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {anuncio.tamanho}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Submetido em {new Date(anuncio.data_anuncio).toLocaleDateString('pt-PT')}
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={() => abrirDetalhesAnuncio(anuncio)}
                          className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 self-center">
                      <button
                        onClick={() => aprovarAnuncio(anuncio.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-fig-green hover:bg-fig-green/90 text-white rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => abrirModalRejeicao(anuncio)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
              <p className="text-gray-600">Nenhum anúncio pendente de aprovação</p>
            </div>
          )}
        </div>
      )}

      {anuncioParaRejeitar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Motivo da rejeição</h2>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{anuncioParaRejeitar.titulo}</p>
            </div>

            <div className="p-6 space-y-3">
              <textarea
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                placeholder="Ex: Descrição incompleta e sem detalhes do estado da peça."
              />
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={fecharModalRejeicao}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRejeicao}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {anuncioDetalhe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{anuncioDetalhe.titulo}</h2>
                <p className="text-sm text-gray-600 mt-1">Detalhes do anúncio</p>
              </div>
              <button type="button" onClick={fecharDetalhesAnuncio} className="text-gray-500 hover:text-gray-700" aria-label="Fechar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {anuncioDetalhe.imagens?.length > 0 ? (
                  anuncioDetalhe.imagens.map((img, idx) => (
                    <img key={`${anuncioDetalhe.id}-${idx}`} src={img} alt={`${anuncioDetalhe.titulo} ${idx + 1}`} className="w-full h-56 object-cover rounded-lg border" />
                  ))
                ) : (
                  <div className="sm:col-span-2 h-56 rounded-lg border bg-gray-50 flex items-center justify-center">
                    <Shirt className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-700">{anuncioDetalhe.descricao || "Sem descrição."}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Categoria</span><p className="font-medium">{anuncioDetalhe.categoria || "—"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Tamanho</span><p className="font-medium">{anuncioDetalhe.tamanho || "—"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Tipo</span><p className="font-medium">{anuncioDetalhe.tipo || "—"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Sexo</span><p className="font-medium">{anuncioDetalhe.sexo || "—"}</p></div>
              </div>

              <p className="text-xs text-gray-500">Submetido em {new Date(anuncioDetalhe.data_anuncio).toLocaleDateString('pt-PT')}</p>
            </div>
          </div>
        </div>
      )}

      {abaAtiva === "ocorrencias" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ocorrências em Análise</h3>
          {ocorrenciasPendentes.length > 0 ? (
            <div className="space-y-4">
              {ocorrenciasPendentes.map((ocorrencia) => (
                <div key={ocorrencia.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Ocorrência #{ocorrencia.id} - {ocorrencia.tipo}
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">{ocorrencia.descricao}</p>
                      <p className="text-xs text-gray-600">
                        Criada em {new Date(ocorrencia.data_criacao).toLocaleDateString('pt-PT')}
                      </p>
                      {ocorrencia.valor_proposto && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-medium text-red-700">
                            Valor proposto: €{ocorrencia.valor_proposto.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setOcorrenciaSelecionada(ocorrencia.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-fig-magenta hover:bg-fig-magenta/90 text-white rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Euro className="w-4 h-4" />
                        Criar Cobrança
                      </button>
                      <button
                        onClick={() => handleResolverOcorrencia(ocorrencia.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-fig-purple hover:bg-fig-purple/90 text-white rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Resolver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
              <p className="text-gray-600">Nenhuma ocorrência pendente</p>
            </div>
          )}
        </div>
      )}

      {abaAtiva === "propostas" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Propostas de Cobrança</h3>
          {propostas.length > 0 ? (
            <div className="space-y-4">
              {propostas.map((p) => (
                <div key={p.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">Proposta #{p.id}</p>
                      <p className="text-sm text-gray-600">Ocorrência #{p.id_ocorrencia}</p>
                      <p className="text-sm text-gray-600">Valor: <span className="font-medium text-red-600">€{p.valor.toFixed(2)}</span></p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{p.estado}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {p.estado?.toLowerCase() !== 'finalizada' && p.estado?.toLowerCase() !== 'aceite' && (
                        <button
                          onClick={() => handleAtualizarEstadoProposta(p.id, 2, 'Aceite')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aceitar
                        </button>
                      )}
                      {p.estado?.toLowerCase() !== 'finalizada' && p.estado?.toLowerCase() !== 'rejeitada' && (
                        <button
                          onClick={() => handleAtualizarEstadoProposta(p.id, 3, 'Rejeitada')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeitar
                        </button>
                      )}
                      {(p.estado?.toLowerCase() === 'aceite') && (
                        <button
                          onClick={() => handleFinalizarProposta(p.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-fig-purple hover:bg-fig-purple/90 text-white text-sm rounded-lg transition-colors"
                        >
                          <Euro className="w-4 h-4" />
                          Mover p/ Conta Corrente
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ListChecks className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Nenhuma proposta de cobrança</p>
            </div>
          )}
        </div>
      )}

      {/* Diálogo Criar Proposta de Cobrança */}
      {ocorrenciaSelecionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Criar Proposta de Cobrança</h2>
              <p className="text-sm text-gray-600 mt-1">
                Ocorrência #{ocorrenciaSelecionada}
              </p>
            </div>

            <form onSubmit={handleCriarPropostaCobranca} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor a Cobrar (€) *
                </label>
                <div className="relative">
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorCobranca}
                    onChange={(e) => setValorCobranca(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição da Cobrança
                </label>
                <textarea
                  value={descricaoCobranca}
                  onChange={(e) => setDescricaoCobranca(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                  rows={3}
                  placeholder="Descreva o motivo da cobrança..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Nota:</strong> Esta proposta será adicionada à conta corrente do cliente e aparecerá na faturação como valor a cobrar.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOcorrenciaSelecionada(null);
                    setValorCobranca("");
                    setDescricaoCobranca("");
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Criar Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
