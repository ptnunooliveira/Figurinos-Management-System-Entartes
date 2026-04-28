const API_URL = 'http://localhost:3000';
const TOKEN_KEY = 'fighappens_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  return fetch(`${API_URL}${path}`, { ...options, headers });
}
