import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { getUtilizadorAtual } from "../lib/auth";
import { getReservaDetalhes, getEstadosCondicao, criarChecklist, getChecklistsReserva, criarOcorrencia } from "../lib/services";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
function Devolucao() {
  const { id, linhaId } = useParams();
  const navigate = useNavigate();
  const assinaturaFuncionarioRef = useRef(null);
  const assinaturaClienteRef = useRef(null);
  const utilizadorAtual = getUtilizadorAtual();
  const { data: reserva = null, isFetching: carregando } = useQuery({
    queryKey: ["reservaDetalhes", id],
    queryFn: () => getReservaDetalhes(Number(id)),
    enabled: !!id
  });
  const { data: estadosCondicao = [] } = useQuery({ queryKey: ["estadosCondicao"], queryFn: getEstadosCondicao });
  const { data: checklistsData = [] } = useQuery({
    queryKey: ["checklistsReserva", id],
    queryFn: () => getChecklistsReserva(Number(id)),
    enabled: !!id
  });
  const [checklist, setChecklist] = useState([]);
  const [idEstadoFigurinoSel, setIdEstadoFigurinoSel] = useState(null);
  const [idEstadoLevantamento, setIdEstadoLevantamento] = useState(null);
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [ocorrenciaAlerta, setOcorrenciaAlerta] = useState(null);
  const linhaSelecionadaId = linhaId ? Number(linhaId) : null;
  useEffect(() => {
    if (!reserva || !linhaSelecionadaId) return;
    const linha = reserva.linhas.find((l) => l.id === linhaSelecionadaId);
    if (!linha) return;
    const acessorios = linha.anuncio?.figurino?.acessorios ?? [];
    setChecklist(acessorios.map((acc, idx) => ({
      id: idx + 1,
      nome: acc.nome,
      verificado: false,
      temProblema: false
    })));
    const idFigurino = linha.anuncio?.figurino?.id;
    const checklistLevantamento = checklistsData.find((c) => c.id_tipo_checklist === 1);
    const itemLevantamento = checklistLevantamento?.checklist_item.find((it) => it.idfigurino === idFigurino);
    const idLev = itemLevantamento?.id_estado ?? null;
    setIdEstadoLevantamento(idLev);
    setIdEstadoFigurinoSel(idLev ?? estadosCondicao[0]?.id ?? null);
    setObservacoesGerais("");
    setOcorrenciaAlerta(null);
  }, [linhaSelecionadaId, reserva, checklistsData, estadosCondicao]);
  const linhaReserva = reserva?.linhas.find((l) => l.id === linhaSelecionadaId);
  const figurino = linhaReserva?.anuncio.figurino;
  const estadoInicialNome = idEstadoLevantamento ? estadosCondicao.find((e) => e.id === idEstadoLevantamento)?.nome ?? figurino?.estado ?? "-" : figurino?.estado ?? "-";
  const toggleVerificado = (idItem) => {
    setChecklist(
      (prev) => prev.map(
        (item) => item.id === idItem ? { ...item, verificado: !item.verificado } : item
      )
    );
  };
  const toggleProblema = (idItem) => {
    setChecklist(
      (prev) => prev.map(
        (item) => item.id === idItem ? { ...item, temProblema: !item.temProblema } : item
      )
    );
  };
  const limparAssinatura = (tipo) => {
    if (tipo === "funcionario") assinaturaFuncionarioRef.current?.clear();
    else assinaturaClienteRef.current?.clear();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reserva || !id) return;
    const estadoId = idEstadoFigurinoSel ?? estadosCondicao[0]?.id;
    if (!estadoId) {
      toast.error("Por favor, selecione o estado do figurino na devolucao");
      return;
    }
    if (assinaturaFuncionarioRef.current?.isEmpty() || assinaturaClienteRef.current?.isEmpty()) {
      toast.error("Por favor, recolha ambas as assinaturas");
      return;
    }
    const assinaturaFuncionario = assinaturaFuncionarioRef.current?.toDataURL() ?? "";
    const assinaturaCliente = assinaturaClienteRef.current?.toDataURL() ?? "";
    try {
      const result = await criarChecklist(Number(id), {
        id_tipo_checklist: 2,
        assinaturaFuncionario,
        assinaturaEncarregado: assinaturaCliente,
        itens: [{
          id_linha_reserva: linhaReserva.id,
          idfigurino: linhaReserva.anuncio.figurino.id,
          id_estado: estadoId,
          observacoes: observacoesGerais || void 0
        }]
      });
      let ocorrenciaGerada = Array.isArray(result?.ocorrencias) ? result.ocorrencias[0] : null;
      const problemasAcessorios = checklist.filter((i) => i.temProblema);
      if (!ocorrenciaGerada && problemasAcessorios.length > 0) {
        const desc = "Problema com acess\xF3rios: " + problemasAcessorios.map((p) => p.nome).join(", ");
        ocorrenciaGerada = await criarOcorrencia({
          id_linha_reserva: linhaReserva.id,
          descricao: desc
        });
      }
      if (ocorrenciaGerada) {
        setOcorrenciaAlerta({ id: ocorrenciaGerada.id });
        toast.success("Devolu\xE7\xE3o registada com ocorr\xEAncia associada.");
      } else {
        toast.success("Devolu\xE7\xE3o registada com sucesso.");
        setTimeout(() => navigate("/reservas"), 1500);
      }
    } catch (err) {
      toast.error(err.message || "Erro ao registar devolucao");
    }
  };
  if (carregando) {
    return <div className="text-center py-12">
        <p className="text-gray-600">A carregar reserva...</p>
      </div>;
  }
  if (!figurino) {
    return <div className="text-center py-12">
        <p className="text-gray-600">Reserva nao encontrada</p>
        <Link to="/reservas" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
          Voltar as reservas
        </Link>
      </div>;
  }
  return <div className="space-y-6">
      <div>
        <Link to="/reservas" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar as Reservas
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checklist de Devolucao</h1>
        <p className="text-gray-600">Reserva #{id} - {reserva?.utilizador.nome}</p>
      </div>

      {ocorrenciaAlerta && <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-900">
                Estado do figurino inferior ao estado inicial
              </p>
              <p className="text-sm text-orange-800 mt-1">
                Ocorrencia <strong>#{ocorrenciaAlerta.id}</strong> gerada automaticamente.
              </p>
              <button
    onClick={() => navigate("/reservas")}
    className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm transition-colors"
  >
                Voltar as Reservas
              </button>
            </div>
          </div>
        </div>}

      {!ocorrenciaAlerta && <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informacao do Figurino</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium text-gray-900">{figurino.nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tamanho</p>
                <p className="font-medium text-gray-900">{figurino.tamanho || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Descricao</p>
                <p className="font-medium text-gray-900">{figurino.descricao || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado do Figurino</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Estado Inicial</p>
                <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-medium">
                  {estadoInicialNome}
                </div>
                <p className="text-xs text-gray-500 mt-1">Estado registado no levantamento/base de dados</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado Geral
                </label>
                <select
    value={idEstadoFigurinoSel ?? ""}
    onChange={(e) => setIdEstadoFigurinoSel(Number(e.target.value))}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
                  {estadosCondicao.map((estado) => <option key={estado.id} value={estado.id}>{estado.nome}</option>)}
                </select>
              </div>
            </div>

            {idEstadoFigurinoSel != null && idEstadoLevantamento != null && idEstadoFigurinoSel > idEstadoLevantamento && <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mt-6">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <p className="text-sm text-orange-900">
                      O estado selecionado e pior do que o registado no levantamento.
                      Ao gravar, sera criada automaticamente uma <strong>ocorrencia</strong> para analise.
                    </p>
                  </div>
                </div>}

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observacoes
              </label>
              <textarea
    value={observacoesGerais}
    onChange={(e) => setObservacoesGerais(e.target.value)}
    rows={3}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    placeholder="Anote quaisquer observacoes sobre o estado do figurino..."
  />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Checklist de Acessorios ({checklist.filter((i) => i.verificado).length}/{checklist.length})
            </h2>

            <div className="space-y-4">
              {checklist.map((item) => <div
    key={item.id}
    className={`border rounded-lg p-4 ${item.temProblema ? "border-orange-300 bg-orange-50" : ""}`}
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
                </div>)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assinaturas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assinatura do Funcionario ({utilizadorAtual?.nome})
                </label>
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <SignatureCanvas
    ref={assinaturaFuncionarioRef}
    canvasProps={{ className: "w-full h-40 bg-gray-50" }}
  />
                </div>
                <button
    type="button"
    onClick={() => limparAssinatura("funcionario")}
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
    canvasProps={{ className: "w-full h-40 bg-gray-50" }}
  />
                </div>
                <button
    type="button"
    onClick={() => limparAssinatura("cliente")}
    className="text-sm text-purple-600 hover:text-purple-700 mt-2"
  >
                  Limpar Assinatura
                </button>
              </div>
            </div>
          </div>

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
              Confirmar Devolucao
            </button>
          </div>
        </form>}
    </div>;
}
export {
  Devolucao
};
