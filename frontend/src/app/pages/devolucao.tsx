import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { getUtilizadorAtual } from "../lib/auth";
import { getReservaDetalhes, getEstadosCondicao, criarChecklist } from "../lib/services";
import type { AuxiliarItem } from "../lib/services";
import type { Reserva } from "../lib/dados-mock";
import { toast } from "sonner";

export function Devolucao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assinaturaFuncionarioRef = useRef<SignatureCanvas>(null);
  const assinaturaClienteRef = useRef<SignatureCanvas>(null);
  const utilizadorAtual = getUtilizadorAtual();

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [estadosCondicao, setEstadosCondicao] = useState<AuxiliarItem[]>([]);
  const [estadoFinalId, setEstadoFinalId] = useState<number | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [ocorrenciaAlerta, setOcorrenciaAlerta] = useState<{ id: number; descricao: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getReservaDetalhes(Number(id)),
      getEstadosCondicao(),
    ]).then(([r, estados]) => {
      if (r) setReserva(r);
      setEstadosCondicao(estados);
      if (estados.length > 0) setEstadoFinalId(estados[0].id);
      setCarregando(false);
    });
  }, [id]);

  const linhaReserva = reserva?.linhas[0];
  const figurino = linhaReserva?.anuncio.figurino;

  const estadoInicialNome = figurino?.estado || "—";

  const limparAssinatura = (tipo: 'funcionario' | 'cliente') => {
    if (tipo === 'funcionario') assinaturaFuncionarioRef.current?.clear();
    else assinaturaClienteRef.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!estadoFinalId) {
      toast.error("Por favor, selecione o estado do figurino na devolução");
      return;
    }

    if (assinaturaFuncionarioRef.current?.isEmpty() || assinaturaClienteRef.current?.isEmpty()) {
      toast.error("Por favor, recolha ambas as assinaturas");
      return;
    }

    if (!reserva) return;

    const assinaturaFuncionario = assinaturaFuncionarioRef.current?.toDataURL() ?? '';
    const assinaturaCliente = assinaturaClienteRef.current?.toDataURL() ?? '';

    try {
      const result = await criarChecklist(Number(id), {
        id_tipo_checklist: 2,
        assinaturaFuncionario,
        assinaturaEncarregado: assinaturaCliente,
        itens: reserva.linhas.map(linha => ({
          id_linha_reserva: linha.id,
          idfigurino: linha.anuncio.figurino.id,
          id_estado: estadoFinalId,
          observacoes: observacoes || undefined,
        })),
      });

      if (result?.ocorrencias?.length > 0) {
        const oc = result.ocorrencias[0];
        setOcorrenciaAlerta({ id: oc.id, descricao: oc.descricao });
        toast.warning(`Alerta: Estado do figurino inferior ao estado inicial. Ocorrência #${oc.id} gerada automaticamente.`);
      } else {
        toast.success("Devolução registada com sucesso!");
        setTimeout(() => navigate("/reservas"), 1500);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao registar devolução");
    }
  };

  if (carregando) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">A carregar reserva...</p>
      </div>
    );
  }

  if (!figurino) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Reserva não encontrada</p>
        <Link to="/reservas" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
          Voltar às reservas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <Link to="/reservas" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar às Reservas
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checklist de Devolução</h1>
        <p className="text-gray-600">Reserva #{id} — {reserva?.utilizador.nome}</p>
      </div>

      {/* Alerta de Ocorrência Gerada */}
      {ocorrenciaAlerta && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-900">
                Estado do figurino inferior ao estado inicial
              </p>
              <p className="text-sm text-orange-800 mt-1">
                Ocorrência <strong>#{ocorrenciaAlerta.id}</strong> gerada automaticamente.
              </p>
              <button
                onClick={() => navigate("/reservas")}
                className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm transition-colors"
              >
                Voltar às Reservas
              </button>
            </div>
          </div>
        </div>
      )}

      {!ocorrenciaAlerta && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informação do Figurino */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informação do Figurino</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium text-gray-900">{figurino.nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tamanho</p>
                <p className="font-medium text-gray-900">{figurino.tamanho || "—"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Descrição</p>
                <p className="font-medium text-gray-900">{figurino.descricao || "—"}</p>
              </div>
            </div>
          </div>

          {/* Estado do Figurino */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado do Figurino</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estado inicial */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Estado Inicial</p>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-medium">
                  {estadoInicialNome}
                </div>
                <p className="text-xs text-gray-500 mt-1">Estado registado na base de dados</p>
              </div>

              {/* Estado na devolução */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado na Devolução <span className="text-red-500">*</span>
                </label>
                <select
                  value={estadoFinalId ?? ''}
                  onChange={e => setEstadoFinalId(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {estadosCondicao.map(est => (
                    <option key={est.id} value={est.id}>{est.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observações */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Anote quaisquer observações sobre o estado do figurino..."
              />
            </div>
          </div>

          {/* Assinaturas */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assinaturas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assinatura do Funcionário ({utilizadorAtual?.nome})
                </label>
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <SignatureCanvas
                    ref={assinaturaFuncionarioRef}
                    canvasProps={{ className: 'w-full h-40 bg-gray-50' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => limparAssinatura('funcionario')}
                  className="text-sm text-purple-600 hover:text-purple-700 mt-2"
                >
                  Limpar Assinatura
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assinatura do Cliente ({reserva?.utilizador.nome})
                </label>
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <SignatureCanvas
                    ref={assinaturaClienteRef}
                    canvasProps={{ className: 'w-full h-40 bg-gray-50' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => limparAssinatura('cliente')}
                  className="text-sm text-purple-600 hover:text-purple-700 mt-2"
                >
                  Limpar Assinatura
                </button>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-4">
            <Link
              to="/reservas"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Confirmar Devolução
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
