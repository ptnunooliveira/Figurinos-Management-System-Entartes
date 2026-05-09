import { useState, useEffect } from "react";
import { UserPlus, Eye, EyeOff, Tag, Layers, Plus, Check } from "lucide-react";
import {
  criarUtilizador,
  getCategorias,
  getTiposFigurino,
  criarCategoria,
  criarTipoFigurino,
  type AuxiliarItem,
} from "../lib/services";
import { getUtilizadorAtual } from "../lib/auth";
import { toast } from "sonner";

// Painel reutilizável para gerir uma lista de itens auxiliares
function PainelGestao({
  titulo,
  icone: Icone,
  itens,
  placeholder,
  onCriar,
}: {
  titulo: string;
  icone: React.ElementType;
  itens: AuxiliarItem[];
  placeholder: string;
  onCriar: (nome: string) => Promise<void>;
}) {
  const [nome, setNome] = useState("");
  const [aCriar, setACriar] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomeTrimmed = nome.trim();
    if (!nomeTrimmed || aCriar) return;
    setACriar(true);
    try {
      await onCriar(nomeTrimmed);
      setNome("");
    } finally {
      setACriar(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-lg flex items-center justify-center">
          <Icone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
          <p className="text-sm text-gray-500">{itens.length} existente{itens.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Lista de itens existentes */}
      {itens.length > 0 && (
        <div className="mb-4 max-h-40 overflow-y-auto space-y-1">
          {itens.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
            >
              <Check className="w-3.5 h-3.5 text-fig-purple shrink-0" />
              {item.nome}
            </div>
          ))}
        </div>
      )}

      {/* Formulário para criar novo */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fig-purple focus:border-transparent"
        />
        <button
          type="submit"
          disabled={aCriar || !nome.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg text-sm font-medium hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {aCriar ? "A criar..." : "Criar"}
        </button>
      </form>
    </div>
  );
}

export function Administracao() {
  const utilizadorAtual = getUtilizadorAtual();
  const isAdmin = utilizadorAtual?.perfil === "ADMIN";

  const perfisDisponiveis = isAdmin
    ? [
        { value: "ALUNO", label: "Aluno" },
        { value: "FUNCIONARIO", label: "Funcionário" },
      ]
    : [{ value: "ALUNO", label: "Aluno" }];

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [perfil, setPerfil] = useState("ALUNO");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [submetendo, setSubmetendo] = useState(false);

  const [categorias, setCategorias] = useState<AuxiliarItem[]>([]);
  const [tipos, setTipos] = useState<AuxiliarItem[]>([]);

  useEffect(() => {
    getCategorias().then(setCategorias);
    getTiposFigurino().then(setTipos);
  }, []);

  const limparFormulario = () => {
    setNome("");
    setEmail("");
    setPassword("");
    setPerfil("ALUNO");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submetendo) return;
    if (!nome.trim() || !email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setSubmetendo(true);
    try {
      await criarUtilizador({ nome: nome.trim(), email: email.trim(), password, perfil });
      toast.success(`${perfil === "ALUNO" ? "Aluno" : "Funcionário"} criado com sucesso`);
      limparFormulario();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar utilizador");
    } finally {
      setSubmetendo(false);
    }
  };

  const handleCriarCategoria = async (nomeCat: string) => {
    try {
      const nova = await criarCategoria(nomeCat);
      setCategorias((prev) =>
        [...prev, nova].sort((a, b) => a.nome.localeCompare(b.nome))
      );
      toast.success(`Categoria "${nova.nome}" criada com sucesso`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar categoria");
    }
  };

  const handleCriarTipo = async (nomeTipo: string) => {
    try {
      const novo = await criarTipoFigurino(nomeTipo);
      setTipos((prev) =>
        [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome))
      );
      toast.success(`Tipo "${novo.nome}" criado com sucesso`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar tipo de figurino");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administração</h1>
        <p className="text-gray-600">Gestão de utilizadores e dados do sistema</p>
      </div>

      {/* Criar Utilizador */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Utilizadores</h2>
        <div className="max-w-lg">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Criar Utilizador</h3>
                <p className="text-sm text-gray-500">
                  {isAdmin ? "Crie alunos ou funcionários" : "Crie um novo aluno"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de utilizador
                  </label>
                  <div className="flex gap-3">
                    {perfisDisponiveis.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPerfil(p.value)}
                        className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                          perfil === p.value
                            ? "border-fig-purple text-fig-purple bg-fig-purple/5"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                  placeholder="Ex: Maria Silva"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                  placeholder="exemplo@escola.pt"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={limparFormulario}
                  disabled={submetendo}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
                >
                  Limpar
                </button>
                <button
                  type="submit"
                  disabled={submetendo}
                  className="flex-1 py-3 bg-gradient-to-r from-fig-purple to-fig-magenta text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                >
                  {submetendo ? "A criar..." : `Criar ${perfil === "ALUNO" ? "Aluno" : "Funcionário"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Gestão de Figurinos */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Dados de Figurinos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <PainelGestao
            titulo="Categorias"
            icone={Tag}
            itens={categorias}
            placeholder="Ex: Época Medieval"
            onCriar={handleCriarCategoria}
          />
          <PainelGestao
            titulo="Tipos de Figurino"
            icone={Layers}
            itens={tipos}
            placeholder="Ex: Vestido"
            onCriar={handleCriarTipo}
          />
        </div>
      </div>
    </div>
  );
}
