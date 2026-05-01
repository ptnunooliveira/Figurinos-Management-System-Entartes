import { apiFetch } from './api';
import type { Figurino, Reserva, LinhaReserva, ContaCorrente, AnuncioMarketplace, Ocorrencia } from './dados-mock';

// Tipos que correspondem ao formato devolvido pelo backend

export interface AcessorioAPI {
  id: number;
  nome: string;
}

export interface FigurinoAPI {
  id: number;
  descricao: string | null;
  tamanho: string | null;
  localizacao: string | null;
  ativo?: boolean | null;
  categoria: { id: number; nomecategoria: string } | null;
  tipo_figurino: { id: number; nome: string } | null;
  sexo: { id: number; nome: string } | null;
  estado_condicao: { id: number; nome: string } | null;
  figurino_acessorio: { id_figurino: number; id_acessorio: number; acessorio: AcessorioAPI }[];
}

export interface AnuncioEscolaAPI {
  id: number;
  id_figurino: number | null;
  valordiarioaluguer: number | null;
  id_estado: number | null;
  figurino: FigurinoAPI | null;
  estado_anuncio: { id: number; nome: string } | null;
}

// Converte FigurinoAPI → interface Figurino usada nas páginas
export function mapFigurino(f: FigurinoAPI): Figurino {
  return {
    id: f.id,
    nome: f.descricao ?? '',
    descricao: f.descricao ?? '',
    tamanho: f.tamanho ?? '',
    localizacao: f.localizacao ?? '',
    categoria: f.categoria?.nomecategoria ?? '',
    tipo: f.tipo_figurino?.nome ?? '',
    sexo: f.sexo?.nome ?? '',
    estado: f.estado_condicao?.nome ?? '',
    imagens: [],
    acessorios: f.figurino_acessorio.map((fa) => fa.acessorio),
    valor_diario: 0,
  };
}

export async function getFigurinos(): Promise<Figurino[]> {
  try {
    const res = await apiFetch('/figurinos');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapFigurino);
  } catch {
    return [];
  }
}

export async function getFigurinosRaw(): Promise<FigurinoAPI[]> {
  try {
    const res = await apiFetch('/figurinos');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter((f: FigurinoAPI) => f.ativo !== false);
  } catch {
    return [];
  }
}

export async function desativarFigurino(id: number): Promise<void> {
  const res = await apiFetch(`/figurinos/${id}/desativar`, { method: 'PATCH' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? 'Erro ao desativar figurino');
  }
}

