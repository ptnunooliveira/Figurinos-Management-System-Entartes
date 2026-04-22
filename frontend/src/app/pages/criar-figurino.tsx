import { useState } from "react";
import { Upload, X, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { categorias, acessorios } from "../lib/dados-mock";
import { toast } from "sonner";

export function CriarFigurino() {
  const navigate = useNavigate();
  const [imagens, setImagens] = useState<string[]>([]);
  const [acessoriosSelecionados, setAcessoriosSelecionados] = useState<number[]>([]);
  const [novoAcessorio, setNovoAcessorio] = useState("");
  const [mostrarNovoAcessorio, setMostrarNovoAcessorio] = useState(false);

  const [formulario, setFormulario] = useState({
    nome: "",
    descricao: "",
    tamanho: "",
    localizacao: "",
    categoria: "",
    tipo: "",
    sexo: "",
    estado: "Muito Bom",
    valor_diario: "",
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

  const adicionarNovoAcessorio = () => {
    if (novoAcessorio.trim()) {
      // Em produção, isto criaria um novo acessório na base de dados
      toast.success(`Acessório "${novoAcessorio}" adicionado`);
      setNovoAcessorio("");
      setMostrarNovoAcessorio(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formulario.nome || !formulario.descricao || !formulario.categoria) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (imagens.length === 0) {
      toast.error("Por favor, adicione pelo menos uma imagem do figurino");
      return;
    }

    // Em produção, isto guardaria o figurino na base de dados
    toast.success("Figurino criado com sucesso!");
    setTimeout(() => navigate("/figurinos"), 1500);
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
                Nome do Figurino *
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
                  <option key={cat} value={cat}>{cat}</option>
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
                <option value="Vestido">Vestido</option>
                <option value="Fato Completo">Fato Completo</option>
                <option value="Casaco">Casaco</option>
                <option value="Calças">Calças</option>
                <option value="Acessório">Acessório</option>
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
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Unissexo">Unissexo</option>
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
                <option value="Muito Bom">Muito Bom</option>
                <option value="Bom">Bom</option>
                <option value="Razoável">Razoável</option>
                <option value="Precisa Reparação">Precisa Reparação</option>
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
                Valor Diário de Aluguer (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formulario.valor_diario}
                onChange={(e) => setFormulario({...formulario, valor_diario: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: 5.00"
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
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarNovoAcessorio())}
              />
              <button
                type="button"
                onClick={adicionarNovoAcessorio}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Adicionar
              </button>
            </div>
          )}

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
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            Guardar Figurino
          </button>
        </div>
      </form>
    </div>
  );
}
