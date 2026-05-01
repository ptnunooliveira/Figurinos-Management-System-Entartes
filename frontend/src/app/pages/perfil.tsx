import { useState } from "react";
import { User, Mail, Phone, Calendar, X } from "lucide-react";
import { getUtilizadorAtual } from "../lib/auth";
import { updateUser } from "../lib/services";
import { toast } from "sonner";

export function Perfil() {
  const utilizadorAtual = getUtilizadorAtual();
  const [editarAberto, setEditarAberto] = useState(false);
  const [nome, setNome] = useState(utilizadorAtual?.nome ?? '');
  const [email, setEmail] = useState(utilizadorAtual?.email ?? '');
  const [contacto, setContacto] = useState(utilizadorAtual?.contacto ?? '');

  if (!utilizadorAtual) {
    return <div className="text-gray-500">Não autenticado.</div>;
  }

  const dataRegistoValida = utilizadorAtual.data_registo && !Number.isNaN(new Date(utilizadorAtual.data_registo).getTime());

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(utilizadorAtual.id, { nome, email, contacto });
      toast.success("Perfil atualizado com sucesso!");
      setEditarAberto(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar perfil");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">O Meu Perfil</h1>
        <p className="text-gray-600">Gerencie as suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cartão de Perfil */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl font-bold">
                {utilizadorAtual.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{utilizadorAtual.nome}</h2>
            <p className="text-sm text-gray-500 capitalize mb-4">{utilizadorAtual.tipo}</p>
            
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm text-gray-900 truncate">{utilizadorAtual.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Contacto</p>
                  <p className="text-sm text-gray-900">{utilizadorAtual.contacto}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Membro desde</p>
                  <p className="text-sm text-gray-900">
                    {dataRegistoValida
                      ? new Date(utilizadorAtual.data_registo).toLocaleDateString('pt-PT', {
                          year: 'numeric',
                          month: 'long'
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              {utilizadorAtual.numero_aluno && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Número de Aluno</p>
                    <p className="text-sm text-gray-900">{utilizadorAtual.numero_aluno}</p>
                  </div>
                </div>
              )}

              {utilizadorAtual.n_mecanografico && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">N.º Mecanográfico</p>
                    <p className="text-sm text-gray-900">{utilizadorAtual.n_mecanografico}</p>
                  </div>
                </div>
              )}

              {utilizadorAtual.cargo && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Cargo</p>
                    <p className="text-sm text-gray-900">{utilizadorAtual.cargo}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => { setNome(utilizadorAtual.nome); setEmail(utilizadorAtual.email); setContacto(utilizadorAtual.contacto); setEditarAberto(true); }}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Definições */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Definições da Conta</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Notificações por Email</p>
                  <p className="text-sm text-gray-500">Receber atualizações sobre reservas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Notificações Push</p>
                  <p className="text-sm text-gray-500">Receber alertas no navegador</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Segurança</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <p className="font-medium text-gray-900">Alterar Palavra-passe</p>
                <p className="text-sm text-gray-500">Última alteração há 3 meses</p>
              </button>
              <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <p className="font-medium text-gray-900">Autenticação de Dois Fatores</p>
                <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {editarAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
