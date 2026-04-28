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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401 && path !== '/auth/login') {
    localStorage.removeItem('fighappens_auth');
    localStorage.removeItem('fighappens_token');
    window.location.href = '/login';
  }

  return response;
}