export async function atualizarFigurino(
  id: number,
  dados: { descricao?: string; tamanho?: string; localizacao?: string; id_estado_figurino?: number | null },
): Promise<FigurinoAPI> {
  const res = await apiFetch(`/figurinos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? 'Erro ao atualizar figurino');
  }
  return res.json();
}

export async function getAnunciosEscola(): Promise<AnuncioEscolaAPI[]> {
  try {
    const res = await apiFetch('/anuncios-escola');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

export interface AuxiliarItem {
  id: number;
  nome: string;
  descricao?: string;
}

async function getAuxiliar(path: string): Promise<AuxiliarItem[]> {
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

export async function getCategorias(): Promise<AuxiliarItem[]> {
  try {
    const res = await apiFetch('/pesquisa/categorias');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: { id: number; nomecategoria: string }) => ({ id: c.id, nome: c.nomecategoria }));
  } catch {
    return [];
  }
}
export async function getEstadosAnuncio(): Promise<AuxiliarItem[]> {
  try {
    const res = await apiFetch('/pesquisa/estados-anuncio');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((e: { id: number; nome: string; descricao?: string | null }) => ({
      id: e.id,
      nome: e.nome,
      descricao: e.descricao ?? e.nome,
    }));
  } catch {
    return [];
  }
}
export const getTiposFigurino = () => getAuxiliar('/pesquisa/tipos-figurino');
export const getSexos = () => getAuxiliar('/pesquisa/sexos');
export const getEstadosCondicao = () => getAuxiliar('/pesquisa/estados-condicao');
export const getAcessorios = () => getAuxiliar('/pesquisa/acessorios');

// ─── Reservas ───────────────────────────────────────────────────────────────

function mapLinhaReserva(lr: any): LinhaReserva {
  const fig = lr.anuncio_escola?.figurino;
  return {
    id: lr.id,
    anuncio: {
      id: lr.anuncio_escola?.id ?? 0,
      figurino: fig ? {
        id: fig.id,
        nome: fig.descricao ?? '',
        descricao: fig.descricao ?? '',
        tamanho: fig.tamanho ?? '',
        localizacao: fig.localizacao ?? '',
        categoria: fig.categoria?.nomecategoria ?? '',
        tipo: '',
        sexo: '',
        estado: fig.estado_condicao?.nome ?? '',
        imagens: [],
        acessorios: (fig.figurino_acessorio ?? []).map((fa: any) => fa.acessorio),
        valor_diario: lr.anuncio_escola?.valordiarioaluguer ?? 0,
      } : { id: 0, nome: '', descricao: '', tamanho: '', localizacao: '', categoria: '', tipo: '', sexo: '', estado: '', imagens: [], acessorios: [], valor_diario: 0 },
      valor_diario_aluguer: lr.anuncio_escola?.valordiarioaluguer ?? 0,
      estado: lr.anuncio_escola?.estado_anuncio?.nome ?? '',
    },
    data_inicio: lr.datainicio ?? '',
    data_fim: lr.datafim ?? '',
    valor_diario: lr.valordiario ?? lr.anuncio_escola?.valordiarioaluguer ?? 0,
    estado: lr.estado_linha_reserva?.nome ?? '',
  };
}

export function mapReserva(r: any): Reserva {
  return {
    id: r.id,
    data_reserva: r.datareserva ?? '',
    estado: r.estado_reserva?.nome ?? '',
    utilizador: {
      id: r.utilizador?.id ?? 0,
      nome: r.utilizador?.nome ?? '',
      email: r.utilizador?.email ?? '',
      contacto: '',
      data_registo: '',
      ativo: true,
      tipo: 'aluno',
    },
    linhas: (r.linha_reserva ?? []).map(mapLinhaReserva),
  };
}

export async function getReservas(): Promise<Reserva[]> {
  try {
    const res = await apiFetch('/reservas');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapReserva);
  } catch {
    return [];
  }
}

export async function getMinhasReservas(): Promise<Reserva[]> {
  try {
    const res = await apiFetch('/reservas/mine');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapReserva);
  } catch {
    return [];
  }
}

export async function getReservaDetalhes(id: number): Promise<Reserva | null> {
  try {
    const res = await apiFetch(`/reservas/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return mapReserva(data);
  } catch {
    return null;
  }
}

export async function criarChecklist(idReserva: number, dados: {
  id_tipo_checklist: number;
  assinaturaFuncionario: string;
  assinaturaEncarregado: string;
  itens: { id_linha_reserva: number; idfigurino: number; id_estado: number; observacoes?: string }[];
}): Promise<any> {
  const res = await apiFetch(`/reservas/${idReserva}/checklists`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? 'Erro ao criar checklist');
  }
  return res.json();
}

export interface ChecklistAPI {
  id: number;
  id_tipo_checklist: number;
  id_reserva: number;
  dataassinatura: string | null;
  tipo_checklist?: { id: number; nome: string | null } | null;
  checklist_item: Array<{
    id: number;
    idfigurino: number;
    id_estado: number | null;
    observacoes: string | null;
    estado_condicao?: { id: number; nome: string | null } | null;
  }>;
}

