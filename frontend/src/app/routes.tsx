import { createBrowserRouter, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import { Layout } from "./components/layout";
import { isAuthenticated, getUtilizadorAtual } from "./lib/auth";

const Login = lazy(() => import("./pages/login").then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import("./pages/dashboard").then(m => ({ default: m.Dashboard })));
const Figurinos = lazy(() => import("./pages/figurinos").then(m => ({ default: m.Figurinos })));
const CriarFigurino = lazy(() => import("./pages/criar-figurino").then(m => ({ default: m.CriarFigurino })));
const AnunciosEscola = lazy(() => import("./pages/anuncios-escola").then(m => ({ default: m.AnunciosEscola })));
const Reservas = lazy(() => import("./pages/reservas").then(m => ({ default: m.Reservas })));
const Levantamento = lazy(() => import("./pages/levantamento").then(m => ({ default: m.Levantamento })));
const Devolucao = lazy(() => import("./pages/devolucao").then(m => ({ default: m.Devolucao })));
const Marketplace = lazy(() => import("./pages/marketplace").then(m => ({ default: m.Marketplace })));
const Perfil = lazy(() => import("./pages/perfil").then(m => ({ default: m.Perfil })));
const Administracao = lazy(() => import("./pages/administracao").then(m => ({ default: m.Administracao })));
const Ocorrencias = lazy(() => import("./pages/ocorrencias").then(m => ({ default: m.Ocorrencias })));
const Faturacao = lazy(() => import("./pages/faturacao").then(m => ({ default: m.Faturacao })));
const NaoEncontrado = lazy(() => import("./pages/nao-encontrado").then(m => ({ default: m.NaoEncontrado })));
const Carrinho = lazy(() => import("./pages/Carrinho").then(m => ({ default: m.Carrinho })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-4 border-fig-purple border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function FuncionarioRoute({ children }: { children: React.ReactNode }) {
  if (getUtilizadorAtual()?.tipo !== "funcionario") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

const s = (el: React.ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

export const router = createBrowserRouter([
  {
    path: "/login",
    element: s(<Login />),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: s(<Dashboard />) },
      { path: "carrinho", element: s(<Carrinho />) },
      { path: "figurinos", element: s(<Figurinos />) },
      { path: "figurinos/criar", element: s(<CriarFigurino />) },
      { path: "anuncios-escola", element: s(<AnunciosEscola />) },
      { path: "reservas", element: s(<Reservas />) },
      { path: "levantamento/:id", element: s(<Levantamento />) },
      { path: "devolucao/:id", element: s(<Devolucao />) },
      { path: "ocorrencias", element: s(<Ocorrencias />) },
      { path: "marketplace", element: s(<Marketplace />) },
      { path: "perfil", element: s(<Perfil />) },
      {
        path: "administracao",
        element: s(
          <FuncionarioRoute>
            <Administracao />
          </FuncionarioRoute>
        ),
      },
      { path: "faturacao", element: s(<Faturacao />) },
      { path: "*", element: s(<NaoEncontrado />) },
    ],
  },
]);
