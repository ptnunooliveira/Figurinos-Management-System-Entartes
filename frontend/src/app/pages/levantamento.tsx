import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft, CheckCircle } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { getUtilizadorAtual } from "../lib/auth";
import { getReservaDetalhes, getEstadosCondicao, criarChecklist } from "../lib/services";
import type { AuxiliarItem } from "../lib/services";
import type { Reserva } from "../lib/dados-mock";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function Levantamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assinaturaFuncionarioRef = useRef<SignatureCanvas>(null);
  const assinaturaClienteRef = useRef<SignatureCanvas>(null);
  const utilizadorAtual = getUtilizadorAtual();

  const { data: reserva = null, isFetching: carregando } = useQuery<Reserva | null>({
    queryKey: ["reservaDetalhes", id],
    queryFn: () => getReservaDetalhes(Number(id)),
    enabled: !!id,
  });
  const { data: estadosCondicao = [] } = useQuery<AuxiliarItem[]>({ queryKey: ["estadosCondicao"], queryFn: getEstadosCondicao });
  const [checklist, setChecklist] = useState<Array<{
    id: number; nome: string; observacoes: string; verificado: boolean;
  }>>([]);
  const [idEstadoFigurinoSel, setIdEstadoFigurinoSel] = useState<number | null>(null);
  const [observacoesGerais, setObservacoesGerais] = useState("");
  const [linhaSelecionadaId, setLinhaSelecionadaId] = useState<number | null>(null);

  const obterEstadoInicialFigurino = (estadoNome?: string, estadoId?: number | null) => {
    if (estadoId && estadosCondicao.some((estado) => estado.id === estadoId)) {
      return estadoId;
    }

    const estadoPorNome = estadosCondicao.find(
      (estado) => estado.nome.trim().toLowerCase() === (estadoNome ?? "").trim().toLowerCase()
    );

    return estadoPorNome?.id ?? estadosCondicao[0]?.id ?? null;
  };

  useEffect(() => {
    if (reserva && reserva.linhas.length > 0 && !linhaSelecionadaId) {
      const primeiraLinhaValida = reserva.linhas.find(l => l.estado?.toUpperCase() !== 'CANCELADA');
      if (primeiraLinhaValida) setLinhaSelecionadaId(primeiraLinhaValida.id);
    }
  }, [reserva]);

  // Atualiza os detalhes exibidos sempre que a linha selecionada muda
  useEffect(() => {
    if (!reserva || !linhaSelecionadaId) return;
    
    const linha = reserva.linhas.find(l => l.id === linhaSelecionadaId);
    if (!linha) return;

    const acessorios = linha.anuncio?.figurino?.acessorios ?? [];
    setChecklist(acessorios.map((acc) => ({
      id: acc.id,
      nome: acc.nome,
      observacoes: "",
      verificado: false,
    })));

    setIdEstadoFigurinoSel(
      obterEstadoInicialFigurino(linha.anuncio?.figurino?.estado, linha.anuncio?.figurino?.estado_id)
    );
    setObservacoesGerais("");
  }, [linhaSelecionadaId, reserva, estadosCondicao]);

  const linhaReserva = reserva?.linhas.find(l => l.id === linhaSelecionadaId);
  const figurino = linhaReserva?.anuncio.figurino;

  const toggleVerificado = (id: number) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, verificado: !item.verificado } : item
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

  const limparAssinatura = (tipo: 'funcionario' | 'cliente') => {
    if (tipo === 'funcionario') {
      assinaturaFuncionarioRef.current?.clear();
    } else {
      assinaturaClienteRef.current?.clear();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const acessoriosNaoSelecionados = checklist.filter(item => !item.verificado);
    if (acessoriosNaoSelecionados.length > 0) {
      const continuar = window.confirm(
        `Existem acessórios não selecionados: ${acessoriosNaoSelecionados.map(item => item.nome).join(", ")}.\n\n` +
        "Se continuar, estes acessórios ficam registados como não entregues no levantamento e não serão esperados na devolução. Pretende continuar?"
      );
      if (!continuar) return;
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
      const observacoesChecklist = JSON.stringify({
        observacoesGerais: observacoesGerais || "",
        acessoriosVerificados: checklist
          .filter(item => item.verificado)
          .map(item => ({
            id: item.id,
            nome: item.nome,
            observacoes: item.observacoes || "",
          })),
      });

      await criarChecklist(Number(id), {
        id_tipo_checklist: 1,
        assinaturaFuncionario,
        assinaturaEncarregado: assinaturaCliente,
        itens: [{
          id_linha_reserva: linhaReserva!.id,
          idfigurino: linhaReserva!.anuncio.figurino.id,
          id_estado: estadoId,
          observacoes: observacoesChecklist,
        }],
      });
      toast.success("Levantamento registado com sucesso!");
      setTimeout(() => navigate("/reservas"), 1500);
    } catch (err: any) {
      toast.error(err.message || "Erro ao registar levantamento");
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
        <h1 className="text-3xl font-bold text-gray-900">Checklist de Levantamento</h1>
        <p className="text-gray-600">Reserva #{id} - {reserva?.utilizador.nome}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seletor de Item da Reserva */}
        {reserva && reserva.linhas.filter(l => l.estado?.toUpperCase() !== 'CANCELADA').length > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecione o Item a Levantar</h2>
            <select
              value={linhaSelecionadaId ?? ""}
              onChange={(e) => setLinhaSelecionadaId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {reserva.linhas
                .filter(linha => linha.estado?.toUpperCase() !== 'CANCELADA')
                .map(linha => (
                  <option key={linha.id} value={linha.id}>
                    {linha.anuncio.figurino.nome} (De {new Date(linha.data_inicio).toLocaleDateString('pt-PT')} a {new Date(linha.data_fim).toLocaleDateString('pt-PT')}) - {linha.estado}
                  </option>
                ))}
            </select>
          </div>
        )}

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
            <div>
              <p className="text-sm text-gray-600">Localização</p>
              <p className="font-medium text-gray-900">{figurino.localizacao}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Período</p>
              <p className="font-medium text-gray-900">
                {linhaReserva && new Date(linhaReserva.data_inicio).toLocaleDateString('pt-PT')} - {linhaReserva && new Date(linhaReserva.data_fim).toLocaleDateString('pt-PT')}
              </p>
            </div>
          </div>
        </div>

        {/* Estado Inicial do Figurino */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado do Figurino</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Geral
              </label>
              <select
                value={idEstadoFigurinoSel ?? ""}
                onChange={(e) => setIdEstadoFigurinoSel(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {estadosCondicao.length === 0 && (
                  <option value="">Sem estados disponíveis</option>
                )}
                {estadosCondicao.map(estado => (
                  <option key={estado.id} value={estado.id}>{estado.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Gerais
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
              <div key={item.id} className="border rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
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

                {item.verificado && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={item.observacoes}
                      onChange={(e) => atualizarObservacoes(item.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Observações sobre este acessório (opcional)"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assinaturas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assinaturas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assinatura Funcionário */}
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

            {/* Assinatura Cliente */}
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
            Confirmar Levantamento
          </button>
        </div>
      </form>
    </div>
  );
}
