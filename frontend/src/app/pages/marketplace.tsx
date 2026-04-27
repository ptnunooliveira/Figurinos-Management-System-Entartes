import { useState, useEffect } from "react";
import { Plus, ShoppingBag, Clock, CheckCircle, XCircle, Shirt, Upload, X, Search, Filter } from "lucide-react";
import { getUtilizadorAtual } from "../lib/auth";
import { getMarketplace, getMarketplaceGestao, getMarketplaceDoUtilizador, criarAnuncioMarketplace, getCategorias } from "../lib/services";
import type { AuxiliarItem } from "../lib/services";
import type { AnuncioMarketplace } from "../lib/dados-mock";
import { toast } from "sonner";

export function Marketplace() {
  const utilizadorAtual = getUtilizadorAtual();
  const [abaAtiva, setAbaAtiva] = useState<"explorar" | "meusAnuncios">("explorar");
  const [mostrarCriarModal, setMostrarCriarModal] = useState(false);
  const [imagens, setImagens] = useState<string[]>([]);
  const [termoPesquisa, setTermoPesquisa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("todas");
  const [estadoSelecionado, setEstadoSelecionado] = useState<string>("todos");

  const [todosAnuncios, setTodosAnuncios] = useState<AnuncioMarketplace[]>([]);
  const [meusAnunciosLista, setMeusAnunciosLista] = useState<AnuncioMarketplace[]>([]);
  const [categoriasLista, setCategoriasLista] = useState<AuxiliarItem[]>([]);

  const [formulario, setFormulario] = useState({
    titulo: "",
    descricao: "",
    tamanho: "",
    categoria: "",
    tipo: "",
    sexo: "",
  });

  useEffect(() => {
    getCategorias().then(setCategoriasLista);
    if (utilizadorAtual?.tipo === 'funcionario') {
      getMarketplaceGestao().then(setTodosAnuncios);
    } else {
      getMarketplace().then(setTodosAnuncios);
      if (utilizadorAtual?.id) {
        getMarketplaceDoUtilizador(utilizadorAtual.id).then(setMeusAnunciosLista);
      }
    }
  }, [utilizadorAtual?.tipo, utilizadorAtual?.id]);

  const meusAnuncios = meusAnunciosLista;
  const outrosAnuncios = todosAnuncios.filter(a => a.id_utilizador !== utilizadorAtual?.id);

  const anunciosAMostrar = utilizadorAtual?.tipo === 'funcionario'
    ? todosAnuncios
    : (abaAtiva === "explorar" ? outrosAnuncios : meusAnuncios);

  const anunciosFiltrados = anunciosAMostrar.filter(anuncio => {
    const matchTermo = anuncio.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
                       anuncio.descricao.toLowerCase().includes(termoPesquisa.toLowerCase());
    const matchCategoria = categoriaSelecionada === "todas" || anuncio.categoria === categoriaSelecionada;
    const matchEstado = estadoSelecionado === "todos" || anuncio.estado === estadoSelecionado;
    return matchTermo && matchCategoria && matchEstado;
  });

  const getCorEstado = (estado: string) => {
    switch (estado) {
      case "Aprovado":
        return "text-green-700 bg-green-100";
      case "Pendente":
        return "text-yellow-700 bg-yellow-100";
      case "Rejeitado":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getIconeEstado = (estado: string) => {
    switch (estado) {
      case "Aprovado":
        return CheckCircle;
      case "Pendente":
        return Clock;
      case "Rejeitado":
        return XCircle;
      default:
        return Clock;
    }
  };

  const handleImagemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ficheiros = e.target.files;
    if (!ficheiros) return;

    if (imagens.length + ficheiros.length > 5) {
      toast.error("Máximo de 5 imagens por anúncio");
      return;
    }

    Array.from(ficheiros).forEach(ficheiro => {
      if (ficheiro.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImagens(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(ficheiro);
      }
    });
  };

  const removerImagem = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formulario.titulo || !formulario.descricao || !formulario.categoria) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (imagens.length === 0) {
      toast.error("Por favor, adicione pelo menos uma imagem");
      return;
    }

    try {
      const categoriaObj = categoriasLista.find(c => c.nome === formulario.categoria);
      await criarAnuncioMarketplace({
        titulo: formulario.titulo,
        descricao: formulario.descricao,
        tamanho: formulario.tamanho,
        id_categoria: categoriaObj?.id ?? null,
        id_tipo: null,
        id_sexo: null,
      });
      toast.success("Anúncio submetido para aprovação!");
      setMostrarCriarModal(false);
      setFormulario({ titulo: "", descricao: "", tamanho: "", categoria: "", tipo: "", sexo: "" });
      setImagens([]);
      if (utilizadorAtual?.id) {
        getMarketplaceDoUtilizador(utilizadorAtual.id).then(setMeusAnunciosLista);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar anúncio");
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">
            {utilizadorAtual?.tipo === 'funcionario'
              ? 'Gerir anúncios submetidos pelos alunos'
              : 'Partilhe ou encontre figurinos na comunidade'}
          </p>
        </div>
        {utilizadorAtual?.tipo === 'aluno' && (
          <button
            onClick={() => setMostrarCriarModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Criar Anúncio
          </button>
        )}
      </div>

      {/* Abas */}
      {utilizadorAtual?.tipo === 'aluno' && (
        <div className="bg-white rounded-xl shadow-sm p-1 inline-flex gap-1">
          <button
            onClick={() => setAbaAtiva("explorar")}
            className={`px-6 py-2 rounded-lg transition-colors ${
              abaAtiva === "explorar"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ShoppingBag className="w-4 h-4 inline mr-2" />
            Explorar ({outrosAnuncios.length})
          </button>
          <button
            onClick={() => setAbaAtiva("meusAnuncios")}
            className={`px-6 py-2 rounded-lg transition-colors ${
              abaAtiva === "meusAnuncios"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Os Meus Anúncios ({meusAnuncios.length})
          </button>
        </div>
      )}

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
            placeholder="Pesquisar anúncios..."
          />
        </div>

        {/* Filtros em Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <option value="todas">Todas as Categorias</option>
              {categoriasLista.map(cat => (
                <option key={cat.id} value={cat.nome}>{cat.nome}</option>
              ))}
            </select>
          </div>

          {(utilizadorAtual?.tipo === 'funcionario' || abaAtiva === 'meusAnuncios') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={estadoSelecionado}
                onChange={(e) => setEstadoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="todos">Todos os Estados</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Pendente">Pendente</option>
                <option value="Rejeitado">Rejeitado</option>
              </select>
            </div>
          )}
        </div>

        {/* Contagem de Resultados */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-gray-600">
            {anunciosFiltrados.length} anúncio{anunciosFiltrados.length !== 1 ? 's' : ''} encontrado{anunciosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Grelha de Anúncios */}
      <div className="space-y-4">
        {anunciosFiltrados.map((anuncio) => {
          const IconeEstado = getIconeEstado(anuncio.estado);
          return (
            <div key={anuncio.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-0 sm:gap-6">
                {/* Imagem/Ícone */}
                <div className="w-full sm:w-32 h-32 bg-gradient-to-br from-fig-purple/10 via-fig-magenta/10 to-fig-green/10 flex items-center justify-center flex-shrink-0 relative">
                  <Shirt className="w-16 h-16 text-fig-purple/30" />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 p-5 sm:py-5 sm:pr-5 sm:pl-0">
                  <div className="flex flex-col h-full">
                    {/* Cabeçalho */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{anuncio.titulo}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{anuncio.descricao}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-fig-purple/10 text-fig-purple text-xs rounded-full font-medium">
                        {anuncio.categoria}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                        {anuncio.tamanho}
                      </span>
                      {(utilizadorAtual?.tipo === 'funcionario' || abaAtiva === "meusAnuncios") && (
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCorEstado(anuncio.estado)}`}>
                          <IconeEstado className="w-3 h-3" />
                          {anuncio.estado}
                        </span>
                      )}
                    </div>

                    {/* Informação adicional */}
                    <div className="text-xs text-gray-500 mb-3">
                      Submetido em {new Date(anuncio.data_anuncio).toLocaleDateString('pt-PT')}
                    </div>

                    {/* Motivo de rejeição (se existir) */}
                    {anuncio.motivo_rejeicao && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-700">
                          <strong>Motivo da rejeição:</strong> {anuncio.motivo_rejeicao}
                        </p>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="mt-auto pt-3 border-t">
                      {abaAtiva === "explorar" ? (
                        <button className="w-full sm:w-auto bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg text-white py-2 px-6 rounded-lg transition-all">
                          Ver Detalhes
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                            Editar
                          </button>
                          <button className="flex-1 border border-red-300 text-red-700 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors">
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado Vazio */}
      {anunciosFiltrados.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {abaAtiva === "explorar" ? "Nenhum anúncio disponível" : "Ainda não tem anúncios"}
          </h3>
          <p className="text-gray-600 mb-6">
            {abaAtiva === "explorar"
              ? "Não há anúncios disponíveis no momento."
              : "Crie o seu primeiro anúncio e comece a partilhar!"}
          </p>
          {abaAtiva === "meusAnuncios" && (
            <button
              onClick={() => setMostrarCriarModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Anúncio
            </button>
          )}
        </div>
      )}

      {/* Modal de Criar Anúncio */}
      {mostrarCriarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-gray-900">Criar Novo Anúncio</h2>
              <p className="text-sm text-gray-600 mt-1">Partilhe o seu figurino com a comunidade</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Upload de Imagens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotografias do Figurino * (máximo 5)
                </label>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {imagens.map((imagem, index) => (
                    <div key={index} className="relative group aspect-square">
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
                    </div>
                  ))}

                  {imagens.length < 5 && (
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600">Adicionar</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImagemUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-gray-500">JPG, PNG ou WEBP</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                <input
                  type="text"
                  value={formulario.titulo}
                  onChange={(e) => setFormulario({...formulario, titulo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Vestido de Festa Anos 50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição *</label>
                <textarea
                  value={formulario.descricao}
                  onChange={(e) => setFormulario({...formulario, descricao: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descreva o figurino..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
                  <select
                    value={formulario.categoria}
                    onChange={(e) => setFormulario({...formulario, categoria: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    {categoriasLista.map(cat => (
                      <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho *</label>
                  <select
                    value={formulario.tamanho}
                    onChange={(e) => setFormulario({...formulario, tamanho: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    onChange={(e) => setFormulario({...formulario, tipo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Vestido">Vestido</option>
                    <option value="Fato Completo">Fato Completo</option>
                    <option value="Acessório">Acessório</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Género *</label>
                  <select
                    value={formulario.sexo}
                    onChange={(e) => setFormulario({...formulario, sexo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Unissexo">Unissexo</option>
                  </select>
                </div>
              </div>
            </form>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setMostrarCriarModal(false);
                  setImagens([]);
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
                Submeter Anúncio para Aprovação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
