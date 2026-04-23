import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/layout";
import { Login } from "./pages/login";
import { Dashboard } from "./pages/dashboard";
import { Figurinos } from "./pages/figurinos";
import { CriarFigurino } from "./pages/criar-figurino";
import { AnunciosEscola } from "./pages/anuncios-escola";
import { Reservas } from "./pages/reservas";
import { Levantamento } from "./pages/levantamento";
import { Devolucao } from "./pages/devolucao";
import { Marketplace } from "./pages/marketplace";
import { Perfil } from "./pages/perfil";
import { Administracao } from "./pages/administracao";
import { Faturacao } from "./pages/faturacao";
import { NaoEncontrado } from "./pages/nao-encontrado";
import { isAuthenticated } from "./lib/auth";

// Componente de proteção de rota
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true, 
        element: <Dashboard />,
      },
      { 
        path: "figurinos", 
        element: <Figurinos />,
      },
      { 
        path: "figurinos/criar", 
        element: <CriarFigurino />,
      },
      { 
        path: "anuncios-escola", 
        element: <AnunciosEscola />,
      },
      { 
        path: "reservas", 
        element: <Reservas />,
      },
      { 
        path: "levantamento/:id", 
        element: <Levantamento />,
      },
      { 
        path: "devolucao/:id", 
        element: <Devolucao />,
      },
      { 
        path: "marketplace", 
        element: <Marketplace />,
      },
      { 
        path: "perfil", 
        element: <Perfil />,
      },
      { 
        path: "administracao", 
        element: <Administracao />,
      },
      { 
        path: "faturacao", 
        element: <Faturacao />,
      },
      { 
        path: "*", 
        element: <NaoEncontrado />,
      },
    ],
  },
]);
