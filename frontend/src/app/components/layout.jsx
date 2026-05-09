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
  AlertTriangle,
  ShoppingCart
} from "lucide-react";
import { useState } from "react";
import { getUtilizadorAtual, logout } from "../lib/auth";
import figLogo from "../../assets/fig-logo.png";
import { useCart } from "../pages/CartContext";
function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const utilizadorAtual = getUtilizadorAtual();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const navegacaoFuncionario = [
    { nome: "Painel", href: "/", icon: Home },
    { nome: "Figurinos", href: "/figurinos", icon: Shirt },
    { nome: "An\xFAncios Escola", href: "/anuncios-escola", icon: Megaphone },
    { nome: "Reservas", href: "/reservas", icon: Calendar },
    { nome: "Ocorr\xEAncias", href: "/ocorrencias", icon: AlertTriangle },
    { nome: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { nome: "Carrinho", href: "/carrinho", icon: ShoppingCart },
    { nome: "Fatura\xE7\xE3o", href: "/faturacao", icon: FileText },
    { nome: "Perfil", href: "/perfil", icon: User },
    { nome: "Administra\xE7\xE3o", href: "/administracao", icon: Settings }
  ];
  const navegacaoAluno = [
    { nome: "Painel", href: "/", icon: Home },
    { nome: "An\xFAncios Escola", href: "/anuncios-escola", icon: Megaphone },
    { nome: "Reservas", href: "/reservas", icon: Calendar },
    { nome: "Ocorr\xEAncias", href: "/ocorrencias", icon: AlertTriangle },
    { nome: "Marketplace", href: "/marketplace", icon: ShoppingBag },
    { nome: "Carrinho", href: "/carrinho", icon: ShoppingCart },
    { nome: "Perfil", href: "/perfil", icon: User }
  ];
  const isStaff = utilizadorAtual?.tipo === "funcionario" || utilizadorAtual?.tipo === "admin";
  const navegacao = isStaff ? navegacaoFuncionario : navegacaoAluno;
  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };
  const nomeUtilizador = utilizadorAtual?.nome ?? "";
  const iniciaisUtilizador = nomeUtilizador.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return <div className="min-h-screen bg-gray-50 flex lg:h-screen lg:overflow-hidden">
      {
    /* Sidebar Desktop */
  }
      <aside className="hidden lg:flex flex-col w-64 bg-[#3E2A47] border-r border-white/10 h-screen shrink-0">
        {
    /* Logo */
  }
        <Link to="/" className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-white/20">
            <img src={figLogo} alt="FigHappens" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FigHappens</h1>
            <p className="text-xs text-white/50">Gestão de Figurinos</p>
          </div>
        </Link>

        {
    /* Navegação */
  }
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
          {navegacao.map((item) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return <Link
      key={item.nome}
      to={item.href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? "text-white shadow-md" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
      style={active ? {
        background: "linear-gradient(135deg, var(--fig-magenta) 0%, var(--fig-purple) 100%)",
        color: "white"
      } : {}}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.color = "white";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = "";
          e.currentTarget.style.color = "";
        }
      }}
    >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.nome}</span>
                {item.nome === "Carrinho" && totalItems > 0 && <span className="ml-auto bg-gradient-to-r from-fig-purple to-fig-magenta text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>}
              </Link>;
  })}
        </nav>

        {
    /* Perfil & Logout */
  }
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {iniciaisUtilizador}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{nomeUtilizador}</p>
              <p className="text-xs text-white/50 capitalize">{(utilizadorAtual?.perfil ?? utilizadorAtual?.tipo ?? "").toLowerCase()}</p>
            </div>
          </div>
          <button
    onClick={handleLogout}
    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
  >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {
    /* Conteúdo Principal */
  }
      <div className="flex-1 flex flex-col min-h-screen relative lg:min-h-0 lg:h-screen">
        {
    /* Botão Carrinho Desktop (Superior Direito) */
  }

        {
    /* Header Mobile */
  }
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

              <div className="flex items-center gap-2">
                {(utilizadorAtual?.tipo === "aluno" || isStaff) && <Link to="/carrinho" className="relative p-2 text-gray-600 hover:text-fig-purple transition-colors">
                    <ShoppingCart className="w-6 h-6" />
                    {totalItems > 0 && <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-fig-purple to-fig-magenta text-[9px] font-bold text-white border-2 border-white">
                        {totalItems}
                      </span>}
                  </Link>}
                <button
    className="p-2 rounded-lg hover:bg-gray-100"
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
  >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
                </button>
              </div>
            </div>

            {
    /* Menu Mobile */
  }
            {mobileMenuOpen && <nav className="pt-4 space-y-1 border-t mt-4">
                {navegacao.map((item) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return <Link
      key={item.nome}
      to={item.href}
      onClick={() => setMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? "text-white" : "text-gray-600 hover:bg-fig-purple/10"}`}
      style={active ? {
        backgroundColor: "var(--fig-purple)",
        color: "white"
      } : {}}
    >
                      <Icon className="w-5 h-5" />
                      <span>{item.nome}</span>
                      {item.nome === "Carrinho" && totalItems > 0 && <span className="ml-auto bg-gradient-to-r from-fig-purple to-fig-magenta text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {totalItems}
                        </span>}
                    </Link>;
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
                      <p className="text-sm text-gray-500 capitalize">{(utilizadorAtual?.perfil ?? utilizadorAtual?.tipo ?? "").toLowerCase()}</p>
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
              </nav>}
          </div>
        </header>

        {
    /* Conteúdo */
  }
        <main className="flex-1 p-3 lg:p-4 lg:overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {
    /* Rodapé */
  }
        <footer className="bg-white border-t mt-auto">
          <div className="px-4 py-6">
            <p className="text-center text-sm text-gray-500">
              © 2026 FigHappens - Sistema de Gestão de Figurinos
            </p>
          </div>
        </footer>
      </div>
    </div>;
}
export {
  Layout
};
