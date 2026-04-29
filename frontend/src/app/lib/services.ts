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
    return data;
  } catch {
    return [];
  }
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

function mapOcorrencia(o: any): Ocorrencia {
  return {
    id: o.id,
    descricao: o.descricao ?? '',
    estado: o.estado_ocorrencia?.nome ?? '',
    linha_reserva_id: o.id_linha_reserva ?? 0,
    data_criacao: o.dataregisto ?? '',
    tipo: '',
    valor_proposto: o.valor ?? undefined,
  };
}

export async function getOcorrencias(): Promise<Ocorrencia[]> {
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

export async function criarPropostaCobranca(idOcorrencia: number, valor: number): Promise<any> {
  const res = await apiFetch('/propostas-cobranca', {
    method: 'POST',
    body: JSON.stringify({ id_ocorrencia: idOcorrencia, valor }),
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
    body: JSON.stringify({ id_estado: idEstado }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.erro ?? 'Erro ao atualizar proposta');
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

export async function criarReserva(linhas: { id_anuncio_escola: number; datainicio: string; datafim: string }[]): Promise<any> {
  const res = await apiFetch('/reservas', {
    method: 'POST',
    body: JSON.stringify({ linhas }),
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
