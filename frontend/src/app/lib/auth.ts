import type { Utilizador } from './dados-mock';
import { apiFetch, setToken, removeToken } from './api';

const AUTH_KEY = 'fighappens_auth';

function perfilToTipo(perfil: string): 'aluno' | 'funcionario' | 'encarregado' {
  if (perfil === 'ALUNO') return 'aluno';
  return 'funcionario';
}

export async function login(email: string, password: string): Promise<Utilizador | null> {
  try {
    removeToken();
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    setToken(data.token);

    const meRes = await apiFetch('/auth/me');
    if (!meRes.ok) {
      removeToken();
      return null;
    }

    const user = await meRes.json();
    const utilizador: Utilizador = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      contacto: user.contacto ?? '',
      data_registo: user.data_registo ?? '',
      ativo: true,
      tipo: perfilToTipo(user.perfil),
      perfil: user.perfil,
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(utilizador));
    return utilizador;
  } catch {
    removeToken();
    return null;
  }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  removeToken();
}

export function getUtilizadorAtual(): Utilizador | null {
  const stored = localStorage.getItem(AUTH_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return getUtilizadorAtual() !== null;
}

export function isFuncionario(): boolean {
  const user = getUtilizadorAtual();
  return user?.tipo === 'funcionario';
}
