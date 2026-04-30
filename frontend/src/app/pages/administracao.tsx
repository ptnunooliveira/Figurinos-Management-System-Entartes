import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Shirt, Euro, ListChecks } from "lucide-react";
import {
  getMarketplaceGestao, aprovarAnuncioMarketplace,
  getPropostasCobranca, atualizarEstadoProposta, finalizarPropostaContaCorrente,
  type PropostaCobranca,
} from "../lib/services";
import type { AnuncioMarketplace } from "../lib/dados-mock";
import { toast } from "sonner";

export function Administracao() {
  const [abaAtiva, setAbaAtiva] = useState<"anuncios" | "propostas">("anuncios");

  const [anunciosPendentes, setAnunciosPendentes] = useState<AnuncioMarketplace[]>([]);
  const [propostas, setPropostas] = useState<PropostaCobranca[]>([]);
  const [anuncioParaRejeitar, setAnuncioParaRejeitar] = useState<AnuncioMarketplace | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [anuncioDetalhe, setAnuncioDetalhe] = useState<AnuncioMarketplace | null>(null);

  const carregarDados = () => {
    getMarketplaceGestao('Pendente').then(setAnunciosPendentes);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administração</h1>
        <p className="text-gray-600">Gerencie anúncios e propostas de cobrança</p>
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

    </div>
  );
}
