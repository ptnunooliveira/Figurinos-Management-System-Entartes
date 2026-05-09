import * as XLSX from "xlsx";
function exportarParaExcel(dados, nomeArquivo = "faturacao") {
  const dadosExportacao = dados.map((item) => ({
    "Data Movimento": item.data ? new Date(item.data).toLocaleDateString("pt-PT") : "",
    "Aluno": item.nome_aluno || "",
    "Tipo": item.tipo_movimento,
    "Descri\xE7\xE3o": item.descricao,
    "Valor (\u20AC)": item.valor.toFixed(2),
    "Data Exporta\xE7\xE3o": item.data_exportacao ? new Date(item.data_exportacao).toLocaleDateString("pt-PT") : ""
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(dadosExportacao);
  const colWidths = [
    { wch: 14 },
    // Data Movimento
    { wch: 25 },
    // Aluno
    { wch: 14 },
    // Tipo
    { wch: 40 },
    // Descrição
    { wch: 12 },
    // Valor
    { wch: 16 }
    // Data Exportação
  ];
  ws["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(wb, ws, "Fatura\xE7\xE3o");
  XLSX.writeFile(wb, `${nomeArquivo}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`);
}
function imagemParaBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function validarFormatoImagem(file) {
  const formatosPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  return formatosPermitidos.includes(file.type);
}
function calcularDias(dataInicio, dataFim) {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  return Math.max(1, Math.ceil(diffTime / (1e3 * 60 * 60 * 24)));
}
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR"
  }).format(valor);
}
export {
  calcularDias,
  exportarParaExcel,
  formatarMoeda,
  imagemParaBase64,
  validarFormatoImagem
};
