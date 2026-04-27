import { useState, useEffect } from "react";
import { FileDown, Calendar, DollarSign } from "lucide-react";
import { getContaCorrente } from "../lib/services";
import type { ContaCorrente } from "../lib/dados-mock";
import { exportarParaExcel, formatarMoeda } from "../lib/utils";
import { toast } from "sonner";

export function Faturacao() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [contaCorrente, setContaCorrente] = useState<ContaCorrente[]>([]);

  useEffect(() => {
    getContaCorrente().then(setContaCorrente);
  }, []);

  const movimentosFiltrados = contaCorrente.filter(mov => {
    if (!dataInicio && !dataFim) return !mov.exportado_faturacao;
    const dataMov = new Date(mov.data);
    const inicio = dataInicio ? new Date(dataInicio) : new Date(0);
    const fim = dataFim ? new Date(dataFim) : new Date();
    return dataMov >= inicio && dataMov <= fim;
  });

  // Separar valores a cobrar (positivos) e pagos (negativos)
  const valoresCobrar = movimentosFiltrados.filter(mov => mov.valor > 0);
  const valoresPagos = movimentosFiltrados.filter(mov => mov.valor < 0);
  
  const totalCobrar = valoresCobrar.reduce((acc, mov) => acc + mov.valor, 0);
  const totalPago = Math.abs(valoresPagos.reduce((acc, mov) => acc + mov.valor, 0));
  const totalFaturar = movimentosFiltrados.reduce((acc, mov) => acc + mov.valor, 0);

  const handleExportar = () => {
    if (movimentosFiltrados.length === 0) {
      toast.error("Nenhum movimento para exportar");
      return;
    }
    exportarParaExcel(movimentosFiltrados, 'faturacao');
    toast.success(`${movimentosFiltrados.length} movimento(s) exportado(s) para Excel`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Faturação</h1>
        <p className="text-gray-600">Exporte movimentos para faturação</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Período</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setDataInicio("");
                setDataFim("");
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Movimentos</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{movimentosFiltrados.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Total a Faturar</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatarMoeda(Math.abs(totalFaturar))}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <button
            onClick={handleExportar}
            disabled={movimentosFiltrados.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-5 h-5" />
            Exportar para Excel
          </button>
        </div>
      </div>

      {/* Tabela de Movimentos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Movimentos ({movimentosFiltrados.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exportado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimentosFiltrados.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(mov.data).toLocaleDateString('pt-PT')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">
                      {mov.tipo_movimento}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {mov.descricao}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${mov.valor > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {mov.valor > 0 ? `+${formatarMoeda(mov.valor)}` : formatarMoeda(mov.valor)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {mov.exportado_faturacao ? (
                      <span className="text-green-600 text-xs">✓ Sim</span>
                    ) : (
                      <span className="text-gray-400 text-xs">Não</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {movimentosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <FileDown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Nenhum movimento para exportar</p>
          </div>
        )}
      </div>
    </div>
  );
}