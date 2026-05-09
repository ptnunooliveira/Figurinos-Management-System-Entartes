import { useState } from "react";
import { User, Mail, Phone, Calendar, X } from "lucide-react";
import { getUtilizadorAtual } from "../lib/auth";
import { updateUser } from "../lib/services";
import { toast } from "sonner";
function formatarPerfil(perfil) {
  switch (perfil) {
    case "ADMIN":
      return "Administrador";
    case "FUNCIONARIO":
      return "Funcion\xE1rio";
    case "ALUNO":
      return "Aluno";
    default:
      return perfil ?? "";
  }
}
function Perfil() {
  const utilizadorAtual = getUtilizadorAtual();
  const [editarAberto, setEditarAberto] = useState(false);
  const [nome, setNome] = useState(utilizadorAtual?.nome ?? "");
  const [email, setEmail] = useState(utilizadorAtual?.email ?? "");
  const [contacto, setContacto] = useState(utilizadorAtual?.contacto ?? "");
  if (!utilizadorAtual) {
    return <div className="text-gray-500">Não autenticado.</div>;
  }
  const dataRegistoValida = utilizadorAtual.data_registo && !Number.isNaN(new Date(utilizadorAtual.data_registo).getTime());
  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      await updateUser(utilizadorAtual.id, { nome, email, contacto });
      toast.success("Perfil atualizado com sucesso!");
      setEditarAberto(false);
    } catch (err) {
      toast.error(err.message || "Erro ao atualizar perfil");
    }
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">O Meu Perfil</h1>
        <p className="text-gray-600">Gerencie as suas informações pessoais</p>
      </div>

      <div className="max-w-md">
        {
    /* Cartão de Perfil */
  }
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-fig-purple to-fig-magenta rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">
                {utilizadorAtual.nome.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{utilizadorAtual.nome}</h2>
            <p className="text-sm text-gray-500 mb-4">{formatarPerfil(utilizadorAtual.perfil)}</p>
            
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 truncate">{utilizadorAtual.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Contacto</p>
                  <p className="text-sm text-gray-900">{utilizadorAtual.contacto}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Membro desde</p>
                  <p className="text-sm text-gray-900">
                    {dataRegistoValida ? new Date(utilizadorAtual.data_registo).toLocaleDateString("pt-PT", {
    year: "numeric",
    month: "long"
  }) : "\u2014"}
                  </p>
                </div>
              </div>

              {utilizadorAtual.numero_aluno && <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Número de Aluno</p>
                    <p className="text-sm text-gray-900">{utilizadorAtual.numero_aluno}</p>
                  </div>
                </div>}

              {utilizadorAtual.n_mecanografico && <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">N.º Mecanográfico</p>
                    <p className="text-sm text-gray-900">{utilizadorAtual.n_mecanografico}</p>
                  </div>
                </div>}

              {utilizadorAtual.cargo && <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Cargo</p>
                    <p className="text-sm text-gray-900">{utilizadorAtual.cargo}</p>
                  </div>
                </div>}
            </div>

            <button
    onClick={() => {
      setNome(utilizadorAtual.nome);
      setEmail(utilizadorAtual.email);
      setContacto(utilizadorAtual.contacto);
      setEditarAberto(true);
    }}
    className="w-full mt-6 text-white py-2 px-4 rounded-lg transition-all hover:opacity-90"
    style={{ background: "linear-gradient(135deg, var(--fig-magenta) 0%, var(--fig-purple) 100%)" }}
  >
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {editarAberto && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Editar Perfil</h2>
              <button onClick={() => setEditarAberto(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
    type="text"
    value={nome}
    onChange={(e) => setNome(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
    required
    disabled={utilizadorAtual?.tipo === "aluno"}
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
    required
  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                <input
    type="text"
    value={contacto}
    onChange={(e) => setContacto(e.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fig-purple focus:border-transparent"
  />
              </div>
              <div className="flex gap-3 pt-2">
                <button
    type="button"
    onClick={() => setEditarAberto(false)}
    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
  >
                  Cancelar
                </button>
                <button
    type="submit"
    className="flex-1 px-4 py-2 text-white rounded-lg transition-all hover:opacity-90"
    style={{ background: "linear-gradient(135deg, var(--fig-magenta) 0%, var(--fig-purple) 100%)" }}
  >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>}
    </div>;
}
export {
  Perfil
};
