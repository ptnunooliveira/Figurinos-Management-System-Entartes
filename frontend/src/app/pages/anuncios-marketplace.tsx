import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Shirt, X } from "lucide-react";
import { getMarketplaceGestao, aprovarAnuncioMarketplace } from "../lib/services";
import type { AnuncioMarketplace } from "../lib/dados-mock";
import { toast } from "sonner";

export function AnunciosMarketplace() {
  const [anuncios, setAnuncios] = useState<AnuncioMarketplace[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [anuncioParaRejeitar, setAnuncioParaRejeitar] = useState<AnuncioMarketplace | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [submetendo, setSubmetendo] = useState(false);

  const carregar = () => {
    setCarregando(true);
    getMarketplaceGestao('Pendente')
      .then(setAnuncios)
      .finally(() => setCarregando(false));
  };

  useEffect(() => { carregar(); }, []);

  const aprovar = async (id: number) => {
    try {
      await aprovarAnuncioMarketplace(id, true);
      toast.success("Anúncio aprovado");
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao aprovar anúncio");
    }
  };

  const abrirRejeicao = (anuncio: AnuncioMarketplace) => {
    setAnuncioParaRejeitar(anuncio);
    setMotivoRejeicao("");
  };

  const submeterRejeicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anuncioParaRejeitar) return;
    if (!motivoRejeicao.trim()) {
      toast.error("Indique o motivo da rejeição");
      return;
    }
    setSubmetendo(true);
    try {
      await aprovarAnuncioMarketplace(anuncioParaRejeitar.id, false, motivoRejeicao.trim());
      toast.success("Anúncio rejeitado");
      setAnuncioParaRejeitar(null);
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao rejeitar anúncio");
    } finally {
      setSubmetendo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão Marketplace</h1>
        <p className="text-gray-600">Aprovação de anúncios submetidos por alunos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Pendentes de aprovação
            {anuncios.length > 0 && (
              <span className="ml-2 px-2.5 py-0.5 text-sm font-medium bg-orange-100 text-orange-800 rounded-full">
                {anuncios.length}
              </span>
            )}
          </h2>
        </div>

        {carregando ? (
          <p className="text-center text-gray-500 py-12">A carregar...</p>
        ) : anuncios.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto text-green-300 mb-4" />
            <p className="text-gray-600 font-medium">Nenhum anúncio pendente</p>
            <p className="text-sm text-gray-400 mt-1">Todos os anúncios foram tratados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {anuncios.map((anuncio) => (
              <div key={anuncio.id} className="border rounded-xl p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-fig-purple/20 to-fig-magenta/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {anuncio.imagens?.length > 0 ? (
                      <img src={anuncio.imagens[0]} alt={anuncio.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <Shirt className="w-10 h-10 text-fig-purple" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{anuncio.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{anuncio.descricao}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-fig-purple/10 text-fig-purple text-xs rounded-full font-medium">
                        {anuncio.categoria}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {anuncio.tamanho}
                      </span>
                      {anuncio.tipo && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {anuncio.tipo}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      Submetido em {new Date(anuncio.data_anuncio).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => aprovar(anuncio.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => abrirRejeicao(anuncio)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Rejeição */}
      {anuncioParaRejeitar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Rejeitar Anúncio</h2>
                <p className="text-sm text-gray-600 mt-1 truncate max-w-xs">{anuncioParaRejeitar.titulo}</p>
              </div>
              <button onClick={() => setAnuncioParaRejeitar(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submeterRejeicao} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da rejeição *
                </label>
                <textarea
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent resize-none"
                  placeholder="Indique o motivo pelo qual o anúncio não pode ser aprovado..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAnuncioParaRejeitar(null)}
                  disabled={submetendo}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submetendo}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-60"
                >
                  {submetendo ? "A rejeitar..." : "Confirmar Rejeição"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
