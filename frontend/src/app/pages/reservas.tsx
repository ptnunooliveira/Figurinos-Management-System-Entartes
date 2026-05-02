import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Shirt, ClipboardCheck, PackageOpen, Search, Filter, Ban, CheckCheck } from "lucide-react";
import { Link } from "react-router";
import { getUtilizadorAtual } from "../lib/auth";
import { getReservas, getMinhasReservas, cancelarReserva, atualizarEstadoReserva, atualizarEstadoLinhaReserva } from "../lib/services";
import type { Reserva } from "../lib/dados-mock";
import { calcularDias, formatarMoeda } from "../lib/utils";
import { toast } from "sonner";

export function Reservas() {
  const utilizadorAtual = getUtilizadorAtual();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"ativas" | "historico">("ativas");
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>("todos");

  const carregarReservas = () => {
    const fn = utilizadorAtual?.tipo === 'funcionario' || utilizadorAtual?.perfil === 'ADMIN' ? getReservas : getMinhasReservas;
    fn().then(setReservas);
  };

  useEffect(() => {
    carregarReservas();
  }, [utilizadorAtual?.tipo]);

  const handleCancelarReserva = async (id: number) => {
    if (!window.confirm("Tem a certeza que deseja cancelar esta reserva?")) return;
    try {
      await cancelarReserva(id);
      toast.success("Reserva cancelada com sucesso!");
      carregarReservas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cancelar reserva");
    }
  };

  const handleAprovarLinha = async (idReserva: number, idLinha: number) => {
    try {
      await atualizarEstadoLinhaReserva(idReserva, idLinha, 2);
      toast.success("Linha aprovada com sucesso!");
      carregarReservas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao aprovar linha");
    }
  };

  const handleRecusarLinha = async (idReserva: number, idLinha: number) => {
    if (!window.confirm("Tem a certeza que deseja recusar esta linha?")) return;
    try {
      await atualizarEstadoLinhaReserva(idReserva, idLinha, 5);
      toast.success("Linha recusada com sucesso!");
      carregarReservas();
    } catch (err: any) {
      toast.error(err.message || "Erro ao recusar linha");
    }
  };

  const sortDesc = (arr: Reserva[]) =>
    [...arr].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

  const reservasAtivas = sortDesc(reservas.filter(r =>
    r.estado === "CONFIRMADA" || r.estado === "EM CURSO" ||
    r.estado === "PENDENTE"
  ));

  const reservasHistorico = sortDesc(reservas.filter(r =>
    r.estado === "CONCLUIDA" || r.estado === "CANCELADA" ||
    r.estado === "Devolvida" || r.estado === "Cancelada" || r.estado === "ATRASADA"
  ));

  const reservasExibir = abaAtiva === "ativas" ? reservasAtivas : reservasHistorico;

  const reservasFiltradas = reservasExibir.filter(reserva => {
    const matchTermo =
      (reserva.id?.toString() || '').includes(termoPesquisa) ||
      (reserva.utilizador?.nome || '').toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      (reserva.utilizador?.email || '').toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      (reserva.linhas || []).some(linha =>
        linha.anuncio?.figurino?.nome?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        linha.anuncio?.figurino?.categoria?.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        linha.anuncio?.figurino?.tamanho?.toLowerCase().includes(termoPesquisa.toLowerCase())
      );
    const matchEstado = estadoSelecionado === "todos" || reserva.estado === estadoSelecionado;
    return matchTermo && matchEstado;
  });

  const getCorEstado = (estado: string) => {
    const e = estado?.toUpperCase();
    if (e === "CONFIRMADA") return "text-green-700 bg-green-100";
    if (e === "EM CURSO") return "text-blue-700 bg-blue-100";
    if (e === "CONCLUIDA") return "text-gray-700 bg-gray-100";
    if (e === "CANCELADA") return "text-red-700 bg-red-100";
    if (e === "PENDENTE") return "text-yellow-700 bg-yellow-100";
    if (e === "ATRASADA") return "text-orange-700 bg-orange-100";
    return "text-gray-700 bg-gray-100";
  };

  const getIconeEstado = (estado: string) => {
    const e = estado?.toUpperCase();
    if (e === "CONFIRMADA" || e === "CONCLUIDA") return CheckCircle;
    if (e === "EM CURSO") return Clock;
    if (e === "CANCELADA") return XCircle;
    return AlertCircle;
  };

  return (
    <div className="space-y-3">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-0.5">
          {utilizadorAtual?.tipo === 'funcionario' || utilizadorAtual?.perfil === 'ADMIN' ? 'Gestão de Reservas' : 'Minhas Reservas'}
        </h1>
        <p className="text-gray-600 text-sm">Gerencie as reservas de figurinos</p>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex gap-1">
        <button
          onClick={() => setAbaAtiva("ativas")}
          className={`px-5 py-1.5 rounded-lg text-sm transition-colors ${
            abaAtiva === "ativas"
              ? "bg-purple-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Ativas ({reservasAtivas.length})
        </button>
        <button
          onClick={() => setAbaAtiva("historico")}
          className={`px-5 py-1.5 rounded-lg text-sm transition-colors ${
            abaAtiva === "historico"
              ? "bg-purple-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Histórico ({reservasHistorico.length})
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm px-4 py-3 space-y-2">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Pesquisar por ID, aluno ou figurino..."
          />
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={estadoSelecionado}
              onChange={(e) => setEstadoSelecionado(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos os Estados</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM CURSO">Em Curso</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
              <option value="ATRASADA">Atrasada</option>
            </select>
          </div>

          {/* Contagem de Resultados */}
          <p className="text-sm text-gray-600">
            {reservasFiltradas.length} reserva{reservasFiltradas.length !== 1 ? 's' : ''} encontrada{reservasFiltradas.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="space-y-2">
        {reservasFiltradas.length > 0 ? (
          reservasFiltradas.map((reserva) => {
            const eStaff = utilizadorAtual?.tipo === 'funcionario' || utilizadorAtual?.perfil === 'ADMIN';
            const eAtiva = abaAtiva === "ativas";
            const estadoRes = reserva.estado?.toUpperCase();

            return (
              <div key={reserva.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex">
                {/* Coluna esquerda — info da reserva */}
                <div className="w-36 flex-shrink-0 border-r bg-gradient-to-b from-purple-50 to-pink-50 p-3 flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm">#{reserva.id}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {reserva.data_reserva ? new Date(reserva.data_reserva).toLocaleDateString('pt-PT') : '—'}
                  </p>
                  <p className="text-xs text-gray-700 font-medium truncate" title={reserva.utilizador.nome}>
                    {reserva.utilizador.nome}
                  </p>
                  <div className="mt-auto pt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCorEstado(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </div>
                </div>

                {/* Coluna direita — linhas */}
                <div className="flex-1 min-w-0 divide-y">
                  {reserva.linhas.map((linha) => {
                    const dias = calcularDias(linha.data_inicio, linha.data_fim);
                    const valorTotal = (linha.valor_diario ?? 0) * dias;
                    const estadoLinha = linha.estado?.toUpperCase();

                    return (
                      <div key={linha.id} className="flex items-center gap-3 px-3 py-2">
                        {/* Imagem */}
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shirt className="w-6 h-6 text-purple-400" />
                        </div>

                        {/* Info figurino */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {linha.anuncio?.figurino?.nome || '—'}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {linha.data_inicio ? new Date(linha.data_inicio).toLocaleDateString('pt-PT') : '—'}
                              {' – '}
                              {linha.data_fim ? new Date(linha.data_fim).toLocaleDateString('pt-PT') : '—'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {dias} dia{dias !== 1 ? 's' : ''}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${getCorEstado(linha.estado)}`}>
                              {linha.estado}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatarMoeda(linha.valor_diario ?? 0)}/dia × {dias} dias
                            {' · '}
                            <span className="font-semibold text-purple-600">Total: {formatarMoeda(valorTotal)}</span>
                          </p>
                        </div>

                        {/* Botões à direita da linha */}
                        <div className="flex-shrink-0 flex flex-col gap-1 items-end">
                          {eStaff && eAtiva && estadoLinha === 'PENDENTE' && (
                            <>
                              <button
                                onClick={() => handleRecusarLinha(reserva.id, linha.id)}
                                className="flex items-center justify-center gap-1 w-24 py-1 text-xs rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap"
                              >
                                <Ban className="w-3 h-3" />
                                Recusar
                              </button>
                              <button
                                onClick={() => handleAprovarLinha(reserva.id, linha.id)}
                                className="flex items-center justify-center gap-1 w-24 py-1 text-xs rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors whitespace-nowrap"
                              >
                                <CheckCheck className="w-3 h-3" />
                                Aprovar
                              </button>
                            </>
                          )}
                          {eStaff && eAtiva && estadoRes === 'CONFIRMADA' && estadoLinha !== 'PENDENTE' && (
                            <>
                              <button
                                onClick={() => {
                                  if (window.confirm("O figurino não está conforme? Tem a certeza que deseja cancelar o pedido?")) {
                                    atualizarEstadoReserva(reserva.id, 5)
                                      .then(() => { toast.success("Reserva cancelada!"); carregarReservas(); })
                                      .catch((err) => toast.error(err.message));
                                  }
                                }}
                                className="flex items-center justify-center gap-1 w-24 py-1 text-xs rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap"
                                title="Cancelar caso artigo não conforme"
                              >
                                <Ban className="w-3 h-3" />
                                Cancelar
                              </button>
                              <Link
                                to={`/levantamento/${reserva.id}`}
                                className="flex items-center justify-center gap-1 w-24 py-1 text-xs rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors whitespace-nowrap"
                              >
                                <ClipboardCheck className="w-3 h-3" />
                                Levantamento
                              </Link>
                            </>
                          )}
                          {eStaff && eAtiva && estadoRes === 'EM CURSO' && (
                            <Link
                              to={`/devolucao/${reserva.id}`}
                              className="flex items-center justify-center gap-1 w-24 py-1 text-xs rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
                            >
                              <PackageOpen className="w-3 h-3" />
                              Devolução
                            </Link>
                          )}
                          {!eStaff && eAtiva && (estadoRes === 'CONFIRMADA' || estadoRes === 'PENDENTE') && (
                            <button
                              onClick={() => handleCancelarReserva(reserva.id)}
                              className="flex items-center justify-center gap-1 w-24 py-1 text-xs rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap"
                            >
                              <Ban className="w-3 h-3" />
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-1">
              {abaAtiva === "ativas" ? "Nenhuma reserva ativa" : "Nenhuma reserva no histórico"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {abaAtiva === "ativas"
                ? (utilizadorAtual?.tipo === 'funcionario' || utilizadorAtual?.perfil === 'ADMIN')
                  ? "Não há reservas ativas no momento."
                  : "Ainda não tem reservas ativas. Explore o catálogo!"
                : "Ainda não há histórico de reservas."}
            </p>
            {abaAtiva === "ativas" && utilizadorAtual?.tipo !== 'funcionario' && utilizadorAtual?.perfil !== 'ADMIN' && (
              <Link
                to="/figurinos"
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm transition-colors inline-block"
              >
                Explorar Figurinos
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
