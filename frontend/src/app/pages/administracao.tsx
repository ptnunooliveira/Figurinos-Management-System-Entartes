import { useState } from "react";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { criarUtilizador } from "../lib/services";
import { getUtilizadorAtual } from "../lib/auth";
import { toast } from "sonner";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administração</h1>
        <p className="text-gray-600">Gestão de utilizadores do sistema</p>
      </div>

      <div className="max-w-lg">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Criar Utilizador</h2>
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
  );
}
