import { useState, useEffect } from "react";
import { FileDown, Calendar, Euro } from "lucide-react";
import { getContaCorrente, getMinhaContaCorrente, marcarMovimentoExportado, sincronizarMovimentosAluguer } from "../lib/services";
import { getUtilizadorAtual } from "../lib/auth";
import type { ContaCorrente } from "../lib/dados-mock";
import { exportarParaExcel, formatarMoeda } from "../lib/utils";
import { toast } from "sonner";

type FiltroExportado = 'todos' | 'sim' | 'nao';

export function Faturacao() {
  const utilizadorAtual = getUtilizadorAtual();
  const isFuncionario = utilizadorAtual?.tipo === 'funcionario' || utilizadorAtual?.tipo === 'admin';

  const [contaCorrente, setContaCorrente] = useState<ContaCorrente[]>([]);
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());

  // Filtros — data do movimento
  const [dataMovInicio, setDataMovInicio] = useState("");
  const [dataMovFim, setDataMovFim] = useState("");

  // Filtros — data de exportação
  const [dataExpInicio, setDataExpInicio] = useState("");
  const [dataExpFim, setDataExpFim] = useState("");

  // Outros filtros
  const [filtroExportado, setFiltroExportado] = useState<FiltroExportado>('nao');
  const [filtroAluno, setFiltroAluno] = useState("");
  const [filtroTexto, setFiltroTexto] = useState("");

  const carregarMovimentos = () => {
    const fn = isFuncionario ? getContaCorrente : getMinhaContaCorrente;
    fn().then(data => {
      setContaCorrente(data);
      setSelecionados(new Set());
    });
  };

  useEffect(() => {
    if (isFuncionario) {
      // Cria registos de aluguer em falta para devoluções já processadas, depois carrega
      sincronizarMovimentosAluguer().then(carregarMovimentos);
    } else {
      carregarMovimentos();
    }
  }, [isFuncionario]);

  const movimentosFiltrados = contaCorrente.filter(mov => {
    // Filtro exportado
    if (filtroExportado === 'sim' && !mov.exportado_faturacao) return false;
    if (filtroExportado === 'nao' && mov.exportado_faturacao) return false;

    // Filtro data do movimento
    if (dataMovInicio || dataMovFim) {
      if (!mov.data) return false;
      const dataMov = new Date(mov.data);
      const inicio = dataMovInicio ? new Date(dataMovInicio) : new Date(0);
      const fim = dataMovFim ? new Date(dataMovFim) : new Date();
      if (dataMov < inicio || dataMov > fim) return false;
    }

    // Filtro data de exportação
    if (dataExpInicio || dataExpFim) {
      if (!mov.data_exportacao) return false;
      const dataExp = new Date(mov.data_exportacao);
      const inicio = dataExpInicio ? new Date(dataExpInicio) : new Date(0);
      const fim = dataExpFim ? new Date(dataExpFim) : new Date();
      if (dataExp < inicio || dataExp > fim) return false;
    }

    // Filtro aluno
    if (filtroAluno && mov.nome_aluno !== filtroAluno) return false;

    // Pesquisa livre
    if (filtroTexto) {
      const texto = filtroTexto.toLowerCase();
      if (
        !mov.descricao.toLowerCase().includes(texto) &&
        !mov.tipo_movimento.toLowerCase().includes(texto) &&
        !mov.nome_aluno.toLowerCase().includes(texto)
      ) return false;
    }

    return true;
  }).sort((a, b) => {
    const da = a.data ? new Date(a.data).getTime() : 0;
    const db = b.data ? new Date(b.data).getTime() : 0;
    return db - da;
  });

  const alunosUnicos = [...new Set(contaCorrente.map(m => m.nome_aluno).filter(Boolean))].sort();

  const todosSeleccionados =
    movimentosFiltrados.length > 0 && movimentosFiltrados.every(m => selecionados.has(m.id));

  const handleSelectAll = () => {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (todosSeleccionados) {
        movimentosFiltrados.forEach(m => next.delete(m.id));
      } else {
        movimentosFiltrados.forEach(m => next.add(m.id));
      }
      return next;
    });
  };

  const handleSelectOne = (id: number) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const movimentosSelecionados = movimentosFiltrados.filter(m => selecionados.has(m.id));
  const totalSelecionado = movimentosSelecionados.reduce((acc, mov) => acc + mov.valor, 0);

  const handleExportar = async () => {
    if (movimentosSelecionados.length === 0) {
      toast.error("Selecione pelo menos um movimento para exportar");
      return;
    }
    exportarParaExcel(movimentosSelecionados, 'faturacao');
    try {
      await Promise.all(movimentosSelecionados.map(m => marcarMovimentoExportado(m.id)));
      toast.success(`${movimentosSelecionados.length} movimento(s) exportado(s) e marcado(s) como exportados`);
    } catch {
      toast.error("Erro ao marcar movimentos como exportados");
    }
    carregarMovimentos();
  };

  const limparFiltros = () => {
    setDataMovInicio("");
    setDataMovFim("");
    setDataExpInicio("");
    setDataExpFim("");
    setFiltroExportado('nao');
    setFiltroAluno("");
    setFiltroTexto("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Faturação</h1>
        <p className="text-gray-600">Exporte movimentos para faturação</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>

        {/* Linha 1 — Data do movimento */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Data do Movimento (reserva / ocorrência)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
            <input
              type="date"
              value={dataMovInicio}
              onChange={(e) => setDataMovInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
            <input
              type="date"
              value={dataMovFim}
              onChange={(e) => setDataMovFim(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Linha 2 — Data de exportação */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Data de Exportação
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
            <input
              type="date"
              value={dataExpInicio}
              onChange={(e) => setDataExpInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
            <input
              type="date"
              value={dataExpFim}
              onChange={(e) => setDataExpFim(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Linha 3 — Outros filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exportado</label>
            <select
              value={filtroExportado}
              onChange={(e) => setFiltroExportado(e.target.value as FiltroExportado)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="nao">Não exportados</option>
              <option value="sim">Exportados</option>
            </select>
          </div>
          {isFuncionario && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aluno</label>
              <select
                value={filtroAluno}
                onChange={(e) => setFiltroAluno(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todos os alunos</option>
                {alunosUnicos.map(nome => (
                  <option key={nome} value={nome}>{nome}</option>
                ))}
              </select>
            </div>
          )}
          <div className={isFuncionario ? '' : 'md:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pesquisa livre</label>
            <input
              type="text"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder="Pesquisar descrição, tipo, aluno..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={limparFiltros}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Movimentos filtrados</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{movimentosFiltrados.length}</p>
          {movimentosSelecionados.length > 0 && (
            <p className="text-sm text-purple-600 mt-1">{movimentosSelecionados.length} selecionado(s)</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Euro className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Total selecionado</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatarMoeda(Math.abs(totalSelecionado))}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
          <button
            onClick={handleExportar}
            disabled={movimentosSelecionados.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-5 h-5" />
            {movimentosSelecionados.length > 0
              ? `Exportar (${movimentosSelecionados.length})`
              : 'Exportar'}
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
                <th className="px-4 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={todosSeleccionados}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Movimento
                </th>
                {isFuncionario && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aluno
                  </th>
                )}
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Exportação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimentosFiltrados.map((mov) => (
                <tr
                  key={mov.id}
                  className={`hover:bg-gray-50 cursor-pointer ${selecionados.has(mov.id) ? 'bg-purple-50' : ''}`}
                  onClick={() => handleSelectOne(mov.id)}
                >
                  <td className="px-4 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selecionados.has(mov.id)}
                      onChange={() => handleSelectOne(mov.id)}
                      className="w-4 h-4 text-purple-600 rounded border-gray-300 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mov.data ? new Date(mov.data).toLocaleDateString('pt-PT') : '—'}
                  </td>
                  {isFuncionario && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {mov.nome_aluno || '—'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      mov.tipo_movimento === 'Ocorrência'
                        ? 'bg-orange-100 text-orange-700'
                        : mov.tipo_movimento === 'Reserva'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                    }`}>
                      {mov.tipo_movimento || '—'}
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
                      <span className="text-green-600 text-xs font-medium">✓ Sim</span>
                    ) : (
                      <span className="text-gray-400 text-xs">Não</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    {mov.data_exportacao
                      ? new Date(mov.data_exportacao).toLocaleDateString('pt-PT')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {movimentosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <FileDown className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Nenhum movimento encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
