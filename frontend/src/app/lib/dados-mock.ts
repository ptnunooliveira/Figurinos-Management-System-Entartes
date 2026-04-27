// Tipos de dados da aplicação

export interface Utilizador {
  id: number;
  nome: string;
  email: string;
  contacto: string;
  data_registo: string;
  ativo: boolean;
  tipo: 'aluno' | 'funcionario' | 'encarregado';
  numero_aluno?: number;
  n_mecanografico?: number;
  cargo?: string;
}

export interface Acessorio {
  id: number;
  nome: string;
}

export interface Figurino {
  id: number;
  nome: string;
  descricao: string;
  tamanho: string;
  localizacao: string;
  categoria: string;
  tipo: string;
  sexo: string;
  estado: string;
  imagens: string[];
  acessorios: Acessorio[];
  valor_diario: number;
}

export interface AnuncioEscola {
  id: number;
  figurino: Figurino;
  valor_diario_aluguer: number;
  estado: string;
}

export interface AnuncioMarketplace {
  id: number;
  titulo: string;
  data_anuncio: string;
  data_aprovacao?: string;
  motivo_rejeicao?: string;
  descricao: string;
  tamanho: string;
  categoria: string;
  tipo: string;
  sexo: string;
  estado: string;
  id_utilizador: number;
  imagens: string[];
}

export interface ChecklistItem {
  id: number;
  id_acessorio?: number;
  nome_item: string;
  estado_inicial: string;
  estado_final?: string;
  observacoes_inicial?: string;
  observacoes_final?: string;
}

export interface Checklist {
  id: number;
  data_criacao: string;
  tipo: 'levantamento' | 'devolucao';
  id_linha_reserva: number;
  id_funcionario: number;
  assinatura_funcionario?: string;
  assinatura_cliente?: string;
  items: ChecklistItem[];
}

export interface Reserva {
  id: number;
  data_reserva: string;
  estado: string;
  utilizador: Utilizador;
  funcionario?: Utilizador;
  linhas: LinhaReserva[];
}

export interface LinhaReserva {
  id: number;
  anuncio: AnuncioEscola;
  data_inicio: string;
  data_fim: string;
  valor_diario: number;
  estado: string;
  checklist_levantamento?: Checklist;
  checklist_devolucao?: Checklist;
}

export interface Ocorrencia {
  id: number;
  descricao: string;
  estado: string;
  linha_reserva_id: number;
  data_criacao: string;
  tipo: string;
  valor_proposto?: number;
}

export interface ContaCorrente {
  id: number;
  valor: number;
  data: string;
  tipo_movimento: string;
  descricao: string;
  exportado_faturacao: boolean;
  id_utilizador: number;
}