export async function getChecklistsReserva(idReserva: number): Promise<ChecklistAPI[]> {
  try {
    const res = await apiFetch(`/reservas/${idReserva}/checklists`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ─── Conta Corrente ──────────────────────────────────────────────────────────

function mapContaCorrente(m: any): ContaCorrente {
  const data = m.linha_reserva?.datainicio ?? m.dataexportacao ?? null;
  const descricao = m.ocorrencia?.descricao
    ?? (m.linha_reserva ? `Aluguer - Linha #${m.id_linha_reserva}` : m.tipo_movimento_contacorrente?.nome ?? '');
  return {
    id: m.id,
    valor: m.valor ?? 0,
    data: data ? new Date(data).toISOString() : '',
    tipo_movimento: m.tipo_movimento_contacorrente?.nome ?? '',
    descricao,
    exportado_faturacao: m.exportadofaturacao ?? false,
    id_utilizador: m.id_utilizador ?? 0,
  };
}

export async function getContaCorrente(): Promise<ContaCorrente[]> {
  try {
    const res = await apiFetch('/conta-corrente');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapContaCorrente);
  } catch {
    return [];
  }
}

export async function getMinhaContaCorrente(): Promise<ContaCorrente[]> {
  try {
    const res = await apiFetch('/conta-corrente/me');
    if (!res.ok) return [];
    const raw = await res.json();
    const movimentos = raw.movimentos ?? raw;
    if (!Array.isArray(movimentos)) return [];
    return movimentos.map(mapContaCorrente);
  } catch {
    return [];
  }
}

export async function marcarMovimentoExportado(id: number): Promise<void> {
  await apiFetch(`/conta-corrente/${id}/exportar`, { method: 'PATCH' });
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

function mapAnuncioMarketplace(a: any): AnuncioMarketplace {
  const estadoBase = a.estado_anuncio?.nome ?? a.situacao ?? '';
  const estadoNormalizado = typeof estadoBase === 'string' ? estadoBase.trim().toLowerCase() : '';

  const estado = estadoNormalizado === 'reprovado'
    ? 'Rejeitado'
    : estadoBase;

  return {
    id: a.id,
    titulo: a.titulo ?? '',
    data_anuncio: a.dataanuncio ?? '',
    data_aprovacao: a.dataaprovacao ?? undefined,
    motivo_rejeicao: a.motivorejeicao ?? undefined,
    descricao: a.descricao ?? '',
    tamanho: a.tamanho ?? '',
    categoria: a.categoria ?? '',
    tipo: a.tipo_figurino ?? '',
    sexo: a.sexo ?? '',
    estado,
    id_utilizador: a.id_utilizador ?? 0,
    imagens: Array.isArray(a.imagens) ? a.imagens.filter((img: unknown) => typeof img === 'string') : [],
  };
}

export async function getMarketplace(): Promise<AnuncioMarketplace[]> {
  try {
    const res = await apiFetch('/marketplace');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapAnuncioMarketplace);
  } catch {
    return [];
  }
}

export async function getMarketplaceGestao(estado?: string): Promise<AnuncioMarketplace[]> {
  try {
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : '';
    const res = await apiFetch(`/marketplace/gestao${query}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapAnuncioMarketplace);
  } catch {
    return [];
  }
}

export async function criarAnuncioMarketplace(dados: FormData): Promise<any> {
  const res = await apiFetch('/marketplace', {
    method: 'POST',
    headers: {},
    body: dados,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Erro ao criar anúncio');
  }
  return res.json();
}

export async function aprovarAnuncioMarketplace(id: number, aprovado: boolean, motivorejeicao?: string): Promise<any> {
  const res = await apiFetch(`/marketplace/${id}/aprovar`, {
    method: 'PATCH',
    body: JSON.stringify({ aprovado, motivorejeicao: motivorejeicao ?? null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Erro ao atualizar estado');
  }
  return res.json();
}

export async function ressubmeterAnuncioMarketplace(id: number, dados: FormData): Promise<any> {
  const res = await apiFetch(`/marketplace/${id}/ressubmeter`, {
    method: 'POST',
    headers: {},
    body: dados,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Erro ao ressubmeter anúncio');
  }
  return res.json();
}

export async function eliminarAnuncioMarketplace(id: number): Promise<void> {
  const res = await apiFetch(`/marketplace/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Erro ao remover anúncio');
  }
}

export async function continuarAnuncioMarketplace(id: number): Promise<any> {
  const res = await apiFetch(`/marketplace/${id}/continuar`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? 'Erro ao renovar anúncio');
  }
  return res.json();
}

// ─── Ocorrências ──────────────────────────────────────────────────────────────

export interface OcorrenciaDetalhada extends Ocorrencia {
  figurino_id?: number;
  figurino_nome?: string;
  figurino_descricao?: string;
  figurino_tamanho?: string;
  figurino_localizacao?: string;
  figurino_estado_id?: number | null;
  figurino_estado_nome?: string;
  figurino_categoria?: string;
  figurino_ativo?: boolean;
  cliente_id?: number;
  cliente_nome?: string;
  cliente_email?: string;
  propostas?: {
    id: number;
    valor: number;
    estado: string;
    dataproposta?: string;
    descricao?: string | null;
    contestacoes?: { id: number; descricao: string; valorcontraproposta?: number | null; data?: string }[];
  }[];
  orcamentos?: { id: number; valor: number; fornecedor?: string; descricao?: string | null; aprovado?: boolean | null }[];
}

function mapOcorrencia(o: any): OcorrenciaDetalhada {
  const fig = o.linha_reserva?.anuncio_escola?.figurino;
  const cliente = o.linha_reserva?.reserva?.utilizador;
  return {
    id: o.id,
    descricao: o.descricao ?? '',
    estado: o.estado_ocorrencia?.nome ?? '',
    linha_reserva_id: o.id_linha_reserva ?? 0,
    data_criacao: o.dataregisto ?? '',
    tipo: '',
    valor_proposto: o.valor ?? undefined,
    figurino_id: fig?.id,
    figurino_nome: fig?.descricao ?? '',
    figurino_descricao: fig?.descricao ?? '',
    figurino_tamanho: fig?.tamanho ?? '',
    figurino_localizacao: fig?.localizacao ?? '',
    figurino_estado_id: fig?.id_estado_figurino ?? null,
    figurino_estado_nome: fig?.estado_condicao?.nome ?? '',
    figurino_categoria: fig?.categoria?.nomecategoria ?? '',
    figurino_ativo: fig?.ativo ?? true,
    cliente_id: cliente?.id,
    cliente_nome: cliente?.nome ?? '',
    cliente_email: cliente?.email ?? '',
    propostas: (o.propostacobranca ?? []).map((p: any) => ({
      id: p.id,
      valor: p.valor ?? 0,
      estado: p.estadopropostacobranca?.nome ?? '',
      dataproposta: p.dataproposta ?? undefined,
      descricao: p.descricao ?? null,
      contestacoes: (p.contestacao ?? []).map((c: any) => ({
        id: c.id,
        descricao: c.descricao ?? '',
        valorcontraproposta: c.valorcontraproposta,
        data: c.data ?? undefined,
      })),
    })),
    orcamentos: (o.orcamento ?? []).map((or: any) => ({
      id: or.id,
      valor: or.valor ?? 0,
      fornecedor: or.fornecedor ?? '',
      descricao: or.descricao ?? null,
      aprovado: or.aprovado,
    })),
  };
}

export async function getOcorrencias(): Promise<OcorrenciaDetalhada[]> {
  try {
    const res = await apiFetch('/ocorrencias');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapOcorrencia);
  } catch {
    return [];
  }
}

export async function getMinhasOcorrencias(): Promise<OcorrenciaDetalhada[]> {
  try {
    const res = await apiFetch('/ocorrencias/mine');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapOcorrencia);
  } catch {
    return [];
  }
}

