import { apiFetch } from './api';
import type { Figurino } from './dados-mock';

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
  categoria: { id: number; nome: string } | null;
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
    categoria: f.categoria?.nome ?? '',
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
