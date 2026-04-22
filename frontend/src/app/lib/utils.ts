import * as XLSX from 'xlsx';
import { ContaCorrente } from './dados-mock';

// Exportar dados para Excel
export function exportarParaExcel(dados: ContaCorrente[], nomeArquivo: string = 'faturacao') {
  // Preparar dados para exportação
  const dadosExportacao = dados.map(item => ({
    'Data': new Date(item.data).toLocaleDateString('pt-PT'),
    'Tipo de Movimento': item.tipo_movimento,
    'Descrição': item.descricao,
    'Valor (€)': item.valor.toFixed(2),
    'Exportado': item.exportado_faturacao ? 'Sim' : 'Não',
  }));

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dadosExportacao);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 12 }, // Data
    { wch: 20 }, // Tipo de Movimento
    { wch: 40 }, // Descrição
    { wch: 12 }, // Valor
    { wch: 10 }, // Exportado
  ];
  ws['!cols'] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Faturação');

  // Gerar arquivo Excel
  XLSX.writeFile(wb, `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Converter imagem para base64
export function imagemParaBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Validar formato de imagem
export function validarFormatoImagem(file: File): boolean {
  const formatosPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return formatosPermitidos.includes(file.type);
}

// Calcular total de dias entre datas
export function calcularDias(dataInicio: string, dataFim: string): number {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Formatar moeda em euros
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(valor);
}
