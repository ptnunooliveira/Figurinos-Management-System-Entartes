import { useState, useEffect } from "react";
import { Upload, X, Plus, Save, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  getCategorias, getTiposFigurino, getSexos, getEstadosCondicao, getAcessorios,
  criarAcessorio,
  type AuxiliarItem,
} from "../lib/services";
import { apiFetch } from "../lib/api";
import { toast } from "sonner";

export function CriarFigurino() {
  const navigate = useNavigate();
  const [imagens, setImagens] = useState<string[]>([]);
  const [acessoriosSelecionados, setAcessoriosSelecionados] = useState<number[]>([]);
  const [novoAcessorio, setNovoAcessorio] = useState("");
  const [mostrarNovoAcessorio, setMostrarNovoAcessorio] = useState(false);
  const [aCriarAcessorio, setACriarAcessorio] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);

  const [categorias, setCategorias] = useState<AuxiliarItem[]>([]);
  const [tipos, setTipos] = useState<AuxiliarItem[]>([]);
  const [sexos, setSexos] = useState<AuxiliarItem[]>([]);
  const [estadosCondicao, setEstadosCondicao] = useState<AuxiliarItem[]>([]);
  const [acessorios, setAcessorios] = useState<AuxiliarItem[]>([]);

  useEffect(() => {
    getCategorias().then(setCategorias);
    getTiposFigurino().then(setTipos);
    getSexos().then(setSexos);
    getEstadosCondicao().then(setEstadosCondicao);
    getAcessorios().then(setAcessorios);
  }, []);

  const [formulario, setFormulario] = useState({
    nome: "",
    descricao: "",
    tamanho: "",
    localizacao: "",
    categoria: "",
    tipo: "",
    sexo: "",
    estado: "",
    quantidade_stock: "1",
  });

  const handleImagemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ficheiros = e.target.files;
    if (!ficheiros) return;

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

  const toggleAcessorio = (idAcessorio: number) => {
    setAcessoriosSelecionados(prev => 
      prev.includes(idAcessorio)
        ? prev.filter(id => id !== idAcessorio)
        : [...prev, idAcessorio]
    );
  };

  const adicionarNovoAcessorio = async () => {
    const nome = novoAcessorio.trim().replace(/\s+/g, " ");
    if (!nome || aCriarAcessorio) return;

    const existente = acessorios.find(
      (acessorio) => acessorio.nome.trim().toLowerCase() === nome.toLowerCase()
    );

    if (existente) {
      setAcessoriosSelecionados(prev => prev.includes(existente.id) ? prev : [...prev, existente.id]);
      setNovoAcessorio("");
      setMostrarNovoAcessorio(false);
      toast.info(`O acessório "${existente.nome}" já existia e foi selecionado.`);
      return;
    }

    setACriarAcessorio(true);
    try {
      const novo = await criarAcessorio(nome);
      setAcessorios(prev => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
      setAcessoriosSelecionados(prev => prev.includes(novo.id) ? prev : [...prev, novo.id]);
      setNovoAcessorio("");
      setMostrarNovoAcessorio(false);
      toast.success(`Acessório "${novo.nome}" criado e selecionado.`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar acessório");
    } finally {
      setACriarAcessorio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (aGuardar) return;

    if (!formulario.nome || !formulario.descricao || !formulario.categoria) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setAGuardar(true);
    try {
      const res = await apiFetch('/figurinos', {
        method: 'POST',
        body: JSON.stringify({
          titulo: formulario.nome.trim(),
          descricao: formulario.descricao.trim(),
          tamanho: formulario.tamanho || null,
          localizacao: formulario.localizacao || null,
          id_categoria: formulario.categoria ? parseInt(formulario.categoria) : null,
          id_tipo: formulario.tipo ? parseInt(formulario.tipo) : null,
          id_sexo: formulario.sexo ? parseInt(formulario.sexo) : null,
          id_estado_figurino: formulario.estado ? parseInt(formulario.estado) : null,
          quantidade_stock: Math.max(0, parseInt(formulario.quantidade_stock) || 0),
          id_acessorios: acessoriosSelecionados,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.erro ?? 'Erro ao criar figurino');
        return;
      }

      toast.success("Figurino criado com sucesso!");
      setTimeout(() => navigate("/figurinos"), 1000);
    } catch (err: any) {
      toast.error(err.message || "Erro de ligação ao servidor");
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/figurinos" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Figurinos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Criar Novo Figurino</h1>
          <p className="text-gray-600">Adicione um novo figurino ao catálogo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload de Imagens */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fotografias do Figurino *</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
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
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {/* Botão de upload */}
            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Adicionar</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagemUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">Pode adicionar múltiplas imagens. Formatos aceites: JPG, PNG, WEBP</p>
        </div>

        {/* Informação Básica */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informação Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título do Figurino *
              </label>
              <input
                type="text"
                value={formulario.nome}
                onChange={(e) => setFormulario({...formulario, nome: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Vestido Vitoriano Azul"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={formulario.descricao}
                onChange={(e) => setFormulario({...formulario, descricao: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Descreva o figurino em detalhe..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formulario.categoria}
                onChange={(e) => setFormulario({...formulario, categoria: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                value={formulario.tipo}
                onChange={(e) => setFormulario({...formulario, tipo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {tipos.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho *
              </label>
              <select
                value={formulario.tamanho}
                onChange={(e) => setFormulario({...formulario, tamanho: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género *
              </label>
              <select
                value={formulario.sexo}
                onChange={(e) => setFormulario({...formulario, sexo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {sexos.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado do Figurino *
              </label>
              <select
                value={formulario.estado}
                onChange={(e) => setFormulario({...formulario, estado: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                {estadosCondicao.map(e => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização *
              </label>
              <input
                type="text"
                value={formulario.localizacao}
                onChange={(e) => setFormulario({...formulario, localizacao: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Armazém A - Prateleira 12"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formulario.quantidade_stock}
                onChange={(e) => setFormulario({...formulario, quantidade_stock: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

          </div>
        </div>

        {/* Acessórios */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Acessórios Incluídos</h2>
            <button
              type="button"
              onClick={() => setMostrarNovoAcessorio(!mostrarNovoAcessorio)}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Novo Acessório
            </button>
          </div>

          {mostrarNovoAcessorio && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={novoAcessorio}
                onChange={(e) => setNovoAcessorio(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Nome do novo acessório"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void adicionarNovoAcessorio();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => void adicionarNovoAcessorio()}
                disabled={aCriarAcessorio || !novoAcessorio.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aCriarAcessorio ? "A adicionar..." : "Adicionar"}
              </button>
            </div>
          )}

          {acessorios.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Nenhum acessório disponível</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {acessorios.map(acessorio => (
                <label
                  key={acessorio.id}
                  className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    acessoriosSelecionados.includes(acessorio.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={acessoriosSelecionados.includes(acessorio.id)}
                    onChange={() => toggleAcessorio(acessorio.id)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-900">{acessorio.nome}</span>
                </label>
              ))}
            </div>
          )}

          {acessoriosSelecionados.length > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              {acessoriosSelecionados.length} acessório{acessoriosSelecionados.length !== 1 ? 's' : ''} selecionado{acessoriosSelecionados.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/figurinos"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={aGuardar}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {aGuardar ? "A guardar..." : "Guardar Figurino"}
          </button>
        </div>
      </form>
    </div>
  );
}
