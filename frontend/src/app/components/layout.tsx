import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Home,
  Shirt,
  Calendar,
  ShoppingBag,
  User,
  Settings,
  Menu,
  X,
  FileText,
  LogOut,
  Megaphone,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { getUtilizadorAtual, logout } from "../lib/auth";
import figLogo from "../../assets/fig-logo.png";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const utilizadorAtual = getUtilizadorAtual();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navegacaoFuncionario = [
    { nome: "Painel", href: "/", icon: Home },
    { nome: "Figurinos", href: "/figurinos", icon: Shirt },
    { nome: "Anúncios Escola", href: "/anuncios-escola", icon: Megaphone },
    { nome: "Reservas", href: "/reservas", icon: Calendar },
    { nome: "Ocorrências", href: "/ocorrencias", icon: AlertTriangle },
    { nome: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { nome: "Administração", href: "/administracao", icon: Settings },
    { nome: "Faturação", href: "/faturacao", icon: FileText },
    { nome: "Perfil", href: "/perfil", icon: User },
  ];

  const navegacaoAluno = [
    { nome: "Painel", href: "/", icon: Home },
    { nome: "Figurinos Escola", href: "/figurinos", icon: Shirt },
    { nome: "Reservas", href: "/reservas", icon: Calendar },
    { nome: "Ocorrências", href: "/ocorrencias", icon: AlertTriangle },
    { nome: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { nome: "Perfil", href: "/perfil", icon: User },
  ];

  const navegacao = utilizadorAtual?.tipo === "funcionario"
    ? navegacaoFuncionario
    : navegacaoAluno;

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const nomeUtilizador = utilizadorAtual?.nome ?? '';
  const iniciaisUtilizador = nomeUtilizador.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r min-h-screen sticky top-0">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 p-6 border-b">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img src={figLogo} alt="FigHappens" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">FigHappens</h1>
            <p className="text-xs text-gray-500">Gestão de Figurinos</p>
          </div>
        </Link>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navegacao.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.nome}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? 'text-white shadow-md'
                    : 'text-gray-600 hover:bg-fig-magenta/10 hover:text-fig-magenta'
                }`}
                style={active ? {
                  background: 'linear-gradient(135deg, var(--fig-magenta) 0%, var(--fig-purple) 100%)',
                  color: 'white'
                } : {}}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--fig-magenta)20';
                    e.currentTarget.style.color = 'var(--fig-magenta)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = '';
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.nome}</span>
              </Link>
            );
          })}
        </nav>

        {/* Perfil & Logout */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {iniciaisUtilizador}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{nomeUtilizador}</p>
              <p className="text-xs text-gray-500 capitalize">{utilizadorAtual?.tipo}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-fig-magenta hover:bg-fig-magenta/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden bg-white shadow-sm sticky top-0 z-50">
          <div className="px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img src={figLogo} alt="FigHappens" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">FigHappens</h1>
                  <p className="text-xs text-gray-500">Gestão de Figurinos</p>
                </div>
              </Link>

              <button
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>

            {/* Menu Mobile */}
            {mobileMenuOpen && (
              <nav className="pt-4 space-y-1 border-t mt-4">
                {navegacao.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.nome}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'text-white'
                          : 'text-gray-600 hover:bg-fig-purple/10'
                      }`}
                      style={active ? {
                        backgroundColor: 'var(--fig-purple)',
                        color: 'white'
                      } : {}}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.nome}</span>
                    </Link>
                  );
                })}

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {iniciaisUtilizador}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{nomeUtilizador}</p>
                      <p className="text-sm text-gray-500 capitalize">{utilizadorAtual?.tipo}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 mt-2 text-gray-600 hover:text-fig-magenta hover:bg-fig-magenta/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Terminar Sessão</span>
                  </button>
                </div>
              </nav>
            )}
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Rodapé */}
        <footer className="bg-white border-t mt-auto">
          <div className="px-4 py-6">
            <p className="text-center text-sm text-gray-500">
              © 2026 FigHappens - Sistema de Gestão de Figurinos
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
