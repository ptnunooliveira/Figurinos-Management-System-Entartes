import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Shirt, AlertCircle, Euro, FileText } from "lucide-react";
import { getMarketplaceGestao, aprovarAnuncioMarketplace, getOcorrencias, criarPropostaCobranca } from "../lib/services";
import type { AnuncioMarketplace, Ocorrencia } from "../lib/dados-mock";
import { toast } from "sonner";

export function Administracao() {
  const [abaAtiva, setAbaAtiva] = useState<"anuncios" | "ocorrencias">("anuncios");
  const [ocorrenciaSelecionada, setOcorrenciaSelecionada] = useState<number | null>(null);
  const [valorCobranca, setValorCobranca] = useState("");
  const [descricaoCobranca, setDescricaoCobranca] = useState("");

  const [anunciosPendentes, setAnunciosPendentes] = useState<AnuncioMarketplace[]>([]);
  const [ocorrenciasPendentes, setOcorrenciasPendentes] = useState<Ocorrencia[]>([]);

  const carregarDados = () => {
    getMarketplaceGestao('Pendente').then(setAnunciosPendentes);
    getOcorrencias().then(ocs => {
      setOcorrenciasPendentes(ocs.filter(o => {
        const e = o.estado?.toLowerCase();
        return e === 'em análise' || e === 'pendente';
      }));
    });
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

  const rejeitarAnuncio = async (id: number) => {
    const motivo = prompt("Motivo da rejeição:");
    if (!motivo) return;
    try {
      await aprovarAnuncioMarketplace(id, false, motivo);
      toast.success("Anúncio rejeitado");
      carregarDados();
    } catch (err: any) {
      toast.error(err.message || "Erro ao rejeitar anúncio");
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
                      <Shirt className="w-10 h-10 text-fig-purple" />
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
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => aprovarAnuncio(anuncio.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-fig-green hover:bg-fig-green/90 text-white rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => rejeitarAnuncio(anuncio.id)}
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
                      <button className="flex items-center gap-2 px-4 py-2 bg-fig-purple hover:bg-fig-purple/90 text-white rounded-lg transition-colors">
                        <FileText className="w-4 h-4" />
                        Ver Detalhes
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
