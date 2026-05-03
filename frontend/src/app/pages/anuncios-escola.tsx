import { useState } from "react";
import { PlusCircle, Search, Filter, Shirt, Euro, Edit, Trash2, Calendar, X } from "lucide-react";
import { useNavigate } from "react-router";
import { getUtilizadorAtual } from "../lib/auth";
import { getAnunciosEscola, getFigurinosRaw, criarAnuncioEscola, atualizarAnuncioEscola, eliminarAnuncioEscola, getCategorias, getTiposFigurino, getSexos, type AnuncioEscolaAPI, type FigurinoAPI, type AuxiliarItem } from "../lib/services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCart } from "./CartContext";
import { toast } from "sonner";

export function AnunciosEscola() {
  const utilizadorAtual = getUtilizadorAtual();
  const isStaff = utilizadorAtual?.tipo === 'funcionario' || utilizadorAtual?.tipo === 'admin';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: anunciosEscola = [] } = useQuery<AnuncioEscolaAPI[]>({ queryKey: ["anunciosEscola"], queryFn: getAnunciosEscola });
  const { data: figurinos = [] } = useQuery<FigurinoAPI[]>({
    queryKey: ["figurinos"],
    queryFn: getFigurinosRaw,
    enabled: isStaff,
  });
  const { data: categorias = [] } = useQuery<AuxiliarItem[]>({ queryKey: ["categorias"], queryFn: getCategorias });
  const { data: tiposFigurino = [] } = useQuery<AuxiliarItem[]>({ queryKey: ["tiposFigurino"], queryFn: getTiposFigurino });
  const { data: sexos = [] } = useQuery<AuxiliarItem[]>({ queryKey: ["sexos"], queryFn: getSexos });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");
  const [tipoSelecionado, setTipoSelecionado] = useState<string>("");
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>("");
  const [generoSelecionado, setGeneroSelecionado] = useState<string>("");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const [figurinoSelecionado, setFigurinoSelecionado] = useState("");
  const [valorDiario, setValorDiario] = useState("");
  const [editarAnuncio, setEditarAnuncio] = useState<AnuncioEscolaAPI | null>(null);
  const [valorDiarioEditar, setValorDiarioEditar] = useState("");
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [anuncioReserva, setAnuncioReserva] = useState<AnuncioEscolaAPI | null>(null);
  const [dataInicioReserva, setDataInicioReserva] = useState("");
  const [dataFimReserva, setDataFimReserva] = useState("");
  const { adicionarAoCarrinho } = useCart();



  const anunciosFiltrados = anunciosEscola.filter((anuncio) => {
    const fig = anuncio.figurino;
    const titulo = fig?.titulo ?? '';
    const descricao = fig?.descricao ?? '';
    const categoria = fig?.categoria?.nomecategoria ?? '';
    const tipo = fig?.tipo_figurino?.nome ?? '';
    const tamanho = fig?.tamanho ?? '';
    const sexo = fig?.sexo?.nome ?? '';
    const acessorios = fig?.figurino_acessorio?.map((fa) => fa.acessorio.nome) ?? [];

    const correspondePesquisa =
      !searchTerm ||
      titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tamanho.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sexo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acessorios.some((nome) => nome.toLowerCase().includes(searchTerm.toLowerCase()));

    const dataAnuncio = anuncio.dataanuncio ? anuncio.dataanuncio.slice(0, 10) : null;
    const dentroIntervalo =
      (!dataInicio || (dataAnuncio && dataAnuncio >= dataInicio)) &&
      (!dataFim || (dataAnuncio && dataAnuncio <= dataFim));

      return (
      correspondePesquisa &&
      dentroIntervalo &&
      (!categoriaSelecionada || fig?.categoria?.id?.toString() === categoriaSelecionada) &&
      (!tipoSelecionado || fig?.tipo_figurino?.id?.toString() === tipoSelecionado) &&
      (!tamanhoSelecionado || tamanho === tamanhoSelecionado) &&
      (!generoSelecionado || fig?.sexo?.id?.toString() === generoSelecionado)
    );
  });

  const tamanhosUnicos = [...new Set(anunciosEscola.map((a) => a.figurino?.tamanho ?? '').filter(Boolean))].sort();

  const handleCriarAnuncio = async (e: { preventDefault(): void }) => {
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
      queryClient.invalidateQueries({ queryKey: ["anunciosEscola"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar anúncio");
    }
  };

  const handleRemoverAnuncio = async (id: number, descricao: string) => {
    if (!window.confirm(`Tem a certeza que deseja remover o anúncio "${descricao}"?`)) return;
    try {
      await eliminarAnuncioEscola(id);
      toast.success(`Anúncio "${descricao}" removido com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["anunciosEscola"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover anúncio");
    }
  };

  const handleEditarAnuncio = async (e: { preventDefault(): void }) => {
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
      queryClient.invalidateQueries({ queryKey: ["anunciosEscola"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar anúncio");
    }
  };

  const handleAbrirReserva = (anuncio: AnuncioEscolaAPI) => {
    setAnuncioReserva(anuncio);
    setDataInicioReserva("");
    setDataFimReserva("");
    setMostrarModalReserva(true);
  };

  const handleFecharReserva = () => {
    setMostrarModalReserva(false);
    setAnuncioReserva(null);
    setDataInicioReserva("");
    setDataFimReserva("");
  };

  const handleConfirmarReserva = async (irParaCarrinho = false) => {
    if (!anuncioReserva || !dataInicioReserva || !dataFimReserva) {
      toast.error("Por favor, preencha todas as datas");
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

    const adicionado = adicionarAoCarrinho({
      id_anuncio: anuncioReserva.id,
      figurino_nome: anuncioReserva.figurino?.titulo ?? anuncioReserva.figurino?.descricao ?? "Figurino",
      datainicio: dataInicioReserva,
      datafim: dataFimReserva,
    });

    if (!adicionado) return;

    toast.success("Adicionado ao carrinho com sucesso!");
    handleFecharReserva();
    if (irParaCarrinho) {
      navigate("/carrinho");
    }
  };

  const figurinoObj = figurinos.find((f) => f.id === parseInt(figurinoSelecionado));

  return (
    <div className="space-y-3">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anúncios da Escola</h1>
          <p className="text-gray-600 text-sm mt-0.5">Gerir anúncios de aluguer de figurinos da escola</p>
        </div>
        {isStaff && (
          <button
            onClick={() => setMostrarDialogo(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-fig-purple to-fig-magenta text-white px-4 py-2 text-sm rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Criar Anúncio
          </button>
        )}
      </div>

      {/* Pesquisa e Filtros */}
      <div className="bg-white rounded-xl shadow-sm px-4 py-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por texto livre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => <option key={c.id} value={c.id.toString()}>{c.nome}</option>)}
          </select>
          <select
            value={tipoSelecionado}
            onChange={(e) => setTipoSelecionado(e.target.value)}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            {tiposFigurino.map((t) => <option key={t.id} value={t.id.toString()}>{t.nome}</option>)}
          </select>
          <select
            value={tamanhoSelecionado}
            onChange={(e) => setTamanhoSelecionado(e.target.value)}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos os tamanhos</option>
            {tamanhosUnicos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={generoSelecionado}
            onChange={(e) => setGeneroSelecionado(e.target.value)}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Todos os géneros</option>
            {sexos.map((s) => <option key={s.id} value={s.id.toString()}>{s.nome}</option>)}
          </select>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="whitespace-nowrap">Data Publicação</span>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              title="Data de publicação — de"
            />
            <span>–</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              min={dataInicio || undefined}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              title="Data de publicação — até"
            />
            {(dataInicio || dataFim) && (
              <button
                onClick={() => { setDataInicio(""); setDataFim(""); }}
                className="text-gray-400 hover:text-gray-600"
                title="Limpar datas"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Anúncios */}
      <div className="space-y-2">
        {anunciosFiltrados.map((anuncio) => (
          <div key={anuncio.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex">
            {/* Imagem */}
            <div className="w-30 bg-gradient-to-br from-fig-purple/10 via-fig-magenta/10 to-fig-green/10 flex items-center justify-center flex-shrink-0">
              <Shirt className="w-8 h-8 text-fig-purple/30" />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0 px-4 py-9 flex items-center gap-4">
              {/* Info principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {anuncio.figurino?.titulo ?? anuncio.figurino?.descricao ?? '—'}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                    <Calendar className="w-3 h-3" />
                    {anuncio.dataanuncio ? new Date(anuncio.dataanuncio).toLocaleDateString('pt-PT') : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {anuncio.figurino?.categoria && (
                    <span className="px-2 py-0.5 bg-fig-purple/10 text-fig-purple text-xs rounded-full font-medium">
                      {anuncio.figurino.categoria.nomecategoria}
                    </span>
                  )}
                  {anuncio.figurino?.tipo_figurino && (
                    <span className="px-2 py-0.5 bg-fig-green/10 text-fig-green text-xs rounded-full font-medium">
                      {anuncio.figurino.tipo_figurino.nome}
                    </span>
                  )}
                  {anuncio.figurino?.tamanho && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      {anuncio.figurino.tamanho}
                    </span>
                  )}
                  {anuncio.figurino?.sexo && (
                    <span className="px-2 py-0.5 bg-fig-purple/10 text-fig-purple text-xs rounded-full font-medium">
                      {anuncio.figurino.sexo.nome}
                    </span>
                  )}
                  {anuncio.figurino?.figurino_acessorio && anuncio.figurino.figurino_acessorio.length > 0 && (
                    <>
                      {anuncio.figurino.figurino_acessorio.slice(0, 3).map((fa) => (
                        <span key={fa.id_acessorio} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                          {fa.acessorio.nome}
                        </span>
                      ))}
                      {anuncio.figurino.figurino_acessorio.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                          +{anuncio.figurino.figurino_acessorio.length - 3}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Preço */}
              <div className="flex items-baseline gap-0.5 flex-shrink-0">
                <span className="font-bold text-fig-purple">€{(anuncio.valordiarioaluguer ?? 0).toFixed(2)}</span>
                <span className="text-xs text-gray-400">/dia</span>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isStaff ? (
                  <>
                    <button
                      className="flex items-center gap-1 px-2.5 py-1 text-xs border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors whitespace-nowrap"
                      onClick={() => { setEditarAnuncio(anuncio); setValorDiarioEditar(String(anuncio.valordiarioaluguer ?? '')); }}
                    >
                      <Edit className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      className="flex items-center gap-1 px-2.5 py-1 text-xs border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap"
                      onClick={() => handleRemoverAnuncio(anuncio.id, anuncio.figurino?.titulo ?? anuncio.figurino?.descricao ?? '')}
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover
                    </button>
                    <button
                      onClick={() => handleAbrirReserva(anuncio)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-md transition-all whitespace-nowrap"
                    >
                      Reservar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleAbrirReserva(anuncio)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-md transition-all whitespace-nowrap"
                  >
                    Reservar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {anunciosFiltrados.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl">
          <Shirt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Nenhum anúncio encontrado</p>
        </div>
      )}

      {/* Diálogo Editar Anúncio */}
      {editarAnuncio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Editar Anúncio</h2>
              <p className="text-sm text-gray-600 mt-1">{editarAnuncio.figurino?.titulo ?? editarAnuncio.figurino?.descricao ?? `Anúncio #${editarAnuncio.id}`}</p>
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
                      {fig.titulo ?? fig.descricao ?? `Figurino #${fig.id}`} — {fig.categoria?.nomecategoria ?? ''} (Tamanho: {fig.tamanho ?? '—'})
                    </option>
                  ))}
                </select>
              </div>

              {figurinoObj && (
                <div className="bg-fig-purple/5 rounded-lg p-4 border-2 border-fig-purple/20">
                  <p className="font-medium text-gray-900 mb-2">{figurinoObj.titulo ?? figurinoObj.descricao ?? '—'}</p>
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
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{anuncioReserva.figurino?.titulo ?? anuncioReserva.figurino?.descricao ?? '—'}</h3>
                  <p className="text-sm text-gray-600">€ {(anuncioReserva.valordiarioaluguer ?? 0).toFixed(2)} /dia</p>
                </div>
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
                onClick={() => handleConfirmarReserva()}
                disabled={!dataInicioReserva || !dataFimReserva}
                className="px-6 py-3 border border-fig-purple text-fig-purple bg-white hover:bg-fig-purple/5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Adicionar ao Carrinho
              </button>
              <button
                onClick={() => handleConfirmarReserva(true)}
                disabled={!dataInicioReserva || !dataFimReserva}
                className="px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finalizar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
