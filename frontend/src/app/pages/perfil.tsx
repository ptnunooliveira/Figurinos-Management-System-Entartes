import { User, Mail, Phone, Calendar } from "lucide-react";
import { getUtilizadorAtual } from "../lib/auth";

export function Perfil() {
  const utilizadorAtual = getUtilizadorAtual();

  if (!utilizadorAtual) {
    return <div className="text-gray-500">Não autenticado.</div>;
  }

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
                    {new Date(utilizadorAtual.data_registo).toLocaleDateString('pt-PT', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
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

            <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
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
    </div>
  );
}
