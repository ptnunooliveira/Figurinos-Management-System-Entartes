import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, CheckCircle, AlertTriangle, Plus, X } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { getUtilizadorAtual } from "../lib/auth";
import { getReservaDetalhes, getEstadosCondicao, criarChecklist, criarOcorrencia, getChecklistsReserva } from "../lib/services";
import type { AuxiliarItem, ChecklistAPI } from "../lib/services";
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
  const [checklist, setChecklist] = useState<Array<{
    id: number; nome: string;
    observacoes: string; verificado: boolean; temProblema: boolean;
  }>>([]);
  const [idEstadoFigurinoSel, setIdEstadoFigurinoSel] = useState<number | null>(null);
  // id do estado registado na checklist de levantamento, para detetar agravamento
  const [idEstadoLevantamento, setIdEstadoLevantamento] = useState<number | null>(null);
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [ocorrencias, setOcorrencias] = useState<Array<{
    id: number;
    tipo: string;
    descricao: string;
    valorProposto: string;
  }>>([]);
  const [mostrarNovaOcorrencia, setMostrarNovaOcorrencia] = useState(false);
  const [novaOcorrencia, setNovaOcorrencia] = useState({
    tipo: "Dano",
    descricao: "",
    valorProposto: "",
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getReservaDetalhes(Number(id)),
      getEstadosCondicao(),
      getChecklistsReserva(Number(id)),
    ]).then(([r, estados, checklists]) => {
      if (r) {
        setReserva(r);
        const acessorios = r.linhas[0]?.anuncio?.figurino?.acessorios ?? [];
        setChecklist(acessorios.map((acc, idx) => ({
          id: idx + 1,
          nome: acc.nome,
          observacoes: "",
          verificado: false,
          temProblema: false,
        })));

        // Estado registado no levantamento (id_tipo_checklist === 1) para o figurino desta linha.
        // Serve para (a) iniciar o select com esse estado e (b) detetar agravamento.
        const idFigurino = r.linhas[0]?.anuncio?.figurino?.id;
        const checklistLevantamento = (checklists as ChecklistAPI[]).find(c => c.id_tipo_checklist === 1);
        const itemLevantamento = checklistLevantamento?.checklist_item.find(it => it.idfigurino === idFigurino);
        const idLev = itemLevantamento?.id_estado ?? null;
        setIdEstadoLevantamento(idLev);
        setIdEstadoFigurinoSel(idLev ?? estados[0]?.id ?? null);
      }
      setEstadosCondicao(estados);
      setCarregando(false);
    });
  }, [id]);

  const linhaReserva = reserva?.linhas[0];
  const figurino = linhaReserva?.anuncio.figurino;

  const toggleVerificado = (id: number) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, verificado: !item.verificado } : item
      )
    );
  };

  const toggleProblema = (id: number) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, temProblema: !item.temProblema } : item
      )
    );
  };

  const atualizarObservacoes = (id: number, observacoes: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, observacoes } : item
      )
    );
  };

  const adicionarOcorrencia = () => {
    if (!novaOcorrencia.descricao) {
      toast.error("Por favor, descreva a ocorrência");
      return;
    }

    const ocorrencia = {
      id: Date.now(),
      ...novaOcorrencia,
    };

    setOcorrencias(prev => [...prev, ocorrencia]);
    setNovaOcorrencia({ tipo: "Dano", descricao: "", valorProposto: "" });
    setMostrarNovaOcorrencia(false);
    toast.success("Ocorrência adicionada");
  };

  const removerOcorrencia = (id: number) => {
    setOcorrencias(prev => prev.filter(o => o.id !== id));
  };

  const limparAssinatura = (tipo: 'funcionario' | 'cliente') => {
    if (tipo === 'funcionario') {
      assinaturaFuncionarioRef.current?.clear();
    } else {
      assinaturaClienteRef.current?.clear();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const todosVerificados = checklist.every(item => item.verificado);
    if (!todosVerificados && checklist.length > 0) {
      toast.error("Por favor, verifique todos os itens da checklist");
      return;
    }

    if (assinaturaFuncionarioRef.current?.isEmpty() || assinaturaClienteRef.current?.isEmpty()) {
      toast.error("Por favor, recolha ambas as assinaturas");
      return;
    }

    if (!reserva) return;

    const assinaturaFuncionario = assinaturaFuncionarioRef.current?.toDataURL() ?? '';
    const assinaturaCliente = assinaturaClienteRef.current?.toDataURL() ?? '';
    const estadoId = idEstadoFigurinoSel ?? estadosCondicao[0]?.id;
    if (!estadoId) {
      toast.error("Selecione o estado do figurino");
      return;
    }

    try {
      await criarChecklist(Number(id), {
        id_tipo_checklist: 2,
        assinaturaFuncionario,
        assinaturaEncarregado: assinaturaCliente,
        itens: reserva.linhas.map(linha => ({
          id_linha_reserva: linha.id,
          idfigurino: linha.anuncio.figurino.id,
          id_estado: estadoId,
          observacoes: observacoesGerais || undefined,
        })),
      });

      for (const oc of ocorrencias) {
        const linhaId = reserva.linhas[0]?.id;
        if (!linhaId) continue;
        await criarOcorrencia({
          id_linha_reserva: linhaId,
          descricao: `${oc.tipo}: ${oc.descricao}`,
          valor: oc.valorProposto ? parseFloat(oc.valorProposto) : null,
        }).catch(() => {});
      }

      const problemasEncontrados = checklist.filter(item => item.temProblema).length + ocorrencias.length;
      if (problemasEncontrados > 0) {
        toast.success(`Devolução registada com ${problemasEncontrados} ocorrência${problemasEncontrados !== 1 ? 's' : ''}`);
      } else {
        toast.success("Devolução registada sem problemas!");
      }
      setTimeout(() => navigate("/reservas"), 1500);
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

  const problemasEncontrados = checklist.filter(item => item.temProblema).length + ocorrencias.length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <Link to="/reservas" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar às Reservas
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checklist de Devolução</h1>
        <p className="text-gray-600">Reserva #{id} - {reserva?.utilizador.nome}</p>
      </div>

      {/* Alerta de Problemas */}
      {problemasEncontrados > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <p className="text-sm font-medium text-orange-900">
              {problemasEncontrados} problema{problemasEncontrados !== 1 ? 's' : ''} identificado{problemasEncontrados !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

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
              <p className="font-medium text-gray-900">{figurino.tamanho}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Descrição</p>
              <p className="font-medium text-gray-900">{figurino.descricao}</p>
            </div>
          </div>
        </div>

        {/* Estado do Figurino */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado do Figurino na Devolução</h2>

          <div className="space-y-4">
            {idEstadoLevantamento != null && (
              <p className="text-sm text-gray-600">
                Estado registado no levantamento:{" "}
                <span className="font-medium text-gray-900">
                  {estadosCondicao.find(e => e.id === idEstadoLevantamento)?.nome ?? "—"}
                </span>
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Geral
              </label>
              <select
                value={idEstadoFigurinoSel ?? ""}
                onChange={(e) => setIdEstadoFigurinoSel(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {estadosCondicao.map(estado => (
                  <option key={estado.id} value={estado.id}>{estado.nome}</option>
                ))}
              </select>
            </div>

            {/* Aviso: estado selecionado pior do que o do levantamento → vai gerar ocorrência */}
            {idEstadoFigurinoSel != null && idEstadoLevantamento != null &&
              idEstadoFigurinoSel > idEstadoLevantamento && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <p className="text-sm text-orange-900">
                    O estado selecionado é pior do que o registado no levantamento.
                    Ao gravar, será criada automaticamente uma <strong>ocorrência</strong> para
                    análise.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={observacoesGerais}
                onChange={(e) => setObservacoesGerais(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Anote quaisquer observações sobre o estado do figurino..."
              />
            </div>
          </div>
        </div>

        {/* Checklist de Acessórios */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Checklist de Acessórios ({checklist.filter(i => i.verificado).length}/{checklist.length})
          </h2>

          <div className="space-y-4">
            {checklist.map(item => (
              <div
                key={item.id}
                className={`border rounded-lg p-4 ${
                  item.temProblema ? 'border-orange-300 bg-orange-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.verificado}
                      onChange={() => toggleVerificado(item.id)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.nome}</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.temProblema}
                      onChange={() => toggleProblema(item.id)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    Marcar como problema
                  </label>
                </div>

                {item.verificado && item.temProblema && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-orange-700 mb-1">
                      Descreva o problema *
                    </label>
                    <input
                      type="text"
                      value={item.observacoes}
                      onChange={(e) => atualizarObservacoes(item.id, e.target.value)}
                      className="w-full px-3 py-2 border border-orange-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: Botão em falta, rasgão na lateral..."
                      required
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ocorrências */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Ocorrências {ocorrencias.length > 0 && `(${ocorrencias.length})`}
            </h2>
            <button
              type="button"
              onClick={() => setMostrarNovaOcorrencia(!mostrarNovaOcorrencia)}
              className="flex items-center gap-2 text-sm bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Ocorrência
            </button>
          </div>

          {mostrarNovaOcorrencia && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Ocorrência
                </label>
                <select
                  value={novaOcorrencia.tipo}
                  onChange={(e) => setNovaOcorrencia({...novaOcorrencia, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Dano">Dano</option>
                  <option value="Perda">Perda</option>
                  <option value="Mancha">Mancha</option>
                  <option value="Rasgão">Rasgão</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  value={novaOcorrencia.descricao}
                  onChange={(e) => setNovaOcorrencia({...novaOcorrencia, descricao: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Descreva detalhadamente o problema..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Proposto para Cobrança (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={novaOcorrencia.valorProposto}
                  onChange={(e) => setNovaOcorrencia({...novaOcorrencia, valorProposto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: 15.00"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={adicionarOcorrencia}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Adicionar Ocorrência
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarNovaOcorrencia(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {ocorrencias.length > 0 && (
            <div className="space-y-3">
              {ocorrencias.map(ocorrencia => (
                <div key={ocorrencia.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-gray-900">{ocorrencia.tipo}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{ocorrencia.descricao}</p>
                      {ocorrencia.valorProposto && (
                        <p className="text-sm text-orange-700">
                          Valor proposto: €{parseFloat(ocorrencia.valorProposto).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removerOcorrencia(ocorrencia.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {ocorrencias.length === 0 && !mostrarNovaOcorrencia && (
            <p className="text-center py-6 text-gray-500 text-sm">
              Nenhuma ocorrência registada
            </p>
          )}
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
                  canvasProps={{
                    className: 'w-full h-40 bg-gray-50',
                  }}
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
                  canvasProps={{
                    className: 'w-full h-40 bg-gray-50',
                  }}
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

        {/* Botões de Ação */}
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
    </div>
  );
}
