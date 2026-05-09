import { useState, useEffect } from "react";
import { Plus, ShoppingBag, Clock, CheckCircle, XCircle, Shirt, Upload, X, Search, Filter } from "lucide-react";
import { getUtilizadorAtual } from "../lib/auth";
import { getMarketplace, getMarketplaceGestao, getMarketplaceDoUtilizador, criarAnuncioMarketplace, getCategorias, getEstadosAnuncio, getTiposFigurino, getSexos, ressubmeterAnuncioMarketplace, eliminarAnuncioMarketplace, continuarAnuncioMarketplace, aprovarAnuncioMarketplace } from "../lib/services";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
function Marketplace() {
  const MARKETPLACE_INTERESSE_NOTIF_KEY = "fighappens_marketplace_interesses";
  const utilizadorAtual = getUtilizadorAtual();
  const [abaAtiva, setAbaAtiva] = useState("explorar");
  const [mostrarCriarModal, setMostrarCriarModal] = useState(false);
  const [modoFormulario, setModoFormulario] = useState("criar");
  const [anuncioEmRessubmissaoId, setAnuncioEmRessubmissaoId] = useState(null);
  const [anuncioParaRemover, setAnuncioParaRemover] = useState(null);
  const [anuncioParaRenovar, setAnuncioParaRenovar] = useState(null);
  const [anuncioParaRejeitar, setAnuncioParaRejeitar] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");
  const [mostrarDetalheModal, setMostrarDetalheModal] = useState(false);
  const [anuncioDetalhe, setAnuncioDetalhe] = useState(null);
  const [imagensPreview, setImagensPreview] = useState([]);
  const [imagensFicheiro, setImagensFicheiro] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("todas");
  const [estadoSelecionado, setEstadoSelecionado] = useState("todos");
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("todos");
  const [tipoSelecionado, setTipoSelecionado] = useState("todos");
  const [sexoSelecionado, setSexoSelecionado] = useState("todos");
  const [dataSubmissaoInicio, setDataSubmissaoInicio] = useState("");
  const [dataSubmissaoFim, setDataSubmissaoFim] = useState("");
  const queryClient = useQueryClient();
  const isStaff = utilizadorAtual?.tipo === "funcionario" || utilizadorAtual?.tipo === "admin";
  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    tamanho: "",
    categoria: "",
    tipo: "",
    sexo: ""
  });
  const mudarAba = (aba) => {
    setAbaAtiva(aba);
  };
  const { data: categoriasLista = [] } = useQuery({ queryKey: ["categorias"], queryFn: getCategorias });
  const { data: estadosAnuncioLista = [] } = useQuery({ queryKey: ["estadosAnuncio"], queryFn: getEstadosAnuncio });
  const { data: tiposLista = [] } = useQuery({ queryKey: ["tiposFigurino"], queryFn: getTiposFigurino });
  const { data: sexosLista = [] } = useQuery({ queryKey: ["sexos"], queryFn: getSexos });
  const { data: todosAnuncios = [] } = useQuery({
    queryKey: isStaff ? ["marketplaceGestao"] : ["marketplace"],
    queryFn: isStaff ? () => getMarketplaceGestao() : getMarketplace
  });
  const { data: meusAnunciosLista = [] } = useQuery({
    queryKey: ["marketplaceDoUtilizador", utilizadorAtual?.id],
    queryFn: () => getMarketplaceDoUtilizador(utilizadorAtual.id),
    enabled: !isStaff && !!utilizadorAtual?.id && abaAtiva === "meusAnuncios"
  });
  useEffect(() => {
    if (isStaff) {
      setAbaAtiva("pendentes");
      return;
    }
    setAbaAtiva("explorar");
  }, [isStaff]);
  const meusAnuncios = meusAnunciosLista;
  const estadosPublicados = ["aprovado", "publicado"];
  const normalizarEstado = (estado) => estado.trim().toLowerCase();
  const outrosAnuncios = todosAnuncios.filter(
    (a) => estadosPublicados.includes((a.estado || "").trim().toLowerCase())
  );
  const anunciosPendentes = todosAnuncios.filter((a) => {
    const estado = normalizarEstado(a.estado || "");
    return estado === "submetido" || estado === "pendente";
  });
  const anunciosAMostrar = isStaff ? abaAtiva === "pendentes" ? anunciosPendentes : todosAnuncios : abaAtiva === "explorar" ? outrosAnuncios : meusAnuncios;
  const estadoCompativel = (estadoAnuncio, estadoFiltro) => {
    const anuncio = normalizarEstado(estadoAnuncio);
    const filtro = normalizarEstado(estadoFiltro);
    if (anuncio === filtro) return true;
    if (anuncio === "aprovado" && filtro === "publicado" || anuncio === "publicado" && filtro === "aprovado") return true;
    if (anuncio === "pendente" && filtro === "submetido" || anuncio === "submetido" && filtro === "pendente") return true;
    return false;
  };
  const anunciosFiltradosBase = anunciosAMostrar.filter((anuncio) => {
    const matchTermo = anuncio.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()) || anuncio.descricao.toLowerCase().includes(termoPesquisa.toLowerCase());
    const matchCategoria = categoriaSelecionada === "todas" || anuncio.categoria === categoriaSelecionada;
    const matchEstado = estadoSelecionado === "todos" || estadoCompativel(anuncio.estado, estadoSelecionado);
    const matchTamanho = tamanhoSelecionado === "todos" || anuncio.tamanho === tamanhoSelecionado;
    const matchTipo = tipoSelecionado === "todos" || anuncio.tipo === tipoSelecionado;
    const matchSexo = sexoSelecionado === "todos" || anuncio.sexo === sexoSelecionado;
    const dataAnuncio = new Date(anuncio.data_anuncio);
    const inicio = dataSubmissaoInicio ? new Date(dataSubmissaoInicio) : null;
    const fim = dataSubmissaoFim ? new Date(dataSubmissaoFim) : null;
    if (inicio) inicio.setHours(0, 0, 0, 0);
    if (fim) fim.setHours(23, 59, 59, 999);
    const matchDataInicio = !inicio || dataAnuncio >= inicio;
    const matchDataFim = !fim || dataAnuncio <= fim;
    return matchTermo && matchCategoria && matchEstado && matchTamanho && matchTipo && matchSexo && matchDataInicio && matchDataFim;
  });
  const prioridadeEstadoHistoricoAluno = (estado) => {
    const normalizado = normalizarEstado(estado);
    if (normalizado === "rejeitado" || normalizado === "reprovado") return 0;
    if (normalizado === "pendenterenovacao" || normalizado === "pendente renovacao" || normalizado === "pendente_renovacao") return 1;
    if (normalizado === "submetido" || normalizado === "pendente") return 2;
    if (normalizado === "publicado" || normalizado === "aprovado") return 3;
    if (normalizado === "arquivado") return 4;
    return 5;
  };
  const aplicarOrdenacaoPorEstado = !isStaff && utilizadorAtual?.tipo === "aluno" && abaAtiva === "meusAnuncios" || isStaff && abaAtiva === "historico";
  const anunciosFiltrados = aplicarOrdenacaoPorEstado ? [...anunciosFiltradosBase].sort((a, b) => {
    const prioridadeA = prioridadeEstadoHistoricoAluno(a.estado || "");
    const prioridadeB = prioridadeEstadoHistoricoAluno(b.estado || "");
    if (prioridadeA !== prioridadeB) return prioridadeA - prioridadeB;
    const dataA = new Date(a.data_anuncio || "").getTime();
    const dataB = new Date(b.data_anuncio || "").getTime();
    return dataB - dataA;
  }) : !isStaff && abaAtiva === "explorar" ? [...anunciosFiltradosBase].sort(
    (a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-PT", { sensitivity: "base" })
  ) : anunciosFiltradosBase;
  const tamanhosDisponiveis = ["XS", "S", "M", "L", "XL", "XXL"];
  const getCorEstado = (estado) => {
    switch (estado) {
      case "Aprovado":
      case "Publicado":
        return "text-green-700 bg-green-100";
      case "Submetido":
      case "Pendente":
      case "PendenteRenovacao":
        return "text-yellow-700 bg-yellow-100";
      case "Rejeitado":
      case "Reprovado":
        return "text-red-700 bg-red-100";
      case "Arquivado":
        return "text-gray-700 bg-gray-200";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };
  const getEstadoLabel = (estado) => {
    const normalizado = normalizarEstado(estado);
    if (utilizadorAtual?.tipo === "aluno" && normalizado === "arquivado") {
      return "Removido";
    }
    return estado;
  };
  const formatarDataPT = (data) => {
    if (!data) return null;
    const parsed = new Date(data);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString("pt-PT");
  };
  const getLinhaDataEstado = (estado, dataSubmissao, dataDecisao) => {
    const estadoNormalizado = normalizarEstado(estado);
    const dataSubmissaoFmt = formatarDataPT(dataSubmissao);
    const dataDecisaoFmt = formatarDataPT(dataDecisao);
    if (estadoNormalizado === "publicado") {
      return dataDecisaoFmt ? `Publicado em ${dataDecisaoFmt}` : `Publicado`;
    }
    if (estadoNormalizado === "arquivado") {
      return dataDecisaoFmt ? `Removido em ${dataDecisaoFmt}` : `Removido`;
    }
    if (estadoNormalizado === "rejeitado" || estadoNormalizado === "reprovado") {
      return dataDecisaoFmt ? `Rejeitado em ${dataDecisaoFmt}` : `Rejeitado`;
    }
    if (estadoNormalizado === "pendenterenovacao" || estadoNormalizado === "pendente renovacao" || estadoNormalizado === "pendente_renovacao") {
      return dataDecisaoFmt ? `Publicado em ${dataDecisaoFmt}` : `Pendente renova\xE7\xE3o`;
    }
    return dataSubmissaoFmt ? `Submetido em ${dataSubmissaoFmt}` : "Submetido";
  };
  const getIconeEstado = (estado) => {
    switch (estado) {
      case "Aprovado":
      case "Publicado":
        return CheckCircle;
      case "Submetido":
      case "Pendente":
      case "PendenteRenovacao":
        return Clock;
      case "Rejeitado":
      case "Reprovado":
        return XCircle;
      case "Arquivado":
        return XCircle;
      default:
        return Clock;
    }
  };
  const handleImagemUpload = (e) => {
    const ficheiros = e.target.files;
    if (!ficheiros) return;
    if (imagensFicheiro.length + ficheiros.length > 5) {
      toast.error("M\xE1ximo de 5 imagens por an\xFAncio");
      return;
    }
    Array.from(ficheiros).forEach((ficheiro) => {
      if (ficheiro.type.startsWith("image/")) {
        if (ficheiro.size > 2 * 1024 * 1024) {
          toast.error("Cada imagem deve ter no m\xE1ximo 2MB");
          return;
        }
        setImagensFicheiro((prev) => [...prev, ficheiro]);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImagensPreview((prev) => [...prev, event.target.result]);
          }
        };
        reader.readAsDataURL(ficheiro);
      }
    });
  };
  const removerImagem = (index) => {
    setImagensPreview((prev) => prev.filter((_, i) => i !== index));
    setImagensFicheiro((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formulario.titulo || !formulario.descricao || !formulario.categoria) {
      toast.error("Por favor, preencha todos os campos obrigat\xF3rios");
      return;
    }
    if (modoFormulario === "criar" && imagensFicheiro.length === 0) {
      toast.error("Por favor, adicione pelo menos uma imagem");
      return;
    }
    try {
      const categoriaObj = categoriasLista.find((c) => c.nome === formulario.categoria);
      const tipoObj = tiposLista.find((t) => t.nome === formulario.tipo);
      const sexoObj = sexosLista.find((s) => s.nome === formulario.sexo);
      if (modoFormulario === "ressubmeter" && anuncioEmRessubmissaoId) {
        const payload = new FormData();
        payload.append("titulo", formulario.titulo);
        payload.append("descricao", formulario.descricao);
        payload.append("tamanho", formulario.tamanho);
        if (categoriaObj?.id) payload.append("id_categoria", String(categoriaObj.id));
        if (tipoObj?.id) payload.append("id_tipo", String(tipoObj.id));
        if (sexoObj?.id) payload.append("id_sexo", String(sexoObj.id));
        imagensFicheiro.forEach((ficheiro) => payload.append("imagens", ficheiro));
        await ressubmeterAnuncioMarketplace(anuncioEmRessubmissaoId, payload);
        toast.success("An\xFAncio ressubmetido para aprova\xE7\xE3o!");
      } else {
        const payload = new FormData();
        payload.append("titulo", formulario.titulo);
        payload.append("descricao", formulario.descricao);
        payload.append("tamanho", formulario.tamanho);
        if (categoriaObj?.id) {
          payload.append("id_categoria", String(categoriaObj.id));
        }
        if (tipoObj?.id) {
          payload.append("id_tipo", String(tipoObj.id));
        }
        if (sexoObj?.id) {
          payload.append("id_sexo", String(sexoObj.id));
        }
        imagensFicheiro.forEach((ficheiro) => payload.append("imagens", ficheiro));
        await criarAnuncioMarketplace(payload);
        toast.success("An\xFAncio submetido para aprova\xE7\xE3o!");
      }
      setMostrarCriarModal(false);
      setModoFormulario("criar");
      setAnuncioEmRessubmissaoId(null);
      setFormulario({ titulo: "", descricao: "", tamanho: "", categoria: "", tipo: "", sexo: "" });
      setImagensPreview([]);
      setImagensFicheiro([]);
      queryClient.invalidateQueries({ queryKey: ["marketplaceDoUtilizador", utilizadorAtual?.id] });
    } catch (err) {
      toast.error(err.message || "Erro ao criar an\xFAncio");
    }
  };
  const abrirDetalhes = (anuncio) => {
    setAnuncioDetalhe(anuncio);
    setMostrarDetalheModal(true);
  };
  const abrirRessubmissao = (anuncio) => {
    setModoFormulario("ressubmeter");
    setAnuncioEmRessubmissaoId(anuncio.id);
    setFormulario({
      titulo: anuncio.titulo ?? "",
      descricao: anuncio.descricao ?? "",
      tamanho: anuncio.tamanho ?? "",
      categoria: anuncio.categoria ?? "",
      tipo: anuncio.tipo ?? "",
      sexo: anuncio.sexo ?? ""
    });
    setImagensPreview([]);
    setImagensFicheiro([]);
    setMostrarCriarModal(true);
  };
  const fecharDetalhes = () => {
    setMostrarDetalheModal(false);
    setAnuncioDetalhe(null);
  };
  const sinalizarInteresse = () => {
    if (!anuncioDetalhe?.id_utilizador || !utilizadorAtual?.id) {
      toast.error("N\xE3o foi poss\xEDvel sinalizar interesse neste an\xFAncio.");
      return;
    }
    if (anuncioDetalhe.id_utilizador === utilizadorAtual.id) {
      toast.error("N\xE3o pode sinalizar interesse no seu pr\xF3prio an\xFAncio.");
      return;
    }
    try {
      const raw = localStorage.getItem(MARKETPLACE_INTERESSE_NOTIF_KEY);
      const lista = raw ? JSON.parse(raw) : [];
      const notificacoes = Array.isArray(lista) ? lista : [];
      const jaExiste = notificacoes.some(
        (n) => Number(n?.idAnuncio) === anuncioDetalhe.id && Number(n?.idDono) === anuncioDetalhe.id_utilizador && Number(n?.idInteressado) === utilizadorAtual.id
      );
      if (!jaExiste) {
        const contacto = utilizadorAtual.contacto || "n\xE3o indicado";
        const mensagem = `O/A utilizador/a ${utilizadorAtual.nome} tem interesse no seu figurino. O email da pessoa \xE9: ${utilizadorAtual.email} e o seu contacto: ${contacto}.`;
        notificacoes.push({
          chave: `interesse:${anuncioDetalhe.id}:${utilizadorAtual.id}`,
          idAnuncio: anuncioDetalhe.id,
          idDono: anuncioDetalhe.id_utilizador,
          idInteressado: utilizadorAtual.id,
          mensagem,
          data: (/* @__PURE__ */ new Date()).toISOString()
        });
        localStorage.setItem(MARKETPLACE_INTERESSE_NOTIF_KEY, JSON.stringify(notificacoes));
      }
    } catch {
      toast.error("Erro ao guardar notifica\xE7\xE3o de interesse.");
      return;
    }
    toast.success("Interesse sinalizado com sucesso.");
    fecharDetalhes();
  };
  const limparFiltros = () => {
    setTermoPesquisa("");
    setCategoriaSelecionada("todas");
    setEstadoSelecionado("todos");
    setTamanhoSelecionado("todos");
    setTipoSelecionado("todos");
    setSexoSelecionado("todos");
    setDataSubmissaoInicio("");
    setDataSubmissaoFim("");
  };
  const abrirConfirmacaoRemocao = (anuncio) => {
    setAnuncioParaRemover(anuncio);
  };
  const fecharConfirmacaoRemocao = () => {
    setAnuncioParaRemover(null);
  };
  const confirmarRemocao = async () => {
    if (!anuncioParaRemover) return;
    try {
      await eliminarAnuncioMarketplace(anuncioParaRemover.id);
      toast.success("An\xFAncio removido com sucesso.");
      fecharConfirmacaoRemocao();
      queryClient.invalidateQueries({ queryKey: isStaff ? ["marketplaceGestao"] : ["marketplace"] });
      if (!isStaff) queryClient.invalidateQueries({ queryKey: ["marketplaceDoUtilizador", utilizadorAtual?.id] });
    } catch (err) {
      toast.error(err.message || "Erro ao remover an\xFAncio");
    }
  };
  const abrirConfirmacaoRenovacao = (anuncio) => {
    setAnuncioParaRenovar(anuncio);
  };
  const abrirModalRejeicao = (anuncio) => {
    setAnuncioParaRejeitar(anuncio);
    setMotivoRejeicao("");
  };
  const fecharModalRejeicao = () => {
    setAnuncioParaRejeitar(null);
    setMotivoRejeicao("");
  };
  const aprovarAnuncioPendente = async (id) => {
    try {
      await aprovarAnuncioMarketplace(id, true);
      toast.success("An\xFAncio aprovado com sucesso!");
      fecharDetalhes();
      queryClient.invalidateQueries({ queryKey: ["marketplaceGestao"] });
    } catch (err) {
      toast.error(err?.message || "Erro ao aprovar an\xFAncio");
    }
  };
  const confirmarRejeicao = async () => {
    if (!anuncioParaRejeitar) return;
    const motivo = motivoRejeicao.trim();
    if (!motivo) {
      toast.error("Indique o motivo da rejei\xE7\xE3o");
      return;
    }
    try {
      await aprovarAnuncioMarketplace(anuncioParaRejeitar.id, false, motivo);
      toast.success("An\xFAncio rejeitado");
      fecharModalRejeicao();
      fecharDetalhes();
      queryClient.invalidateQueries({ queryKey: ["marketplaceGestao"] });
    } catch (err) {
      toast.error(err?.message || "Erro ao rejeitar an\xFAncio");
    }
  };
  const fecharConfirmacaoRenovacao = () => {
    setAnuncioParaRenovar(null);
  };
  const confirmarRenovacao = async () => {
    if (!anuncioParaRenovar) return;
    try {
      await continuarAnuncioMarketplace(anuncioParaRenovar.id);
      toast.success("An\xFAncio renovado por mais 30 dias.");
      fecharConfirmacaoRenovacao();
      queryClient.invalidateQueries({ queryKey: isStaff ? ["marketplaceGestao"] : ["marketplace"] });
      if (!isStaff) queryClient.invalidateQueries({ queryKey: ["marketplaceDoUtilizador", utilizadorAtual?.id] });
    } catch (err) {
      toast.error(err.message || "Erro ao renovar an\xFAncio");
    }
  };
  return <div className="space-y-6">
      {
    /* Cabeçalho */
  }
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">Gestão do Marketplace</p>
        </div>
        {utilizadorAtual?.tipo === "aluno" && <button
    onClick={() => setMostrarCriarModal(true)}
    className="flex items-center gap-2 text-white px-6 py-3 rounded-lg transition-all hover:opacity-90"
    style={{ background: "linear-gradient(135deg, var(--fig-magenta) 0%, var(--fig-purple) 100%)" }}
  >
            <Plus className="w-5 h-5" />
            Criar Anúncio
          </button>}
      </div>

      {
    /* Abas */
  }
      {utilizadorAtual?.tipo === "aluno" && <div className="bg-white rounded-xl shadow-sm p-1 inline-flex gap-1">
          <button
    onClick={() => mudarAba("explorar")}
    className={`px-6 py-2 rounded-lg transition-colors ${abaAtiva === "explorar" ? "bg-fig-purple text-white" : "text-gray-600 hover:bg-gray-100"}`}
  >
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Explorar ({outrosAnuncios.length})
          </button>
          <button
    onClick={() => mudarAba("meusAnuncios")}
    className={`px-6 py-2 rounded-lg transition-colors ${abaAtiva === "meusAnuncios" ? "bg-fig-purple text-white" : "text-gray-600 hover:bg-gray-100"}`}
  >
            Os Meus Anúncios ({meusAnuncios.length})
          </button>
        </div>}

      {isStaff && <div className="bg-white rounded-xl shadow-sm p-1 inline-flex gap-1">
          <button
    onClick={() => setAbaAtiva("pendentes")}
    className={`px-6 py-2 rounded-lg transition-colors ${abaAtiva === "pendentes" ? "bg-fig-purple text-white" : "text-gray-600 hover:bg-gray-100"}`}
  >
            Anúncios pendentes ({anunciosPendentes.length})
          </button>
          <button
    onClick={() => setAbaAtiva("historico")}
    className={`px-6 py-2 rounded-lg transition-colors ${abaAtiva === "historico" ? "bg-fig-purple text-white" : "text-gray-600 hover:bg-gray-100"}`}
  >
            Histórico de anúncios ({todosAnuncios.length})
          </button>
        </div>}

      {
    /* Filtros */
  }
      {!(isStaff && abaAtiva === "pendentes") && <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {
    /* Barra de Pesquisa */
  }
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
    type="text"
    value={termoPesquisa}
    onChange={(e) => setTermoPesquisa(e.target.value)}
    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    placeholder="Pesquisar anúncios..."
  />
        </div>

        {
    /* Filtros em Grid */
  }
        <div
    className={[
      "grid grid-cols-1 sm:grid-cols-2 gap-4",
      isStaff ? "lg:grid-cols-2 max-w-4xl mx-auto" : "lg:grid-cols-3"
    ].join(" ")}
  >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Categoria
            </label>
            <select
    value={categoriaSelecionada}
    onChange={(e) => setCategoriaSelecionada(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  >
              <option value="todas">Todas as Categorias</option>
              {categoriasLista.map((cat) => <option key={cat.id} value={cat.nome}>{cat.nome}</option>)}
            </select>
          </div>

          {utilizadorAtual?.tipo === "aluno" && abaAtiva === "explorar" && <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
              <select
    value={tamanhoSelecionado}
    onChange={(e) => setTamanhoSelecionado(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  >
                <option value="todos">Todos os tamanhos</option>
                {tamanhosDisponiveis.map((tamanho) => <option key={tamanho} value={tamanho}>{tamanho}</option>)}
              </select>
            </div>}

          {utilizadorAtual?.tipo === "aluno" && abaAtiva === "explorar" && <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
    value={tipoSelecionado}
    onChange={(e) => setTipoSelecionado(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  >
                <option value="todos">Todos os tipos</option>
                {tiposLista.map((tipo) => <option key={tipo.id} value={tipo.nome}>{tipo.nome}</option>)}
              </select>
            </div>}

          {utilizadorAtual?.tipo === "aluno" && abaAtiva === "explorar" && <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
              <select
    value={sexoSelecionado}
    onChange={(e) => setSexoSelecionado(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  >
                <option value="todos">Todos</option>
                {sexosLista.map((sexo) => <option key={sexo.id} value={sexo.nome}>{sexo.nome}</option>)}
              </select>
            </div>}

          {(isStaff || abaAtiva === "meusAnuncios") && <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado Anúncio</label>
              <select
    value={estadoSelecionado}
    onChange={(e) => setEstadoSelecionado(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  >
                <option value="todos">Todos os Estados</option>
                {estadosAnuncioLista.map((estado) => <option key={estado.id} value={estado.nome}>{estado.descricao ?? estado.nome}</option>)}
              </select>
            </div>}

          {isStaff && <div className="lg:col-start-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Submissão (Início)</label>
              <input
    type="date"
    value={dataSubmissaoInicio}
    onChange={(e) => setDataSubmissaoInicio(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  />
            </div>}

          {isStaff && <div className="lg:col-start-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Submissão (Fim)</label>
              <input
    type="date"
    value={dataSubmissaoFim}
    onChange={(e) => setDataSubmissaoFim(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  />
            </div>}
        </div>

        {
    /* Contagem de Resultados */
  }
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-gray-600">
            {anunciosFiltrados.length} anúncio{anunciosFiltrados.length !== 1 ? "s" : ""} encontrado{anunciosFiltrados.length !== 1 ? "s" : ""}
          </p>
          <button
    type="button"
    onClick={limparFiltros}
    className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
  >
            Limpar Filtros
          </button>
        </div>
      </div>}

      {
    /* Grelha de Anúncios */
  }
      <div className="space-y-4">
        {anunciosFiltrados.map((anuncio) => {
    const estadoAnuncio = anuncio.estado?.trim() ? anuncio.estado : "Submetido";
    const estadoLabel = getEstadoLabel(estadoAnuncio);
    const IconeEstado = getIconeEstado(estadoAnuncio);
    const linhaDataEstado = getLinhaDataEstado(estadoAnuncio, anuncio.data_anuncio, anuncio.data_aprovacao);
    return <div key={anuncio.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
                {
      /* Imagem/Ícone */
    }
                <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-fig-purple/10 via-fig-magenta/10 to-fig-green/10 flex items-center justify-center flex-shrink-0 relative">
                  {anuncio.imagens.length > 0 ? <img src={anuncio.imagens[0]} alt={anuncio.titulo} className="w-full h-full object-cover" /> : <Shirt className="w-16 h-16 text-fig-purple/30" />}
                </div>

                {
      /* Conteúdo */
    }
                <div className="flex-1 p-5 sm:py-5 sm:pr-5 sm:pl-0">
                  <div className="flex flex-col h-full">
                    {
      /* Cabeçalho */
    }
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{anuncio.titulo}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{anuncio.descricao}</p>
                    </div>

                    {
      /* Tags */
    }
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-fig-purple/10 text-fig-purple text-xs rounded-full font-medium">
                        {anuncio.categoria}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                        {anuncio.tamanho}
                      </span>
                      {(isStaff || abaAtiva === "meusAnuncios") && <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCorEstado(estadoAnuncio)}`}>
                          <IconeEstado className="w-3 h-3" />
                          {estadoLabel}
                        </span>}
                    </div>

                    {
      /* Informação adicional */
    }
                    <div className="text-xs text-gray-500 mb-3 space-y-1">
                      {(abaAtiva === "meusAnuncios" || isStaff) && formatarDataPT(anuncio.data_anuncio) && <p>Submetido em {formatarDataPT(anuncio.data_anuncio)}</p>}
                      {!(normalizarEstado(estadoAnuncio) === "submetido" || normalizarEstado(estadoAnuncio) === "pendente") && <p>{linhaDataEstado}</p>}
                    </div>

                    {
      /* Motivo de rejeição (se existir) */
    }
                    {anuncio.motivo_rejeicao && <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-700">
                          <strong>Motivo da rejeição:</strong> {anuncio.motivo_rejeicao}
                        </p>
                      </div>}

                    {
      /* Ações */
    }
                    <div className="mt-auto pt-3 border-t">
                      {abaAtiva === "explorar" ? <button
      onClick={() => abrirDetalhes(anuncio)}
      className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
    >
                          Ver Detalhes
                        </button> : isStaff && abaAtiva === "pendentes" ? <div className="flex items-center justify-end gap-2">
                          <button
      onClick={() => abrirDetalhes(anuncio)}
      className="w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
    >
                            Ver Detalhes
                          </button>
                        </div> : (() => {
      const estado = normalizarEstado(anuncio.estado);
      if (estado === "rejeitado" || estado === "reprovado") {
        return <div className="flex gap-2 flex-wrap">
                              <button
          onClick={() => abrirDetalhes(anuncio)}
          className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
        >
                                Ver Detalhes
                              </button>
                              {anuncio.id_utilizador === utilizadorAtual?.id && <button
          onClick={() => abrirRessubmissao(anuncio)}
          className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
        >
                                  Ressubmeter
                                </button>}
                            </div>;
      }
      if (estado === "pendenterenovacao" || estado === "pendente renovacao" || estado === "pendente_renovacao") {
        return <div className="flex gap-2 flex-wrap">
                              <button
          onClick={() => abrirDetalhes(anuncio)}
          className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
        >
                                Ver Detalhes
                              </button>
                              <button
          onClick={() => abrirConfirmacaoRenovacao(anuncio)}
          className="w-full sm:w-auto bg-gradient-to-r from-fig-green to-emerald-500 hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
        >
                                Manter
                              </button>
                              {!isStaff && <button
          onClick={() => abrirConfirmacaoRemocao(anuncio)}
          className="w-full sm:w-auto border border-red-300 text-red-700 py-2 px-6 rounded-lg hover:bg-red-50 transition-colors"
        >
                                  Remover
                                </button>}
                            </div>;
      }
      if (estado === "submetido" || estado === "pendente") {
        return <div className="flex gap-2 flex-wrap items-center">
                              <button
          onClick={() => abrirDetalhes(anuncio)}
          className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
        >
                                Ver Detalhes
                              </button>
                              <p className="text-sm text-gray-500">
                                A aguardar validação da equipa.
                              </p>
                            </div>;
      }
      if (estado === "arquivado") {
        return <div className="flex gap-2 flex-wrap items-center">
                              <button
          onClick={() => abrirDetalhes(anuncio)}
          className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
        >
                                Ver Detalhes
                              </button>
                              <p className="text-sm text-gray-500">
                                Anúncio removido.
                              </p>
                            </div>;
      }
      return <div className="flex gap-2 flex-wrap">
                            <button
        onClick={() => abrirDetalhes(anuncio)}
        className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all"
      >
                              Ver Detalhes
                            </button>
                            {!isStaff && <button
        onClick={() => abrirConfirmacaoRemocao(anuncio)}
        className="w-full sm:w-auto border border-red-300 text-red-700 py-2 px-6 rounded-lg hover:bg-red-50 transition-colors"
      >
                                Remover
                              </button>}
                          </div>;
    })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>;
  })}
      </div>

      {
    /* Estado Vazio */
  }
      {anunciosFiltrados.length === 0 && <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isStaff ? abaAtiva === "pendentes" ? "Sem an\xFAncios pendentes" : "Sem an\xFAncios no hist\xF3rico" : abaAtiva === "explorar" ? "Nenhum an\xFAncio dispon\xEDvel" : "Ainda n\xE3o tem an\xFAncios"}
          </h3>
          <p className="text-gray-600 mb-6">
            {isStaff ? abaAtiva === "pendentes" ? "N\xE3o existem an\xFAncios para valida\xE7\xE3o neste momento." : "N\xE3o h\xE1 an\xFAncios no hist\xF3rico do marketplace." : abaAtiva === "explorar" ? "N\xE3o h\xE1 an\xFAncios dispon\xEDveis no momento." : "Crie o seu primeiro an\xFAncio e comece a partilhar!"}
          </p>
          {abaAtiva === "meusAnuncios" && <button
    onClick={() => setMostrarCriarModal(true)}
    className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg transition-all hover:opacity-90"
    style={{ background: "linear-gradient(135deg, var(--fig-magenta) 0%, var(--fig-purple) 100%)" }}
  >
              <Plus className="w-5 h-5" />
              Criar Anúncio
            </button>}
        </div>}

      {
    /* Modal de Criar Anúncio */
  }
      {mostrarDetalheModal && anuncioDetalhe && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white flex items-start justify-between gap-4">
              <div>
              <h2 className="text-xl font-semibold text-gray-900">{anuncioDetalhe.titulo}</h2>
                <p className="text-sm text-gray-600 mt-1">Anúncio criado por: {anuncioDetalhe.utilizador || "Utilizador desconhecido"}</p>
              </div>
              <button
    type="button"
    onClick={fecharDetalhes}
    className="text-gray-500 hover:text-gray-700"
    aria-label="Fechar"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {anuncioDetalhe.imagens.length > 0 ? anuncioDetalhe.imagens.map((img, idx) => <img
    key={`${anuncioDetalhe.id}-${idx}`}
    src={img}
    alt={`${anuncioDetalhe.titulo} ${idx + 1}`}
    className="w-full h-56 object-cover rounded-lg border"
  />) : <div className="sm:col-span-2 h-56 rounded-lg border bg-gray-50 flex items-center justify-center">
                    <Shirt className="w-16 h-16 text-gray-300" />
                  </div>}
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-700">{anuncioDetalhe.descricao || "Sem descri\xE7\xE3o."}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Categoria</span><p className="font-medium">{anuncioDetalhe.categoria || "\u2014"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Tamanho</span><p className="font-medium">{anuncioDetalhe.tamanho || "\u2014"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Tipo</span><p className="font-medium">{anuncioDetalhe.tipo || "\u2014"}</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><span className="text-gray-500">Sexo</span><p className="font-medium">{anuncioDetalhe.sexo || "\u2014"}</p></div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div />
                {isStaff && abaAtiva === "pendentes" ? <div className="flex items-center gap-2 ml-auto">
                    <button
    type="button"
    onClick={() => aprovarAnuncioPendente(anuncioDetalhe.id)}
    className="px-4 py-2 rounded-lg bg-gradient-to-r from-fig-green to-emerald-500 hover:shadow-lg text-white transition-all"
  >
                      Aprovar
                    </button>
                    <button
    type="button"
    onClick={() => abrirModalRejeicao(anuncioDetalhe)}
    className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
  >
                      Rejeitar
                    </button>
                  </div> : utilizadorAtual?.tipo === "aluno" ? <div className="flex items-center gap-2 ml-auto">
                    <button
    type="button"
    onClick={sinalizarInteresse}
    className="px-4 py-2 rounded-lg bg-gradient-to-r from-fig-green to-emerald-500 hover:shadow-lg text-white transition-all"
  >
                      Sinalizar Interesse
                    </button>
                    <button
    type="button"
    onClick={fecharDetalhes}
    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
  >
                      Cancelar
                    </button>
                  </div> : null}
              </div>
            </div>
          </div>
        </div>}

      {anuncioParaRejeitar && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Motivo da rejeição</h2>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{anuncioParaRejeitar.titulo}</p>
            </div>

            <div className="p-6 space-y-3">
              <textarea
    value={motivoRejeicao}
    onChange={(e) => setMotivoRejeicao(e.target.value)}
    rows={4}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    placeholder="Ex: Descrição incompleta e sem detalhes do estado da peça."
  />
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
    type="button"
    onClick={fecharModalRejeicao}
    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
  >
                Cancelar
              </button>
              <button
    type="button"
    onClick={confirmarRejeicao}
    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
  >
                Confirmar
              </button>
            </div>
          </div>
        </div>}

      {mostrarCriarModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">{modoFormulario === "ressubmeter" ? "Ressubmeter An\xFAncio" : "Criar Novo An\xFAncio"}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {modoFormulario === "ressubmeter" ? "Atualize os dados e reenvie para valida\xE7\xE3o" : "Partilhe o seu figurino com a comunidade"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {
    /* Upload de Imagens */
  }
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotografias do Figurino {modoFormulario === "criar" ? "*" : ""} (máximo 5)
                </label>
                {modoFormulario === "ressubmeter" && <p className="text-xs text-amber-700 mb-2">Se carregar novas imagens, as imagens atuais do anúncio serão substituídas.</p>}
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {imagensPreview.map((imagem, index) => <div key={index} className="relative group aspect-square">
                      <img
    src={imagem}
    alt={`Figurino ${index + 1}`}
    className="w-full h-full object-cover rounded-lg"
  />
                      <button
    type="button"
    onClick={() => removerImagem(index)}
    className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
  >
                        <X className="w-4 h-4" />
                      </button>
                    </div>)}

                  {imagensPreview.length < 5 && <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-fig-purple/40 hover:bg-fig-purple/5 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600">Adicionar</span>
                      <input
    type="file"
    multiple
    accept="image/*"
    onChange={handleImagemUpload}
    className="hidden"
  />
                    </label>}
                </div>
                <p className="text-xs text-gray-500">JPG, PNG ou WEBP</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
    type="text"
    value={formulario.titulo}
    onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    placeholder="Ex: Vestido de Festa Anos 50"
    required
  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                <textarea
    value={formulario.descricao}
    onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })}
    rows={4}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    placeholder="Descreva o figurino..."
    required
  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                  <select
    value={formulario.categoria}
    onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    required
  >
                    <option value="">Selecione...</option>
                    {categoriasLista.map((cat) => <option key={cat.id} value={cat.nome}>{cat.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho *</label>
                  <select
    value={formulario.tamanho}
    onChange={(e) => setFormulario({ ...formulario, tamanho: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    required
  >
                    <option value="">Selecione...</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                  <select
    value={formulario.tipo}
    onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    required
  >
                    <option value="">Selecione...</option>
                    {tiposLista.map((tipo) => <option key={tipo.id} value={tipo.nome}>{tipo.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Género *</label>
                  <select
    value={formulario.sexo}
    onChange={(e) => setFormulario({ ...formulario, sexo: e.target.value })}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    required
  >
                    <option value="">Selecione...</option>
                    {sexosLista.map((sexo) => <option key={sexo.id} value={sexo.nome}>{sexo.nome}</option>)}
                  </select>
                </div>
              </div>
            </form>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
    type="button"
    onClick={() => {
      setMostrarCriarModal(false);
      setModoFormulario("criar");
      setAnuncioEmRessubmissaoId(null);
      setImagensPreview([]);
      setImagensFicheiro([]);
      setFormulario({ titulo: "", descricao: "", tamanho: "", categoria: "", tipo: "", sexo: "" });
    }}
    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
  >
                Cancelar
              </button>
              <button
    onClick={handleSubmit}
    className="px-6 py-2 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-lg transition-all"
  >
                {modoFormulario === "ressubmeter" ? "Ressubmeter para Aprova\xE7\xE3o" : "Submeter An\xFAncio para Aprova\xE7\xE3o"}
              </button>
            </div>
          </div>
        </div>}

      {anuncioParaRemover && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Remover anúncio</h2>
              <p className="text-sm text-gray-700 mt-2">Tem a certeza que deseja remover o anúncio? Esta ação não é reversível.</p>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
    type="button"
    onClick={fecharConfirmacaoRemocao}
    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
  >
                Cancelar
              </button>
              <button
    type="button"
    onClick={confirmarRemocao}
    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
  >
                Confirmar
              </button>
            </div>
          </div>
        </div>}

      {anuncioParaRenovar && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Renovar anúncio</h2>
              <p className="text-sm text-gray-700 mt-2">Pretende renovar o seu anúncio por mais 30 dias?</p>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
    type="button"
    onClick={fecharConfirmacaoRenovacao}
    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
  >
                Cancelar
              </button>
              <button
    type="button"
    onClick={confirmarRenovacao}
    className="px-4 py-2 bg-fig-green hover:bg-fig-green/90 text-white rounded-lg transition-colors"
  >
                Confirmar
              </button>
            </div>
          </div>
        </div>}
    </div>;
}
export {
  Marketplace
};
