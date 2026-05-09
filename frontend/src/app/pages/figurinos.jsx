import { useState } from "react";
import { Search, Filter, Shirt, Plus, Trash2, Eye, Edit, Calendar, X } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { getUtilizadorAtual } from "../lib/auth";
import {
  getFigurinosRaw,
  getAnunciosEscola,
  eliminarFigurino,
  atualizarFigurino,
  criarAcessorio,
  getCategorias,
  getTiposFigurino,
  getSexos,
  getEstadosCondicao,
  getAcessorios
} from "../lib/services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCart } from "./CartContext";
import { toast } from "sonner";
import { CalendarioReserva } from "../components/calendario-reserva";
function Figurinos() {
  const utilizadorAtual = getUtilizadorAtual();
  const isStaff = utilizadorAtual?.tipo === "funcionario" || utilizadorAtual?.tipo === "admin";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todas");
  const [tipoSelecionado, setTipoSelecionado] = useState("todos");
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("todos");
  const [generoSelecionado, setGeneroSelecionado] = useState("todos");
  const [estadoSelecionado, setEstadoSelecionado] = useState("todos");
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalAcessorio, setMostrarModalAcessorio] = useState(false);
  const [nomeNovoAcessorio, setNomeNovoAcessorio] = useState("");
  const [figurinoSelecionado, setFigurinoSelecionado] = useState(null);
  const [figurinoEditando, setFigurinoEditando] = useState(null);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [formEditacao, setFormEditacao] = useState({
    titulo: "",
    descricao: "",
    tamanho: "",
    localizacao: "",
    categoria: "",
    tipo: "",
    sexo: "",
    estado: ""
  });
  const [acessoriosEditacao, setAcessoriosEditacao] = useState([]);
  const { adicionarAoCarrinho } = useCart();
  const { data: figurinos = [] } = useQuery({ queryKey: ["figurinos"], queryFn: getFigurinosRaw });
  const { data: anunciosEscola = [] } = useQuery({ queryKey: ["anunciosEscola"], queryFn: getAnunciosEscola });
  const { data: categorias = [] } = useQuery({ queryKey: ["categorias"], queryFn: getCategorias });
  const { data: tipos = [] } = useQuery({ queryKey: ["tiposFigurino"], queryFn: getTiposFigurino });
  const { data: sexos = [] } = useQuery({ queryKey: ["sexos"], queryFn: getSexos });
  const { data: estadosCondicao = [] } = useQuery({ queryKey: ["estadosCondicao"], queryFn: getEstadosCondicao });
  const { data: acessorios = [] } = useQuery({ queryKey: ["acessorios"], queryFn: getAcessorios });
  const handleCriarAcessorio = async () => {
    if (!nomeNovoAcessorio.trim()) return;
    try {
      await criarAcessorio(nomeNovoAcessorio.trim());
      toast.success(`Acess\xF3rio "${nomeNovoAcessorio.trim()}" criado com sucesso!`);
      setNomeNovoAcessorio("");
      setMostrarModalAcessorio(false);
    } catch (err) {
      toast.error(err.message || "Erro ao criar acess\xF3rio");
    }
  };
  const handleRemoverFigurino = async (id, descricao) => {
    if (!window.confirm(`Tem a certeza que deseja remover o figurino "${descricao}"?`)) return;
    try {
      await eliminarFigurino(id);
      toast.success(`Figurino "${descricao}" removido com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ["figurinos"] });
    } catch (err) {
      toast.error(err.message || "Erro ao remover figurino");
    }
  };
  const handleAbrirVer = (figurino) => {
    setFigurinoSelecionado(figurino);
    setMostrarModalVer(true);
  };
  const handleFecharVer = () => {
    setMostrarModalVer(false);
    setFigurinoSelecionado(null);
  };
  const handleAbrirEditar = (figurino) => {
    setFigurinoEditando(figurino);
    setFormEditacao({
      titulo: figurino.titulo ?? "",
      descricao: figurino.descricao ?? "",
      tamanho: figurino.tamanho ?? "",
      localizacao: figurino.localizacao ?? "",
      categoria: figurino.categoria?.id ? String(figurino.categoria.id) : "",
      tipo: figurino.tipo_figurino?.id ? String(figurino.tipo_figurino.id) : "",
      sexo: figurino.sexo?.id ? String(figurino.sexo.id) : "",
      estado: figurino.estado_condicao?.id ? String(figurino.estado_condicao.id) : ""
    });
    setAcessoriosEditacao((figurino.figurino_acessorio ?? []).map((fa) => fa.id_acessorio));
    setMostrarModalEditar(true);
  };
  const handleFecharEditar = () => {
    setMostrarModalEditar(false);
    setFigurinoEditando(null);
    setFormEditacao({ titulo: "", descricao: "", tamanho: "", localizacao: "", categoria: "", tipo: "", sexo: "", estado: "" });
    setAcessoriosEditacao([]);
  };
  const toggleAcessorioEdicao = (idAcessorio) => {
    setAcessoriosEditacao(
      (prev) => prev.includes(idAcessorio) ? prev.filter((id) => id !== idAcessorio) : [...prev, idAcessorio]
    );
  };
  const handleSubmeterEdicao = async () => {
    if (!figurinoEditando) return;
    if (!formEditacao.titulo.trim() || !formEditacao.descricao.trim()) {
      toast.error("O t\xEDtulo e a descri\xE7\xE3o s\xE3o obrigat\xF3rios");
      return;
    }
    try {
      await atualizarFigurino(figurinoEditando.id, {
        titulo: formEditacao.titulo.trim(),
        descricao: formEditacao.descricao.trim(),
        tamanho: formEditacao.tamanho || null,
        localizacao: formEditacao.localizacao || null,
        id_categoria: formEditacao.categoria ? parseInt(formEditacao.categoria) : null,
        id_tipo: formEditacao.tipo ? parseInt(formEditacao.tipo) : null,
        id_sexo: formEditacao.sexo ? parseInt(formEditacao.sexo) : null,
        id_estado_figurino: formEditacao.estado ? parseInt(formEditacao.estado) : null,
        id_acessorios: acessoriosEditacao,
        substituir_acessorios: true
      });
      toast.success("Figurino atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["figurinos"] });
      handleFecharEditar();
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar figurino");
    }
  };
  const handleAbrirModalReserva = (figurino) => {
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
  const calcularDias = (inicio, fim) => {
    if (!inicio || !fim) return 0;
    const diffTime = Math.abs(new Date(fim).getTime() - new Date(inicio).getTime());
    return Math.ceil(diffTime / (1e3 * 60 * 60 * 24)) + 1;
  };
  const handleConfirmarReserva = async (irParaCarrinho = false) => {
    if (!figurinoSelecionado || !dataInicio || !dataFim) {
      toast.error("Por favor, preencha todas as datas");
      return;
    }
    if (new Date(dataFim) < new Date(dataInicio)) {
      toast.error("A data de fim deve ser posterior \xE0 data de in\xEDcio");
      return;
    }
    const hoje = /* @__PURE__ */ new Date();
    hoje.setHours(0, 0, 0, 0);
    if (new Date(dataInicio) < hoje) {
      toast.error("A data de in\xEDcio n\xE3o pode ser no passado");
      return;
    }
    const anuncio = anunciosEscola.find((a) => a.id_figurino === figurinoSelecionado.id);
    if (!anuncio) {
      toast.error("Figurino n\xE3o dispon\xEDvel para aluguer");
      return;
    }
    const adicionado = adicionarAoCarrinho({
      id_anuncio: anuncio.id,
      figurino_nome: figurinoSelecionado.titulo ?? figurinoSelecionado.descricao ?? "Figurino",
      datainicio: dataInicio,
      datafim: dataFim
    });
    if (!adicionado) return;
    toast.success("Adicionado ao carrinho com sucesso!");
    handleFecharModalReserva();
    if (irParaCarrinho) {
      navigate("/carrinho");
    }
  };
  const figurinosFiltrados = figurinos.filter((figurino) => {
    const categoria = figurino.categoria?.nomecategoria ?? "";
    const tipo = figurino.tipo_figurino?.nome ?? "";
    const tamanho = figurino.tamanho ?? "";
    const sexo = figurino.sexo?.nome ?? "";
    const estado = figurino.estado_condicao?.nome ?? "";
    const titulo = figurino.titulo ?? "";
    const descricao = figurino.descricao ?? "";
    const acessorios2 = (figurino.figurino_acessorio ?? []).map((fa) => fa.acessorio.nome);
    const correspondePesquisa = titulo.toLowerCase().includes(termoPesquisa.toLowerCase()) || descricao.toLowerCase().includes(termoPesquisa.toLowerCase()) || categoria.toLowerCase().includes(termoPesquisa.toLowerCase()) || tipo.toLowerCase().includes(termoPesquisa.toLowerCase()) || tamanho.toLowerCase().includes(termoPesquisa.toLowerCase()) || sexo.toLowerCase().includes(termoPesquisa.toLowerCase()) || (figurino.localizacao ?? "").toLowerCase().includes(termoPesquisa.toLowerCase()) || estado.toLowerCase().includes(termoPesquisa.toLowerCase()) || acessorios2.some((nome) => nome.toLowerCase().includes(termoPesquisa.toLowerCase()));
    return correspondePesquisa && (categoriaSelecionada === "todas" || categoria === categoriaSelecionada) && (tipoSelecionado === "todos" || tipo === tipoSelecionado) && (tamanhoSelecionado === "todos" || tamanho === tamanhoSelecionado) && (generoSelecionado === "todos" || sexo === generoSelecionado) && (estadoSelecionado === "todos" || estado === estadoSelecionado);
  });
  const categoriasUnicas = categorias.map((c) => c.nome).sort();
  const tiposUnicos = tipos.map((t) => t.nome).sort();
  const tamanhosUnicos = [...new Set(figurinos.map((f) => f.tamanho ?? "").filter(Boolean))].sort();
  const generosUnicos = sexos.map((s) => s.nome).sort();
  const estadosUnicos = estadosCondicao.map((e) => e.nome).sort();
  return <div className="space-y-3">
      {
    /* Cabeçalho */
  }
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Figurinos</h1>
          <p className="text-gray-600 text-sm mt-0.5">Explore a nossa coleção completa de figurinos disponíveis</p>
        </div>
        {isStaff && <div className="flex items-center gap-2">
            <button
    onClick={() => setMostrarModalAcessorio(true)}
    className="flex items-center gap-1.5 border border-purple-600 text-purple-600 hover:bg-purple-50 px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap"
  >
              <Plus className="w-4 h-4" />
              Criar Acessório
            </button>
            <Link
    to="/figurinos/criar"
    className="flex items-center gap-1.5 bg-gradient-to-r from-fig-purple to-fig-magenta text-white px-4 py-2 text-sm rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
  >
              <Plus className="w-4 h-4" />
              Criar Figurino
            </Link>
          </div>}
      </div>

      {
    /* Pesquisa e Filtros */
  }
      <div className="bg-white rounded-xl shadow-sm px-4 py-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
    type="text"
    placeholder="Pesquisar figurinos..."
    value={termoPesquisa}
    onChange={(e) => setTermoPesquisa(e.target.value)}
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
            <option value="todas">Todas as categorias</option>
            {categoriasUnicas.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
    value={tipoSelecionado}
    onChange={(e) => setTipoSelecionado(e.target.value)}
    className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
            <option value="todos">Todos os tipos</option>
            {tiposUnicos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
          <select
    value={tamanhoSelecionado}
    onChange={(e) => setTamanhoSelecionado(e.target.value)}
    className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
            <option value="todos">Todos os tamanhos</option>
            {tamanhosUnicos.map((tamanho) => <option key={tamanho} value={tamanho}>{tamanho}</option>)}
          </select>
          <select
    value={generoSelecionado}
    onChange={(e) => setGeneroSelecionado(e.target.value)}
    className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
            <option value="todos">Todos os géneros</option>
            {generosUnicos.map((genero) => <option key={genero} value={genero}>{genero}</option>)}
          </select>
          <select
    value={estadoSelecionado}
    onChange={(e) => setEstadoSelecionado(e.target.value)}
    className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
            <option value="todos">Todos os estados</option>
            {estadosUnicos.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
          </select>
        </div>
      </div>

      {
    /* Lista */
  }
      <div className="space-y-2">
        {figurinosFiltrados.map((figurino) => <div key={figurino.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex">
            {
    /* Ícone */
  }
            <div className="w-30 bg-gradient-to-br from-fig-purple/10 via-fig-magenta/10 to-fig-green/10 flex items-center justify-center flex-shrink-0">
              <Shirt className="w-8 h-8 text-fig-purple/30" />
            </div>

            {
    /* Conteúdo */
  }
            <div className="flex-1 min-w-0 px-4 py-9 flex items-center gap-4">
              {
    /* Info principal */
  }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {figurino.titulo ?? figurino.descricao ?? "\u2014"}
                  </p>
                  {figurino.localizacao && <span className="text-xs text-gray-400 truncate flex-shrink-0">{figurino.localizacao}</span>}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {figurino.categoria && <span className="px-2 py-0.5 bg-fig-purple/10 text-fig-purple text-xs rounded-full font-medium">
                      {figurino.categoria.nomecategoria}
                    </span>}
                  {figurino.tipo_figurino && <span className="px-2 py-0.5 bg-fig-green/10 text-fig-green text-xs rounded-full font-medium">
                      {figurino.tipo_figurino.nome}
                    </span>}
                  {figurino.tamanho && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      {figurino.tamanho}
                    </span>}
                  {figurino.sexo && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      {figurino.sexo.nome}
                    </span>}
                  {figurino.estado_condicao && <span className="px-2 py-0.5 bg-fig-green/10 text-fig-green text-xs rounded-full font-medium">
                      {figurino.estado_condicao.nome}
                    </span>}
                  {(figurino.figurino_acessorio ?? []).slice(0, 3).map((fa) => <span key={fa.id_acessorio} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                      {fa.acessorio.nome}
                    </span>)}
                  {(figurino.figurino_acessorio ?? []).length > 3 && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      +{(figurino.figurino_acessorio ?? []).length - 3}
                    </span>}
                </div>
              </div>

              {
    /* Preço (apenas para alunos) */
  }
              {!isStaff && (() => {
    const anuncio = anunciosEscola.find((a) => a.id_figurino === figurino.id);
    return <div className="flex items-baseline gap-0.5 flex-shrink-0">
                    <span className="font-bold text-fig-purple">€{(anuncio?.valordiarioaluguer ?? 0).toFixed(2)}</span>
                    <span className="text-xs text-gray-400">/dia</span>
                  </div>;
  })()}

              {
    /* Ações */
  }
              <div className="flex items-center gap-2 flex-shrink-0">
                {isStaff ? <>
                    <button
    onClick={() => handleAbrirVer(figurino)}
    className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors text-sm"
  >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    <button
    onClick={() => handleAbrirEditar(figurino)}
    className="flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 transition-colors text-sm"
  >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
    onClick={() => handleRemoverFigurino(figurino.id, figurino.titulo ?? figurino.descricao ?? "")}
    className="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors text-sm"
  >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </button>
                  </> : <button
    onClick={() => handleAbrirModalReserva(figurino)}
    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-md transition-all whitespace-nowrap"
  >
                    Reservar
                  </button>}
              </div>
            </div>
          </div>)}
      </div>

      {figurinosFiltrados.length === 0 && <div className="text-center py-10 bg-white rounded-xl">
          <Shirt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Nenhum figurino encontrado</p>
        </div>}

      {
    /* Modal de Reserva */
  }
      {mostrarModalReserva && figurinoSelecionado && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reservar Figurino</h2>
                <button onClick={handleFecharModalReserva} className="text-gray-500 hover:text-gray-700 transition-colors">
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
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{figurinoSelecionado.titulo ?? figurinoSelecionado.descricao ?? "\u2014"}</h3>
                  {figurinoSelecionado.categoria && <p className="text-sm text-gray-600 mb-1">{figurinoSelecionado.categoria.nomecategoria}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-fig-purple" />
                  Período da Reserva
                </h4>

                <CalendarioReserva
    idAnuncio={anunciosEscola.find((a) => a.id_figurino === figurinoSelecionado.id)?.id ?? null}
    dataInicio={dataInicio}
    dataFim={dataFim}
    onDataInicioChange={setDataInicio}
    onDataFimChange={setDataFim}
  />

                {dataInicio && dataFim && new Date(dataFim) >= new Date(dataInicio) && <div className="p-4 bg-fig-green/5 border border-fig-green/20 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Número de dias:</span>
                      <span className="font-semibold text-gray-900">
                        {calcularDias(dataInicio, dataFim)} dia{calcularDias(dataInicio, dataFim) > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
    onClick={handleFecharModalReserva}
    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
  >
                Cancelar
              </button>
              <button
    onClick={() => handleConfirmarReserva()}
    disabled={!dataInicio || !dataFim}
    className="px-6 py-3 border border-fig-purple text-fig-purple bg-white hover:bg-fig-purple/5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
  >
                Adicionar ao Carrinho
              </button>
              <button
    onClick={() => handleConfirmarReserva(true)}
    disabled={!dataInicio || !dataFim}
    className="px-6 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
  >
                Finalizar reserva
              </button>
            </div>
          </div>
        </div>}

      {
    /* Modal Ver */
  }
      {mostrarModalVer && figurinoSelecionado && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Detalhes do Figurino</h2>
                <button onClick={handleFecharVer} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Título</label>
                <p className="mt-1 text-gray-900">{figurinoSelecionado.titulo ?? "\u2014"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">{figurinoSelecionado.descricao ?? "\u2014"}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tamanho</label>
                  <p className="mt-1 text-gray-900">{figurinoSelecionado.tamanho ?? "\u2014"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Localização</label>
                  <p className="mt-1 text-gray-900">{figurinoSelecionado.localizacao ?? "\u2014"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Categoria</label>
                  <p className="mt-1 text-gray-900">{figurinoSelecionado.categoria?.nomecategoria ?? "\u2014"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo</label>
                  <p className="mt-1 text-gray-900">{figurinoSelecionado.tipo_figurino?.nome ?? "\u2014"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Sexo</label>
                  <p className="mt-1 text-gray-900">{figurinoSelecionado.sexo?.nome ?? "\u2014"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <p className="mt-1 text-gray-900">{figurinoSelecionado.estado_condicao?.nome ?? "\u2014"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Acessórios incluídos</label>
                {(figurinoSelecionado.figurino_acessorio ?? []).length > 0 ? <div className="mt-2 flex flex-wrap gap-2">
                    {(figurinoSelecionado.figurino_acessorio ?? []).map((fa) => <span key={fa.id_acessorio} className="px-3 py-1 bg-fig-green/10 text-fig-green text-sm rounded-full">
                        {fa.acessorio.nome}
                      </span>)}
                  </div> : <p className="mt-1 text-gray-900">—</p>}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50">
              <button
    onClick={handleFecharVer}
    className="w-full px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
  >
                Fechar
              </button>
            </div>
          </div>
        </div>}

      {
    /* Modal Editar */
  }
      {mostrarModalEditar && figurinoEditando && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Editar Figurino</h2>
                <button onClick={handleFecharEditar} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
    type="text"
    value={formEditacao.titulo}
    onChange={(e) => setFormEditacao({ ...formEditacao, titulo: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                <textarea
    value={formEditacao.descricao}
    onChange={(e) => setFormEditacao({ ...formEditacao, descricao: e.target.value })}
    rows={4}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
                  <input
    type="text"
    value={formEditacao.tamanho}
    onChange={(e) => setFormEditacao({ ...formEditacao, tamanho: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <input
    type="text"
    value={formEditacao.localizacao}
    onChange={(e) => setFormEditacao({ ...formEditacao, localizacao: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
    value={formEditacao.categoria}
    onChange={(e) => setFormEditacao({ ...formEditacao, categoria: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
                    <option value="">Sem categoria</option>
                    {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
    value={formEditacao.tipo}
    onChange={(e) => setFormEditacao({ ...formEditacao, tipo: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
                    <option value="">Sem tipo</option>
                    {tipos.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
                  <select
    value={formEditacao.sexo}
    onChange={(e) => setFormEditacao({ ...formEditacao, sexo: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
                    <option value="">Sem género</option>
                    {sexos.map((sexo) => <option key={sexo.id} value={sexo.id}>{sexo.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado do Figurino</label>
                  <select
    value={formEditacao.estado}
    onChange={(e) => setFormEditacao({ ...formEditacao, estado: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
  >
                    <option value="">Sem estado</option>
                    {estadosCondicao.map((estado) => <option key={estado.id} value={estado.id}>{estado.nome}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Acessórios incluídos</label>
                {acessorios.length === 0 ? <p className="text-sm text-gray-400 italic">Nenhum acessório disponível</p> : <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {acessorios.map((acessorio) => <label
    key={acessorio.id}
    className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${acessoriosEditacao.includes(acessorio.id) ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}
  >
                        <input
    type="checkbox"
    checked={acessoriosEditacao.includes(acessorio.id)}
    onChange={() => toggleAcessorioEdicao(acessorio.id)}
    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
  />
                        <span className="text-sm text-gray-900">{acessorio.nome}</span>
                      </label>)}
                  </div>}
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
    onClick={handleFecharEditar}
    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
  >
                Cancelar
              </button>
              <button
    onClick={handleSubmeterEdicao}
    className="px-6 py-2 bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white rounded-lg transition-all font-medium"
  >
                Guardar
              </button>
            </div>
          </div>
        </div>}

      {mostrarModalAcessorio && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Criar Acessório</h2>
              <button onClick={() => {
    setMostrarModalAcessorio(false);
    setNomeNovoAcessorio("");
  }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Acessório</label>
                <input
    type="text"
    value={nomeNovoAcessorio}
    onChange={(e) => setNomeNovoAcessorio(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleCriarAcessorio()}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    placeholder="Ex: Chapéu, Luvas, Cinto..."
    autoFocus
  />
              </div>
              <div className="flex gap-3">
                <button
    onClick={() => {
      setMostrarModalAcessorio(false);
      setNomeNovoAcessorio("");
    }}
    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
  >
                  Cancelar
                </button>
                <button
    onClick={handleCriarAcessorio}
    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
  >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>}
    </div>;
}
export {
  Figurinos
};