export async function criarContestacao(dados: {
  id_proposta_cobranca: number;
  descricao: string;
  valorcontraproposta?: number | null;
}): Promise<any> {
  const res = await apiFetch('/contestacoes', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? 'Erro ao registar contestação');
  }
  return res.json();
}

export async function getOcorrencia(id: number): Promise<OcorrenciaDetalhada | null> {
  try {
    const res = await apiFetch(`/ocorrencias/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return mapOcorrencia(data);
  } catch {
    return null;
  }
}

export const getEstadosOcorrencia = () => getAuxiliar('/pesquisa/estados-ocorrencia');

export async function getMarketplaceDoUtilizador(userId: number): Promise<AnuncioMarketplace[]> {
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

export async function criarOcorrencia(dados: {
  id_linha_reserva: number;
  descricao: string;
  valor?: number | null;
}): Promise<any> {
  const res = await apiFetch('/ocorrencias', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? err.erro ?? 'Erro ao criar ocorrência');
  }
  return res.json();
}

export async function criarOrcamento(idOcorrencia: number, dados: {
  fornecedor: string;
  descricao?: string | null;
  valor?: number | null;
}): Promise<any> {
  const res = await apiFetch(`/ocorrencias/${idOcorrencia}/orcamentos`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? err.erro ?? 'Erro ao registar orçamento');
  }
  return res.json();
}

export async function criarPropostaCobranca(idOcorrencia: number, valor: number, descricao?: string | null): Promise<any> {
  const res = await apiFetch('/propostas-cobranca', {
    method: 'POST',
    body: JSON.stringify({
      id_ocorrencia: idOcorrencia,
      valor,
      descricao: descricao && descricao.trim() !== '' ? descricao.trim() : null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? 'Erro ao criar proposta');
  }
  return res.json();
}

export interface PropostaCobranca {
  id: number;
  valor: number;
  estado: string;
  id_ocorrencia: number;
  datacriacao?: string;
  dataestado?: string;
}

function mapProposta(p: any): PropostaCobranca {
  return {
    id: p.id,
    valor: p.valor ?? 0,
    estado: p.estado_proposta?.nome ?? p.estado ?? '',
    id_ocorrencia: p.id_ocorrencia ?? 0,
    datacriacao: p.datacriacao ?? undefined,
    dataestado: p.dataestado ?? undefined,
  };
}

export async function getPropostasCobranca(): Promise<PropostaCobranca[]> {
  try {
    const res = await apiFetch('/propostas-cobranca');
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(mapProposta);
  } catch {
    return [];
  }
}

export async function atualizarEstadoProposta(id: number, idEstado: number): Promise<any> {
  const res = await apiFetch(`/propostas-cobranca/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ id_estadopropostacobranca: idEstado }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? 'Erro ao atualizar proposta');
  }
  return res.json();
}

