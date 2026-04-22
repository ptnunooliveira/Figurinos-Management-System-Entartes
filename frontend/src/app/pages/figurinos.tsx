import { useState } from "react";
import { Search, Filter, Shirt, MapPin, Tag, Plus, Trash2, Eye, Edit, Calendar, Euro, X, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { figurinos, categorias, utilizadorAtual, reservas, type Figurino } from "../lib/dados-mock";
import { toast } from "sonner";

export function Figurinos() {
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("todas");
  const [tipoSelecionado, setTipoSelecionado] = useState<string>("todos");
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>("todos");
  const [generoSelecionado, setGeneroSelecionado] = useState<string>("todos");
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>("todos");
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [figurinoSelecionado, setFigurinoSelecionado] = useState<Figurino | null>(null);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const handleRemoverFigurino = (id: number, nome: string) => {
    if (window.confirm(`Tem a certeza que deseja remover o figurino "${nome}"?`)) {
      toast.success(`Figurino "${nome}" removido com sucesso!`);
      // Aqui seria feita a lógica de remoção real
    }
  };

  const handleAbrirModalReserva = (figurino: Figurino) => {
    setFigurinoSelecionado(figurino);
    setDataInicio("");
    setDataFim("");
    setMostrarModalReserva(true);
  };

  const handleFecharModalReserva = () => {
    setMostrarModalReserva(false);
    setFigurinoSelecionado(null);
    setDataInicio("");
    setDataFim("");
  };

  // Verificar se um figurino está disponível num período
  const verificarDisponibilidade = (figurinoId: number, inicio: string, fim: string): boolean => {
    if (!inicio || !fim) return true;

    const dataInicioReserva = new Date(inicio);
    const dataFimReserva = new Date(fim);

    // Verificar todas as reservas existentes
    for (const reserva of reservas) {
      for (const linha of reserva.linhas) {
        // Se a linha é para o mesmo figurino
        if (linha.anuncio.figurino.id === figurinoId) {
          const dataInicioExistente = new Date(linha.data_inicio);
          const dataFimExistente = new Date(linha.data_fim);

          // Verificar se há sobreposição de datas
          const haConflito = 
            (dataInicioReserva <= dataFimExistente && dataFimReserva >= dataInicioExistente);

          if (haConflito) {
            return false;
          }
        }
      }
    }

    return true;
  };

  const calcularDias = (inicio: string, fim: string): number => {
    if (!inicio || !fim) return 0;
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos os dias
    return diffDays;
  };

  const handleConfirmarReserva = () => {
    if (!figurinoSelecionado || !dataInicio || !dataFim) {
      toast.error("Por favor, preencha todas as datas");
      return;
    }

    // Validar que data fim é posterior à data início
    if (new Date(dataFim) < new Date(dataInicio)) {
      toast.error("A data de fim deve ser posterior à data de início");
      return;
    }

    // Validar que as datas não são no passado
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (new Date(dataInicio) < hoje) {
      toast.error("A data de início não pode ser no passado");
      return;
    }

    // Verificar disponibilidade
    const disponivel = verificarDisponibilidade(figurinoSelecionado.id, dataInicio, dataFim);
    
    if (!disponivel) {
      toast.error("O figurino não está disponível para o período selecionado. Por favor, escolha outras datas.");
      return;
    }

    const dias = calcularDias(dataInicio, dataFim);
    const valorTotal = dias * figurinoSelecionado.valor_diario;

    toast.success(
      `Reserva confirmada! ${dias} dia${dias > 1 ? 's' : ''} - Total: €${valorTotal.toFixed(2)}`
    );
    handleFecharModalReserva();
  };

  const figurinosFiltrados = figurinos.filter((figurino) => {
    const correspondePesquisa = 
      figurino.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      figurino.descricao.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      figurino.categoria.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      figurino.tipo.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      figurino.tamanho.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      figurino.sexo.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      figurino.localizacao.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      figurino.estado.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
      figurino.acessorios.some(acc => acc.nome.toLowerCase().includes(termoPesquisa.toLowerCase()));
    const correspondeCategoria = categoriaSelecionada === "todas" || figurino.categoria === categoriaSelecionada;
    const correspondeTipo = tipoSelecionado === "todos" || figurino.tipo === tipoSelecionado;
    const correspondeTamanho = tamanhoSelecionado === "todos" || figurino.tamanho === tamanhoSelecionado;
    const correspondeGenero = generoSelecionado === "todos" || figurino.sexo === generoSelecionado;
    const correspondeEstado = estadoSelecionado === "todos" || figurino.estado === estadoSelecionado;
    
    return correspondePesquisa && correspondeCategoria && correspondeTipo && correspondeTamanho && correspondeGenero && correspondeEstado;
  });

  // Extrair valores únicos dos figurinos
  const categoriasUnicas = [...new Set(figurinos.map(f => f.categoria))].sort();
  const tiposUnicos = [...new Set(figurinos.map(f => f.tipo))].sort();
  const tamanhosUnicos = [...new Set(figurinos.map(f => f.tamanho))].sort();
  const generosUnicos = [...new Set(figurinos.map(f => f.sexo))].sort();
  const estadosUnicos = [...new Set(figurinos.map(f => f.estado))].sort();

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Figurinos</h1>
          <p className="text-gray-600">Explore a nossa coleção completa de figurinos disponíveis</p>
        </div>
        {utilizadorAtual.tipo === 'funcionario' && (
          <Link
            to="/figurinos/criar"
            className="flex items-center gap-2 bg-gradient-to-r from-fig-purple to-fig-magenta text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Criar Figurino
          </Link>
        )}
      </div>

      {/* Pesquisa e Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar figurinos..."
            value={termoPesquisa}
            onChange={(e) => setTermoPesquisa(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Categoria
            </label>
            <select
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todas">Todas as categorias</option>
              {categoriasUnicas.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={tipoSelecionado}
              onChange={(e) => setTipoSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos os tipos</option>
              {tiposUnicos.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
            <select
              value={tamanhoSelecionado}
              onChange={(e) => setTamanhoSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos os tamanhos</option>
              {tamanhosUnicos.map((tamanho) => (
                <option key={tamanho} value={tamanho}>{tamanho}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
            <select
              value={generoSelecionado}
              onChange={(e) => setGeneroSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              {generosUnicos.map((genero) => (
                <option key={genero} value={genero}>{genero}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={estadoSelecionado}
              onChange={(e) => setEstadoSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos os estados</option>
              {estadosUnicos.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contagem de Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {figurinosFiltrados.length} figurino{figurinosFiltrados.length !== 1 ? 's' : ''} encontrado{figurinosFiltrados.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Lista de Figurinos */}
      <div className="space-y-4">
        {figurinosFiltrados.map((figurino) => (
          <div
            key={figurino.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
              {/* Imagem/Ícone */}
              <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-fig-purple/10 via-fig-magenta/10 to-fig-green/10 flex items-center justify-center flex-shrink-0">
                <Shirt className="w-16 h-16 text-fig-purple/30" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 p-5 sm:py-5 sm:pr-5 sm:pl-0">
                <div className="flex flex-col h-full">
                  {/* Cabeçalho */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{figurino.nome}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{figurino.descricao}</p>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-fig-purple/10 text-fig-purple text-xs rounded-full font-medium">
                      {figurino.categoria}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                      {figurino.tamanho}
                    </span>
                  </div>

                  {/* Informação adicional */}
                  <div className="text-xs text-gray-500 mb-3">
                    Submetido em {new Date().toLocaleDateString('pt-PT')}
                  </div>

                  {/* Acessórios (se existirem) */}
                  {figurino.acessorios && figurino.acessorios.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Acessórios incluídos:</p>
                      <div className="flex flex-wrap gap-1">
                        {figurino.acessorios.slice(0, 3).map((acc) => (
                          <span key={acc.id} className="text-xs px-2 py-0.5 bg-fig-green/10 text-fig-green rounded">
                            {acc.nome}
                          </span>
                        ))}
                        {figurino.acessorios.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            +{figurino.acessorios.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="mt-auto pt-3 border-t">
                    {utilizadorAtual.tipo === 'funcionario' ? (
                      <div className="flex items-center justify-end gap-4 text-sm">
                        <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <button className="flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 transition-colors">
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button 
                          onClick={() => handleRemoverFigurino(figurino.id, figurino.nome)}
                          className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAbrirModalReserva(figurino)}
                        className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
                      >
                        Reservar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {figurinosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Shirt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum figurino encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou pesquisar por outros termos</p>
        </div>
      )}

      {/* Modal de Reserva */}
      {mostrarModalReserva && figurinoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reservar Figurino</h2>
                <button
                  onClick={handleFecharModalReserva}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Informação do Figurino */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-fig-purple/5 to-fig-magenta/5 rounded-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-fig-purple/10 via-fig-magenta/10 to-fig-green/10 flex items-center justify-center rounded-lg flex-shrink-0">
                  <Shirt className="w-10 h-10 text-fig-purple/40" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{figurinoSelecionado.nome}</h3>
                  <p className="text-sm text-gray-600 mb-2">{figurinoSelecionado.descricao}</p>
                  <div className="flex items-center gap-2 text-fig-purple">
                    <Euro className="w-5 h-5" />
                    <span className="font-bold text-xl">€{figurinoSelecionado.valor_diario.toFixed(2)}</span>
                    <span className="text-sm text-gray-500">/dia</span>
                  </div>
                </div>
              </div>

              {/* Seleção de Datas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-fig-purple" />
                  Período da Reserva
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Fim *
                    </label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      min={dataInicio || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Alerta de Indisponibilidade */}
                {dataInicio && dataFim && !verificarDisponibilidade(figurinoSelecionado.id, dataInicio, dataFim) && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 mb-1">Figurino Indisponível</p>
                      <p className="text-sm text-red-700">
                        Este figurino já está reservado para algumas das datas selecionadas. 
                        Por favor, escolha outro período.
                      </p>
                    </div>
                  </div>
                )}

                {/* Resumo do Cálculo */}
                {dataInicio && dataFim && new Date(dataFim) >= new Date(dataInicio) && (
                  <div className="p-4 bg-fig-green/5 border border-fig-green/20 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Número de dias:</span>
                      <span className="font-semibold text-gray-900">{calcularDias(dataInicio, dataFim)} dia{calcularDias(dataInicio, dataFim) > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Valor por dia:</span>
                      <span className="font-semibold text-gray-900">€{figurinoSelecionado.valor_diario.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-fig-green/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Valor Total:</span>
                        <span className="font-bold text-2xl text-fig-green">
                          €{(calcularDias(dataInicio, dataFim) * figurinoSelecionado.valor_diario).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleFecharModalReserva}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmarReserva}
                disabled={!dataInicio || !dataFim || !verificarDisponibilidade(figurinoSelecionado.id, dataInicio, dataFim)}
                className="px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}