import { useState } from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Shirt, ClipboardCheck, PackageOpen, Search, Filter, Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { reservas, ocorrencias, utilizadorAtual } from "../lib/dados-mock";
import { calcularDias, formatarMoeda } from "../lib/utils";
import { toast } from "sonner";

export function Reservas() {
  const [abaAtiva, setAbaAtiva] = useState<"ativas" | "historico">("ativas");
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>("todos");

  const reservasAtivas = reservas.filter(r => 
    r.estado === "Aprovada" || r.estado === "Em curso"
  );
  
  const reservasHistorico = reservas.filter(r => 
    r.estado === "Devolvida" || r.estado === "Cancelada"
  );

  const reservasExibir = abaAtiva === "ativas" ? reservasAtivas : reservasHistorico;

  // Aplicar filtros de pesquisa
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

  const handleRemoverReserva = (id: number) => {
    if (window.confirm("Tem a certeza que deseja remover esta reserva?")) {
      toast.success("Reserva removida com sucesso!");
    }
  };

  const getCorEstado = (estado: string) => {
    switch (estado) {
      case "Aprovada":
      case "Confirmada":
        return "text-green-700 bg-green-100";
      case "Em curso":
        return "text-blue-700 bg-blue-100";
      case "Devolvida":
        return "text-gray-700 bg-gray-100";
      case "Cancelada":
        return "text-red-700 bg-red-100";
      case "Pendente":
        return "text-yellow-700 bg-yellow-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getIconeEstado = (estado: string) => {
    switch (estado) {
      case "Aprovada":
      case "Confirmada":
      case "Devolvida":
        return CheckCircle;
      case "Em curso":
        return Clock;
      case "Cancelada":
        return XCircle;
      case "Pendente":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {utilizadorAtual.tipo === 'funcionario' ? 'Gestão de Reservas' : 'Minhas Reservas'}
        </h1>
        <p className="text-gray-600">Gerencie as reservas de figurinos</p>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex gap-1">
        <button
          onClick={() => setAbaAtiva("ativas")}
          className={`px-6 py-2 rounded-lg transition-colors ${
            abaAtiva === "ativas"
              ? "bg-purple-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Ativas ({reservasAtivas.length})
        </button>
        <button
          onClick={() => setAbaAtiva("historico")}
          className={`px-6 py-2 rounded-lg transition-colors ${
            abaAtiva === "historico"
              ? "bg-purple-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Histórico ({reservasHistorico.length})
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Pesquisar por ID, cliente ou figurino..."
          />
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={estadoSelecionado}
              onChange={(e) => setEstadoSelecionado(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos os Estados</option>
              <option value="Aprovada">Aprovada</option>
              <option value="Em curso">Em curso</option>
              <option value="Devolvida">Devolvida</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>

          {/* Contagem de Resultados */}
          <p className="text-gray-600">
            {reservasFiltradas.length} reserva{reservasFiltradas.length !== 1 ? 's' : ''} encontrada{reservasFiltradas.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="space-y-4">
        {reservasFiltradas.length > 0 ? (
          reservasFiltradas.map((reserva) => (
            <div key={reserva.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Cabeçalho da Reserva */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">
                        Reserva #{reserva.id}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Data da reserva: {new Date(reserva.data_reserva).toLocaleDateString('pt-PT')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cliente: {reserva.utilizador.nome}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const IconeEstado = getIconeEstado(reserva.estado);
                      return <IconeEstado className="w-5 h-5" />;
                    })()}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCorEstado(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itens da Reserva */}
              <div className="p-6 space-y-4">
                {reserva.linhas.map((linha) => {
                  const ocorrencia = ocorrencias.find(o => o.linha_reserva_id === linha.id);
                  const dias = calcularDias(linha.data_inicio, linha.data_fim);
                  const valorTotal = linha.valor_diario * dias;

                  return (
                    <div key={linha.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shirt className="w-10 h-10 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {linha.anuncio.figurino.nome}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {linha.anuncio.figurino.descricao}
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {new Date(linha.data_inicio).toLocaleDateString('pt-PT')} - {new Date(linha.data_fim).toLocaleDateString('pt-PT')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{dias} dia{dias !== 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCorEstado(linha.estado)}`}>
                              {linha.estado}
                            </span>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">{formatarMoeda(linha.valor_diario)}/dia × {dias} dias</p>
                              <p className="font-semibold text-purple-600">Total: {formatarMoeda(valorTotal)}</p>
                            </div>
                          </div>

                          {ocorrencia && (
                            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-orange-900">Ocorrência</p>
                                  <p className="text-sm text-orange-700">{ocorrencia.descricao}</p>
                                  <p className="text-xs text-orange-600 mt-1">Estado: {ocorrencia.estado}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ações da Reserva */}
              {utilizadorAtual.tipo === 'funcionario' && abaAtiva === "ativas" && (
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 flex-wrap">
                  <Link
                    to={`/levantamento/${reserva.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Processar Levantamento
                  </Link>
                  <Link
                    to={`/devolucao/${reserva.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PackageOpen className="w-4 h-4" />
                    Processar Devolução
                  </Link>
                </div>
              )}
              {utilizadorAtual.tipo === 'funcionario' && (
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 flex-wrap">
                  <Link
                    to={`/reservas/editar/${reserva.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Reserva
                  </Link>
                  <button
                    onClick={() => handleRemoverReserva(reserva.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remover Reserva
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {abaAtiva === "ativas" ? "Nenhuma reserva ativa" : "Nenhuma reserva no histórico"}
            </h3>
            <p className="text-gray-600 mb-6">
              {abaAtiva === "ativas" 
                ? utilizadorAtual.tipo === 'funcionario' 
                  ? "Não há reservas ativas no momento."
                  : "Ainda não tem reservas ativas. Explore o catálogo!"
                : "Ainda não há histórico de reservas."}
            </p>
            {abaAtiva === "ativas" && utilizadorAtual.tipo !== 'funcionario' && (
              <Link
                to="/figurinos"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
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