export async function aceitarProposta(idProposta: number): Promise<any> {
  const res = await apiFetch(`/propostas-cobranca/${idProposta}/aceitar`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? 'Erro ao aceitar proposta');
  }
  return res.json();
}

export async function resolverComContraproposta(idOcorrencia: number, valor: number): Promise<any> {
  const res = await apiFetch(`/propostas-cobranca/ocorrencia/${idOcorrencia}/resolver-contraproposta`, {
    method: 'POST',
    body: JSON.stringify({ valor }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? 'Erro ao resolver ocorrência');
  }
  return res.json();
}

export async function finalizarPropostaContaCorrente(id: number): Promise<any> {
  const res = await apiFetch(`/propostas-cobranca/${id}/finalizar-conta-corrente`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? 'Erro ao finalizar proposta');
  }
  return res.json();
}

// ─── Utilizadores ─────────────────────────────────────────────────────────────

export async function criarUtilizador(dados: { nome: string; email: string; password: string; perfil: string }): Promise<any> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? err.erro ?? 'Erro ao criar utilizador');
  }
  return res.json();
}

// ─── Anúncios Escola ──────────────────────────────────────────────────────────

export async function criarAnuncioEscola(dados: { id_figurino: number; valordiarioaluguer: number }): Promise<any> {
  const res = await apiFetch('/anuncios-escola', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? 'Erro ao criar anúncio');
  }
  return res.json();
}

export async function atualizarAnuncioEscola(id: number, dados: { id_figurino?: number; valordiarioaluguer?: number }): Promise<any> {
  const res = await apiFetch(`/anuncios-escola/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? 'Erro ao atualizar anúncio');
  }
  return res.json();
}

export async function eliminarAnuncioEscola(id: number): Promise<void> {
  const res = await apiFetch(`/anuncios-escola/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? 'Erro ao eliminar anúncio');
  }
}

// ─── Reservas extra ───────────────────────────────────────────────────────────

export async function criarReserva(linhas: { id_anuncio: number; datainicio: string; datafim: string }[], id_aluno?: number): Promise<any> {
  const body: any = { linhas };
  if (id_aluno) body.id_aluno = id_aluno;

  const res = await apiFetch('/reservas', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? 'Erro ao criar reserva');
  }
  return res.json();
}

export async function cancelarReserva(id: number): Promise<void> {
  const res = await apiFetch(`/reservas/mine/${id}/cancelar`, { method: 'PATCH' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? 'Erro ao cancelar reserva');
  }
}

export async function atualizarEstadoReserva(id: number, idEstado: number): Promise<any> {
  const res = await apiFetch(`/reservas/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ id_estado: idEstado }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? 'Erro ao atualizar estado da reserva');
  }
  return res.json();
}

// ─── Ocorrências extra ────────────────────────────────────────────────────────

export async function atualizarEstadoOcorrencia(id: number, idEstado: number): Promise<any> {
  const res = await apiFetch(`/ocorrencias/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ id_estado: idEstado }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? 'Erro ao atualizar ocorrência');
  }
  return res.json();
}

// ─── Utilizadores ─────────────────────────────────────────────────────────────

export async function getUtilizadores(): Promise<any[]> {
  try {
    const res = await apiFetch('/users');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function updateUser(id: number, dados: { nome?: string; email?: string; contacto?: string }): Promise<any> {
  const res = await apiFetch(`/utilizadores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? err.error ?? 'Erro ao atualizar perfil');
  }
  return res.json();
}
