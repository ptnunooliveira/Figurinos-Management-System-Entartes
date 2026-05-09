import { apiFetch } from "./api";
function mapFigurino(f) {
  return {
    id: f.id,
    nome: f.titulo ?? f.descricao ?? "",
    descricao: f.descricao ?? "",
    tamanho: f.tamanho ?? "",
    localizacao: f.localizacao ?? "",
    categoria: f.categoria?.nomecategoria ?? "",
    tipo: f.tipo_figurino?.nome ?? "",
    sexo: f.sexo?.nome ?? "",
    estado: f.estado_condicao?.nome ?? "",
    imagens: [],
    acessorios: f.figurino_acessorio.map((fa) => fa.acessorio),
    valor_diario: 0
  };
}
async function getFigurinos() {
  try {
    const res = await apiFetch("/figurinos");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapFigurino);
  } catch {
    return [];
  }
}
async function getFigurinosRaw() {
  try {
    const res = await apiFetch("/figurinos");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter((f) => f.ativo !== false);
  } catch {
    return [];
  }
}
async function desativarFigurino(id) {
  const res = await apiFetch(`/figurinos/${id}/desativar`, { method: "PATCH" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao desativar figurino");
  }
}
async function eliminarFigurino(id) {
  const res = await apiFetch(`/figurinos/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao eliminar figurino");
  }
}
async function atualizarFigurino(id, dados) {
  const res = await apiFetch(`/figurinos/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao atualizar figurino");
  }
  return res.json();
}
async function getAnunciosEscola() {
  try {
    const res = await apiFetch("/anuncios-escola");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}
async function getDisponibilidadeAnuncio(idAnuncio, dataInicio, dataFim) {
  try {
    const query = `dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`;
    const res = await apiFetch(`/anuncios-escola/${idAnuncio}/disponibilidade?${query}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
async function getAuxiliar(path) {
  try {
    const res = await apiFetch(path);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}
async function getCategorias() {
  try {
    const res = await apiFetch("/pesquisa/categorias");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c) => ({ id: c.id, nome: c.nomecategoria }));
  } catch {
    return [];
  }
}
async function getEstadosAnuncio() {
  try {
    const res = await apiFetch("/pesquisa/estados-anuncio");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((e) => ({
      id: e.id,
      nome: e.nome,
      descricao: e.descricao ?? e.nome
    }));
  } catch {
    return [];
  }
}
const getTiposFigurino = () => getAuxiliar("/pesquisa/tipos-figurino");
const getSexos = () => getAuxiliar("/pesquisa/sexos");
const getEstadosCondicao = () => getAuxiliar("/pesquisa/estados-condicao");
const getAcessorios = () => getAuxiliar("/pesquisa/acessorios");
async function criarAcessorio(nome) {
  const res = await apiFetch("/pesquisa/acessorios", {
    method: "POST",
    body: JSON.stringify({ nome })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao criar acess\xF3rio");
  }
  return res.json();
}
async function criarCategoria(nome) {
  const res = await apiFetch("/pesquisa/categorias", {
    method: "POST",
    body: JSON.stringify({ nomecategoria: nome })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? err.erro ?? "Erro ao criar categoria");
  }
  const data = await res.json();
  return { id: data.id, nome: data.nomecategoria };
}
async function criarTipoFigurino(nome) {
  const res = await apiFetch("/pesquisa/tipos-figurino", {
    method: "POST",
    body: JSON.stringify({ nome })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? err.erro ?? "Erro ao criar tipo de figurino");
  }
  return res.json();
}
async function associarAcessorioFigurino(idFigurino, idAcessorio) {
  const res = await apiFetch(`/figurinos/${idFigurino}/acessorios`, {
    method: "POST",
    body: JSON.stringify({ id_acessorio: idAcessorio })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? err.message ?? "Erro ao associar acess\xF3rio");
  }
  return res.json();
}
function mapLinhaReserva(lr) {
  const fig = lr.anuncio_escola?.figurino;
  return {
    id: lr.id,
    anuncio: {
      id: lr.anuncio_escola?.id ?? 0,
      figurino: fig ? {
        id: fig.id,
        nome: fig.descricao ?? "",
        descricao: fig.descricao ?? "",
        tamanho: fig.tamanho ?? "",
        localizacao: fig.localizacao ?? "",
        categoria: fig.categoria?.nomecategoria ?? "",
        tipo: "",
        sexo: "",
        estado: fig.estado_condicao?.nome ?? "",
        imagens: [],
        acessorios: (fig.figurino_acessorio ?? []).map((fa) => fa.acessorio),
        valor_diario: lr.anuncio_escola?.valordiarioaluguer ?? 0
      } : { id: 0, nome: "", descricao: "", tamanho: "", localizacao: "", categoria: "", tipo: "", sexo: "", estado: "", imagens: [], acessorios: [], valor_diario: 0 },
      valor_diario_aluguer: lr.anuncio_escola?.valordiarioaluguer ?? 0,
      estado: lr.anuncio_escola?.estado_anuncio?.nome ?? ""
    },
    data_inicio: lr.datainicio ?? "",
    data_fim: lr.datafim ?? "",
    valor_diario: lr.valordiario ?? lr.anuncio_escola?.valordiarioaluguer ?? 0,
    estado: lr.estado_linha_reserva?.nome ?? ""
  };
}
function mapReserva(r) {
  return {
    id: r.id,
    data_reserva: r.datareserva ?? "",
    estado: r.estado_reserva?.nome ?? "",
    utilizador: {
      id: r.utilizador?.id ?? 0,
      nome: r.utilizador?.nome ?? "",
      email: r.utilizador?.email ?? "",
      contacto: "",
      data_registo: "",
      ativo: true,
      tipo: "aluno"
    },
    linhas: (r.linha_reserva ?? []).map(mapLinhaReserva)
  };
}
async function getReservas() {
  try {
    const res = await apiFetch("/reservas");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapReserva);
  } catch {
    return [];
  }
}
async function getMinhasReservas() {
  try {
    const res = await apiFetch("/reservas/mine");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapReserva);
  } catch {
    return [];
  }
}
async function getReservaDetalhes(id) {
  try {
    const res = await apiFetch(`/reservas/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return mapReserva(data);
  } catch {
    return null;
  }
}
async function criarChecklist(idReserva, dados) {
  const res = await apiFetch(`/reservas/${idReserva}/checklists`, {
    method: "POST",
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao criar checklist");
  }
  return res.json();
}
async function getChecklistsReserva(idReserva) {
  try {
    const res = await apiFetch(`/reservas/${idReserva}/checklists`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function calcularDiasLinha(lr) {
  if (!lr?.datainicio || !lr?.datafim) return 1;
  const inicio = new Date(lr.datainicio);
  const fim = new Date(lr.datafim);
  return Math.max(1, Math.ceil((fim.getTime() - inicio.getTime()) / (1e3 * 60 * 60 * 24)));
}
function mapContaCorrente(m) {
  const data = m.linha_reserva?.datainicio ?? m.ocorrencia?.dataregisto ?? null;
  let descricao;
  if (m.id_ocorrencia && m.id_linha_reserva) {
    descricao = `Reserva #${m.id_linha_reserva} que gerou Ocorr\xEAncia #${m.id_ocorrencia}`;
  } else if (m.id_linha_reserva && m.linha_reserva) {
    const dias = calcularDiasLinha(m.linha_reserva);
    const valorDiario = m.linha_reserva.valordiario ?? 0;
    descricao = `Reserva #${m.id_linha_reserva}, ${dias} dia${dias !== 1 ? "s" : ""}, ${valorDiario.toFixed(2)}\u20AC/dia`;
  } else {
    descricao = m.tipo_movimento_contacorrente?.nome ?? "";
  }
  let valor = m.valor != null && m.valor !== 0 ? m.valor : null;
  if (!valor) {
    const propostaValor = m.ocorrencia?.propostacobranca?.find((p) => p.valor != null && p.valor !== 0)?.valor ?? null;
    valor = propostaValor;
  }
  if (!valor && m.ocorrencia?.valor) {
    valor = m.ocorrencia.valor;
  }
  if (!valor && m.linha_reserva?.datainicio && m.linha_reserva?.datafim && m.linha_reserva?.valordiario) {
    const inicio = new Date(m.linha_reserva.datainicio);
    const fim = new Date(m.linha_reserva.datafim);
    const dias = Math.max(1, Math.ceil((fim.getTime() - inicio.getTime()) / (1e3 * 60 * 60 * 24)));
    valor = m.linha_reserva.valordiario * dias;
  }
  const tipo_movimento = m.id_ocorrencia ? "Ocorr\xEAncia" : m.id_linha_reserva ? "Reserva" : m.tipo_movimento_contacorrente?.nome ?? "";
  return {
    id: m.id,
    valor: valor ?? 0,
    data: data ? new Date(data).toISOString() : "",
    tipo_movimento,
    descricao,
    exportado_faturacao: m.exportadofaturacao ?? false,
    data_exportacao: m.dataexportacao ? new Date(m.dataexportacao).toISOString() : null,
    id_utilizador: m.id_utilizador ?? 0,
    nome_aluno: m.utilizador?.nome ?? ""
  };
}
async function getContaCorrente() {
  try {
    const res = await apiFetch("/conta-corrente");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapContaCorrente);
  } catch {
    return [];
  }
}
async function getMinhaContaCorrente() {
  try {
    const res = await apiFetch("/conta-corrente/me");
    if (!res.ok) return [];
    const raw = await res.json();
    const movimentos = raw.movimentos ?? raw;
    if (!Array.isArray(movimentos)) return [];
    return movimentos.map(mapContaCorrente);
  } catch {
    return [];
  }
}
async function marcarMovimentoExportado(id) {
  await apiFetch(`/conta-corrente/${id}/exportar`, { method: "PATCH" });
}
async function sincronizarMovimentosAluguer() {
  try {
    const res = await apiFetch("/conta-corrente/sincronizar-alugueres", { method: "POST" });
    if (!res.ok) return { criados: 0 };
    return res.json();
  } catch {
    return { criados: 0 };
  }
}
function mapAnuncioMarketplace(a) {
  const estadoBase = a.estado_anuncio?.nome ?? a.situacao ?? "";
  const estadoNormalizado = typeof estadoBase === "string" ? estadoBase.trim().toLowerCase() : "";
  const estado = estadoNormalizado === "reprovado" ? "Rejeitado" : estadoBase;
  return {
    id: a.id,
    titulo: a.titulo ?? "",
    data_anuncio: a.dataanuncio ?? "",
    data_aprovacao: a.dataaprovacao ?? void 0,
    motivo_rejeicao: a.motivorejeicao ?? void 0,
    descricao: a.descricao ?? "",
    tamanho: a.tamanho ?? "",
    categoria: a.categoria ?? "",
    tipo: a.tipo_figurino ?? "",
    sexo: a.sexo ?? "",
    estado,
    id_utilizador: a.id_utilizador ?? 0,
    utilizador: a.utilizador ?? void 0,
    imagens: Array.isArray(a.imagens) ? a.imagens.filter((img) => typeof img === "string") : []
  };
}
async function getMarketplace() {
  try {
    const res = await apiFetch("/marketplace");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapAnuncioMarketplace);
  } catch {
    return [];
  }
}
async function getMarketplaceGestao(estado) {
  try {
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";
    const res = await apiFetch(`/marketplace/gestao${query}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapAnuncioMarketplace);
  } catch {
    return [];
  }
}
async function criarAnuncioMarketplace(dados) {
  const res = await apiFetch("/marketplace", {
    method: "POST",
    headers: {},
    body: dados
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao criar an\xFAncio");
  }
  return res.json();
}
async function aprovarAnuncioMarketplace(id, aprovado, motivorejeicao) {
  const res = await apiFetch(`/marketplace/${id}/aprovar`, {
    method: "PATCH",
    body: JSON.stringify({ aprovado, motivorejeicao: motivorejeicao ?? null })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao atualizar estado");
  }
  return res.json();
}
async function ressubmeterAnuncioMarketplace(id, dados) {
  const res = await apiFetch(`/marketplace/${id}/ressubmeter`, {
    method: "POST",
    headers: {},
    body: dados
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao ressubmeter an\xFAncio");
  }
  return res.json();
}
async function eliminarAnuncioMarketplace(id) {
  const res = await apiFetch(`/marketplace/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao remover an\xFAncio");
  }
}
async function continuarAnuncioMarketplace(id) {
  const res = await apiFetch(`/marketplace/${id}/continuar`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Erro ao renovar an\xFAncio");
  }
  return res.json();
}
function mapOcorrencia(o) {
  const fig = o.linha_reserva?.anuncio_escola?.figurino;
  const cliente = o.linha_reserva?.reserva?.utilizador;
  return {
    id: o.id,
    descricao: o.descricao ?? "",
    estado: o.estado_ocorrencia?.nome ?? "",
    linha_reserva_id: o.id_linha_reserva ?? 0,
    data_criacao: o.dataregisto ?? "",
    tipo: "",
    valor_proposto: o.valor ?? void 0,
    figurino_id: fig?.id,
    figurino_nome: fig?.descricao ?? "",
    figurino_descricao: fig?.descricao ?? "",
    figurino_tamanho: fig?.tamanho ?? "",
    figurino_localizacao: fig?.localizacao ?? "",
    figurino_estado_id: fig?.id_estado_figurino ?? null,
    figurino_estado_nome: fig?.estado_condicao?.nome ?? "",
    figurino_categoria: fig?.categoria?.nomecategoria ?? "",
    figurino_ativo: fig?.ativo ?? true,
    cliente_id: cliente?.id,
    cliente_nome: cliente?.nome ?? "",
    cliente_email: cliente?.email ?? "",
    propostas: (o.propostacobranca ?? []).map((p) => ({
      id: p.id,
      valor: p.valor ?? 0,
      estado: p.estadopropostacobranca?.nome ?? "",
      dataproposta: p.dataproposta ?? void 0,
      descricao: p.descricao ?? null,
      contestacoes: (p.contestacao ?? []).map((c) => ({
        id: c.id,
        descricao: c.descricao ?? "",
        valorcontraproposta: c.valorcontraproposta,
        data: c.data ?? void 0
      }))
    })),
    orcamentos: (o.orcamento ?? []).map((or) => ({
      id: or.id,
      valor: or.valor ?? 0,
      fornecedor: or.fornecedor ?? "",
      descricao: or.descricao ?? null,
      aprovado: or.aprovado
    }))
  };
}
async function getOcorrencias() {
  try {
    const res = await apiFetch("/ocorrencias");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapOcorrencia);
  } catch {
    return [];
  }
}
async function getMinhasOcorrencias() {
  try {
    const res = await apiFetch("/ocorrencias/mine");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapOcorrencia);
  } catch {
    return [];
  }
}
async function criarContestacao(dados) {
  const res = await apiFetch("/contestacoes", {
    method: "POST",
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao registar contesta\xE7\xE3o");
  }
  return res.json();
}
async function getOcorrencia(id) {
  try {
    const res = await apiFetch(`/ocorrencias/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return mapOcorrencia(data);
  } catch {
    return null;
  }
}
const getEstadosOcorrencia = () => getAuxiliar("/pesquisa/estados-ocorrencia");
async function getMarketplaceDoUtilizador(userId) {
  try {
    const res = await apiFetch(`/marketplace/${userId}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapAnuncioMarketplace);
  } catch {
    return [];
  }
}
async function criarOcorrencia(dados) {
  const res = await apiFetch("/ocorrencias", {
    method: "POST",
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? err.erro ?? "Erro ao criar ocorr\xEAncia");
  }
  return res.json();
}
async function criarOrcamento(idOcorrencia, dados) {
  const res = await apiFetch(`/ocorrencias/${idOcorrencia}/orcamentos`, {
    method: "POST",
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? err.erro ?? "Erro ao registar or\xE7amento");
  }
  return res.json();
}
async function criarPropostaCobranca(idOcorrencia, valor, descricao) {
  const res = await apiFetch("/propostas-cobranca", {
    method: "POST",
    body: JSON.stringify({
      id_ocorrencia: idOcorrencia,
      valor,
      descricao: descricao && descricao.trim() !== "" ? descricao.trim() : null
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao criar proposta");
  }
  return res.json();
}
function mapProposta(p) {
  return {
    id: p.id,
    valor: p.valor ?? 0,
    estado: p.estado_proposta?.nome ?? p.estado ?? "",
    id_ocorrencia: p.id_ocorrencia ?? 0,
    datacriacao: p.datacriacao ?? void 0,
    dataestado: p.dataestado ?? void 0
  };
}
async function getPropostasCobranca() {
  try {
    const res = await apiFetch("/propostas-cobranca");
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapProposta);
  } catch {
    return [];
  }
}
async function atualizarEstadoProposta(id, idEstado) {
  const res = await apiFetch(`/propostas-cobranca/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ id_estadopropostacobranca: idEstado })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao atualizar proposta");
  }
  return res.json();
}
async function aceitarProposta(idProposta) {
  const res = await apiFetch(`/propostas-cobranca/${idProposta}/aceitar`, {
    method: "POST"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao aceitar proposta");
  }
  return res.json();
}
async function resolverComContraproposta(idOcorrencia, valor) {
  const res = await apiFetch(`/propostas-cobranca/ocorrencia/${idOcorrencia}/resolver-contraproposta`, {
    method: "POST",
    body: JSON.stringify({ valor })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao resolver ocorr\xEAncia");
  }
  return res.json();
}
async function finalizarPropostaContaCorrente(id) {
  const res = await apiFetch(`/propostas-cobranca/${id}/finalizar-conta-corrente`, {
    method: "POST",
    body: JSON.stringify({})
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao finalizar proposta");
  }
  return res.json();
}
async function criarUtilizador(dados) {
  const res = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? err.erro ?? "Erro ao criar utilizador");
  }
  return res.json();
}
async function criarAnuncioEscola(dados) {
  const res = await apiFetch("/anuncios-escola", {
    method: "POST",
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao criar an\xFAncio");
  }
  return res.json();
}
async function atualizarAnuncioEscola(id, dados) {
  const res = await apiFetch(`/anuncios-escola/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao atualizar an\xFAncio");
  }
  return res.json();
}
async function eliminarAnuncioEscola(id) {
  const res = await apiFetch(`/anuncios-escola/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao eliminar an\xFAncio");
  }
}
async function criarReserva(linhas, id_aluno) {
  const body = { linhas };
  if (id_aluno) body.id_aluno = id_aluno;
  const res = await apiFetch("/reservas", {
    method: "POST",
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao criar reserva");
  }
  return res.json();
}
async function atualizarEstadoLinhaReserva(idReserva, idLinha, idEstado) {
  const res = await apiFetch(`/reservas/${idReserva}/linhas/${idLinha}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ id_estado: idEstado })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao atualizar estado da linha de reserva");
  }
  return res.json();
}
async function cancelarReserva(id) {
  const res = await apiFetch(`/reservas/mine/${id}/cancelar`, { method: "PATCH" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao cancelar reserva");
  }
}
async function atualizarEstadoReserva(id, idEstado) {
  const res = await apiFetch(`/reservas/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ id_estado: idEstado })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao atualizar estado da reserva");
  }
  return res.json();
}
async function atualizarEstadoOcorrencia(id, idEstado) {
  const res = await apiFetch(`/ocorrencias/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ id_estado: idEstado })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? "Erro ao atualizar ocorr\xEAncia");
  }
  return res.json();
}
async function getUtilizadores() {
  try {
    const res = await apiFetch("/users");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
async function updateUser(id, dados) {
  const res = await apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? "Erro ao atualizar perfil");
  }
  return res.json();
}
export {
  aceitarProposta,
  aprovarAnuncioMarketplace,
  associarAcessorioFigurino,
  atualizarAnuncioEscola,
  atualizarEstadoLinhaReserva,
  atualizarEstadoOcorrencia,
  atualizarEstadoProposta,
  atualizarEstadoReserva,
  atualizarFigurino,
  cancelarReserva,
  continuarAnuncioMarketplace,
  criarAcessorio,
  criarAnuncioEscola,
  criarAnuncioMarketplace,
  criarCategoria,
  criarChecklist,
  criarContestacao,
  criarOcorrencia,
  criarOrcamento,
  criarPropostaCobranca,
  criarReserva,
  criarTipoFigurino,
  criarUtilizador,
  desativarFigurino,
  eliminarAnuncioEscola,
  eliminarAnuncioMarketplace,
  eliminarFigurino,
  finalizarPropostaContaCorrente,
  getAcessorios,
  getAnunciosEscola,
  getCategorias,
  getChecklistsReserva,
  getContaCorrente,
  getDisponibilidadeAnuncio,
  getEstadosAnuncio,
  getEstadosCondicao,
  getEstadosOcorrencia,
  getFigurinos,
  getFigurinosRaw,
  getMarketplace,
  getMarketplaceDoUtilizador,
  getMarketplaceGestao,
  getMinhaContaCorrente,
  getMinhasOcorrencias,
  getMinhasReservas,
  getOcorrencia,
  getOcorrencias,
  getPropostasCobranca,
  getReservaDetalhes,
  getReservas,
  getSexos,
  getTiposFigurino,
  getUtilizadores,
  mapFigurino,
  mapReserva,
  marcarMovimentoExportado,
  resolverComContraproposta,
  ressubmeterAnuncioMarketplace,
  sincronizarMovimentosAluguer,
  updateUser
};
