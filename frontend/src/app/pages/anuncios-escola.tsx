import { useState, useEffect } from "react";
import { PlusCircle, Search, Filter, Shirt, Euro, Eye, Edit, Trash2, Calendar, X } from "lucide-react";
import { getUtilizadorAtual } from "../lib/auth";
import { getAnunciosEscola, getFigurinosRaw, criarAnuncioEscola, atualizarAnuncioEscola, eliminarAnuncioEscola, criarReserva, getUtilizadores, type AnuncioEscolaAPI, type FigurinoAPI } from "../lib/services";
import { toast } from "sonner";

export function AnunciosEscola() {
  const utilizadorAtual = getUtilizadorAtual();
  const [anunciosEscola, setAnunciosEscola] = useState<AnuncioEscolaAPI[]>([]);
  const [figurinos, setFigurinos] = useState<FigurinoAPI[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("todas");
  const [tipoSelecionado, setTipoSelecionado] = useState<string>("todos");
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>("todos");
  const [generoSelecionado, setGeneroSelecionado] = useState<string>("todos");
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>("todos");
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const [figurinoSelecionado, setFigurinoSelecionado] = useState("");
  const [valorDiario, setValorDiario] = useState("");
  const [editarAnuncio, setEditarAnuncio] = useState<AnuncioEscolaAPI | null>(null);
  const [valorDiarioEditar, setValorDiarioEditar] = useState("");
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [anuncioReserva, setAnuncioReserva] = useState<AnuncioEscolaAPI | null>(null);
  const [dataInicioReserva, setDataInicioReserva] = useState("");
  const [dataFimReserva, setDataFimReserva] = useState("");
  const [alunoReserva, setAlunoReserva] = useState("");
  const [utilizadores, setUtilizadores] = useState<any[]>([]);

  useEffect(() => {
    getAnunciosEscola().then(setAnunciosEscola);
    getFigurinosRaw().then(setFigurinos);
    if (utilizadorAtual?.tipo === 'funcionario') {
      getUtilizadores().then(setUtilizadores);
    }
  }, []);

  const anunciosFiltrados = anunciosEscola.filter((anuncio) => {
    const fig = anuncio.figurino;
    const descricao = fig?.descricao ?? '';
    const categoria = fig?.categoria?.nomecategoria ?? '';
    const tipo = fig?.tipo_figurino?.nome ?? '';
    const tamanho = fig?.tamanho ?? '';
    const sexo = fig?.sexo?.nome ?? '';
    const estado = anuncio.estado_anuncio?.nome ?? '';
    const acessorios = fig?.figurino_acessorio?.map((fa) => fa.acessorio.nome) ?? [];

    const correspondePesquisa =
      descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tamanho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acessorios.some((nome) => nome.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      correspondePesquisa &&
      (categoriaSelecionada === "todas" || categoria === categoriaSelecionada) &&
      (tipoSelecionado === "todos" || tipo === tipoSelecionado) &&
      (tamanhoSelecionado === "todos" || tamanho === tamanhoSelecionado) &&
      (generoSelecionado === "todos" || sexo === generoSelecionado) &&
      (estadoSelecionado === "todos" || estado === estadoSelecionado)
    );
  });

  const categoriasUnicas = [...new Set(anunciosEscola.map((a) => a.figurino?.categoria?.nomecategoria ?? '').filter(Boolean))].sort();
  const tiposUnicos = [...new Set(anunciosEscola.map((a) => a.figurino?.tipo_figurino?.nome ?? '').filter(Boolean))].sort();
  const tamanhosUnicos = [...new Set(anunciosEscola.map((a) => a.figurino?.tamanho ?? '').filter(Boolean))].sort();
  const generosUnicos = [...new Set(anunciosEscola.map((a) => a.figurino?.sexo?.nome ?? '').filter(Boolean))].sort();
  const estadosUnicos = [...new Set(anunciosEscola.map((a) => a.estado_anuncio?.nome ?? '').filter(Boolean))].sort();

  const handleCriarAnuncio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!figurinoSelecionado || !valorDiario) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    const valorNumerico = parseFloat(valorDiario);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      toast.error("Por favor, insira um valor válido");
      return;
    }
    try {
      await criarAnuncioEscola({ id_figurino: parseInt(figurinoSelecionado), valordiarioaluguer: valorNumerico });
      toast.success("Anúncio criado com sucesso!");
      setMostrarDialogo(false);
      setFigurinoSelecionado("");
      setValorDiario("");
      getAnunciosEscola().then(setAnunciosEscola);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar anúncio");
    }
  };

  const handleRemoverAnuncio = async (id: number, descricao: string) => {
    if (!window.confirm(`Tem a certeza que deseja remover o anúncio "${descricao}"?`)) return;
    try {
      await eliminarAnuncioEscola(id);
      toast.success(`Anúncio "${descricao}" removido com sucesso!`);
      setAnunciosEscola(prev => prev.filter(a => a.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover anúncio");
    }
  };

  const handleEditarAnuncio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editarAnuncio) return;
    const valor = parseFloat(valorDiarioEditar);
    if (isNaN(valor) || valor <= 0) {
      toast.error("Insira um valor válido");
      return;
    }
    try {
      await atualizarAnuncioEscola(editarAnuncio.id, { valordiarioaluguer: valor });
      toast.success("Anúncio atualizado com sucesso!");
      setEditarAnuncio(null);
      setValorDiarioEditar("");
      getAnunciosEscola().then(setAnunciosEscola);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar anúncio");
    }
  };

  const handleAbrirReserva = (anuncio: AnuncioEscolaAPI) => {
    setAnuncioReserva(anuncio);
    setDataInicioReserva("");
    setDataFimReserva("");
    setAlunoReserva("");
    setMostrarModalReserva(true);
  };

  const handleFecharReserva = () => {
    setMostrarModalReserva(false);
    setAnuncioReserva(null);
    setDataInicioReserva("");
    setDataFimReserva("");
    setAlunoReserva("");
  };

  const handleConfirmarReserva = async () => {
    if (!anuncioReserva || !dataInicioReserva || !dataFimReserva) {
      toast.error("Por favor, preencha todas as datas");
      return;
    }
    if (!alunoReserva) {
      toast.error("Por favor, selecione um aluno");
      return;
    }
    if (new Date(dataFimReserva) < new Date(dataInicioReserva)) {
      toast.error("A data de fim deve ser posterior à data de início");
      return;
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    if (new Date(dataInicioReserva) < hoje) {
      toast.error("A data de início não pode ser no passado");
      return;
    }
    try {
      await criarReserva(
        [{ id_anuncio: anuncioReserva.id, datainicio: dataInicioReserva, datafim: dataFimReserva }],
        parseInt(alunoReserva)
      );
      toast.success("Reserva criada com sucesso!");
      handleFecharReserva();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar reserva");
    }
  };

  const figurinoObj = figurinos.find((f) => f.id === parseInt(figurinoSelecionado));

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anúncios da Escola</h1>
          <p className="text-gray-600 mt-1">Gerir anúncios de aluguer de figurinos da escola</p>
        </div>
        {utilizadorAtual?.tipo === 'funcionario' && (
          <button
            onClick={() => setMostrarDialogo(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-fig-purple to-fig-magenta text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            Criar Anúncio
          </button>
        )}
      </div>

      {/* Pesquisa e Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar anúncios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

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

      {/* Lista de Anúncios */}
      <div className="space-y-4">
        {anunciosFiltrados.map((anuncio) => (
          <div key={anuncio.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
              <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-fig-purple/10 via-fig-magenta/10 to-fig-green/10 flex items-center justify-center flex-shrink-0">
                <Shirt className="w-16 h-16 text-fig-purple/30" />
              </div>

              <div className="flex-1 p-5 sm:py-5 sm:pr-5 sm:pl-0">
                <div className="flex flex-col h-full">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {anuncio.figurino?.descricao ?? '—'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {anuncio.figurino?.localizacao ?? ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {anuncio.figurino?.categoria && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-fig-purple/10 text-fig-purple text-xs rounded-full font-medium">
                        {anuncio.figurino.categoria.nomecategoria}
                      </span>
                    )}
                    {anuncio.figurino?.tamanho && (
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                        {anuncio.figurino.tamanho}
                      </span>
                    )}
                    {anuncio.estado_anuncio && (
                      <span className={`inline-flex items-center px-3 py-1 text-xs rounded-full font-medium ${
                        anuncio.estado_anuncio.nome === "Disponível"
                          ? "bg-fig-green/10 text-fig-green"
                          : "bg-fig-magenta/10 text-fig-magenta"
                      }`}>
                        {anuncio.estado_anuncio.nome}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-fig-purple mb-3">
                    <Euro className="w-4 h-4" />
                    <span className="font-bold text-lg">€{(anuncio.valordiarioaluguer ?? 0).toFixed(2)}</span>
                    <span className="text-sm text-gray-500">/dia</span>
                  </div>

                  {anuncio.figurino?.figurino_acessorio && anuncio.figurino.figurino_acessorio.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Acessórios incluídos:</p>
                      <div className="flex flex-wrap gap-1">
                        {anuncio.figurino.figurino_acessorio.slice(0, 3).map((fa) => (
                          <span key={fa.id_acessorio} className="px-2 py-1 bg-fig-green/10 text-fig-green text-xs rounded">
                            {fa.acessorio.nome}
                          </span>
                        ))}
                        {anuncio.figurino.figurino_acessorio.length > 3 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            +{anuncio.figurino.figurino_acessorio.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t">
                    {utilizadorAtual?.tipo === 'funcionario' ? (
                      <div className="flex items-center justify-end gap-4 text-sm flex-wrap">
                        <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <button
                          className="flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 transition-colors"
                          onClick={() => { setEditarAnuncio(anuncio); setValorDiarioEditar(String(anuncio.valordiarioaluguer ?? '')); }}
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors"
                          onClick={() => handleRemoverAnuncio(anuncio.id, anuncio.figurino?.descricao ?? '')}
                        >
                          <Trash2 className="w-4 h-4" />
                          Remover
                        </button>
                        <button
                          onClick={() => handleAbrirReserva(anuncio)}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-1.5 px-4 rounded-lg transition-all"
                        >
                          Reservar
                        </button>
                      </div>
                    ) : (
                      <button className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all">
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

      {anunciosFiltrados.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <Shirt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Nenhum anúncio encontrado</p>
        </div>
      )}

      {/* Diálogo Editar Anúncio */}
      {editarAnuncio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Editar Anúncio</h2>
              <p className="text-sm text-gray-600 mt-1">{editarAnuncio.figurino?.descricao ?? `Anúncio #${editarAnuncio.id}`}</p>
            </div>
            <form onSubmit={handleEditarAnuncio} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Diário de Aluguer (€) *</label>
                <div className="relative">
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorDiarioEditar}
                    onChange={(e) => setValorDiarioEditar(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setEditarAnuncio(null); setValorDiarioEditar(""); }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo Criar Anúncio */}
      {mostrarDialogo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Criar Novo Anúncio</h2>
              <p className="text-sm text-gray-600 mt-1">Selecione o figurino e defina o valor de aluguer</p>
            </div>

            <form onSubmit={handleCriarAnuncio} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Figurino *</label>
                <select
                  value={figurinoSelecionado}
                  onChange={(e) => setFigurinoSelecionado(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                  required
                >
                  <option value="">Selecione um figurino</option>
                  {figurinos.map((fig) => (
                    <option key={fig.id} value={fig.id}>
                      {fig.descricao ?? `Figurino #${fig.id}`} — {fig.categoria?.nomecategoria ?? ''} (Tamanho: {fig.tamanho ?? '—'})
                    </option>
                  ))}
                </select>
              </div>

              {figurinoObj && (
                <div className="bg-fig-purple/5 rounded-lg p-4 border-2 border-fig-purple/20">
                  <p className="font-medium text-gray-900 mb-2">{figurinoObj.descricao ?? '—'}</p>
                  {figurinoObj.figurino_acessorio.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Acessórios incluídos ({figurinoObj.figurino_acessorio.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {figurinoObj.figurino_acessorio.map((fa) => (
                          <span key={fa.id_acessorio} className="px-3 py-1 bg-fig-green text-white text-xs rounded-full">
                            {fa.acessorio.nome}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Diário de Aluguer (€) *
                </label>
                <div className="relative">
                  <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorDiario}
                    onChange={(e) => setValorDiario(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Valor cobrado por cada dia de aluguer</p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setMostrarDialogo(false); setFigurinoSelecionado(""); setValorDiario(""); }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Criar Anúncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reservar */}
      {mostrarModalReserva && anuncioReserva && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reservar Figurino</h2>
                <button onClick={handleFecharReserva} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-fig-purple/5 to-fig-magenta/5 rounded-lg">
                <div className="w-20 h-20 bg-gradient-to-br from-fig-purple/10 via-fig-magenta/10 to-fig-green/10 flex items-center justify-center rounded-lg flex-shrink-0">
                  <Shirt className="w-10 h-10 text-fig-purple/40" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{anuncioReserva.figurino?.descricao ?? '—'}</h3>
                  <p className="text-sm text-gray-600">€ {(anuncioReserva.valordiarioaluguer ?? 0).toFixed(2)} /dia</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Aluno *</label>
                <select
                  value={alunoReserva}
                  onChange={(e) => setAlunoReserva(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um aluno</option>
                  {utilizadores.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-fig-purple" />
                  Período da Reserva
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início *</label>
                    <input
                      type="date"
                      value={dataInicioReserva}
                      onChange={(e) => setDataInicioReserva(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim *</label>
                    <input
                      type="date"
                      value={dataFimReserva}
                      onChange={(e) => setDataFimReserva(e.target.value)}
                      min={dataInicioReserva || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleFecharReserva}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarReserva}
                disabled={!dataInicioReserva || !dataFimReserva || !alunoReserva}
                className="px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submeter Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
