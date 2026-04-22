import { Link } from "react-router";
import { Home, Search } from "lucide-react";

export function NaoEncontrado() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-purple-600 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">Página não encontrada</h2>
          <p className="text-gray-600">
            A página que procura não existe ou foi movida.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Link>
          <Link
            to="/figurinos"
            className="flex items-center gap-2 border border-purple-600 text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5" />
            Explorar Figurinos
          </Link>
        </div>
      </div>
    </div>
  );
}
