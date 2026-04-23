import { useState } from "react";
import { useNavigate } from "react-router";
import { LogIn } from "lucide-react";
import { login } from "../lib/auth";
import { toast } from "sonner";
import figLogo from "../../assets/fig-logo.png";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const utilizador = await login(email, password);

    if (utilizador) {
      toast.success(`Bem-vindo, ${utilizador.nome}!`);
      navigate("/");
      window.location.reload();
    } else {
      toast.error("Email ou palavra-passe incorretos. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fig-purple via-fig-dark to-fig-magenta flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl p-3 flex items-center justify-center">
              <img src={figLogo} alt="FigHappens" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">FigHappens</h1>
          <p className="text-fig-green-light text-lg">
            Sistema de Gestão de Figurinos
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent transition-all"
                placeholder="seu.email@escola.pt"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-fig-purple to-fig-magenta hover:shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A entrar...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
