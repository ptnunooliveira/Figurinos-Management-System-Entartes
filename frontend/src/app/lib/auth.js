import { apiFetch, setToken, removeToken } from "./api";
const AUTH_KEY = "fighappens_auth";
function perfilToTipo(perfil) {
  if (perfil === "ALUNO") return "aluno";
  if (perfil === "ADMIN") return "admin";
  return "funcionario";
}
async function login(email, password) {
  try {
    removeToken();
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) return null;
    const data = await res.json();
    setToken(data.token);
    const meRes = await apiFetch("/auth/me");
    if (!meRes.ok) {
      removeToken();
      return null;
    }
    const user = await meRes.json();
    const utilizador = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      contacto: user.contacto ?? "",
      data_registo: user.data_registo ? new Date(user.data_registo).toISOString() : "",
      ativo: true,
      tipo: perfilToTipo(user.perfil),
      perfil: user.perfil
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(utilizador));
    return utilizador;
  } catch {
    removeToken();
    return null;
  }
}
function logout() {
  localStorage.removeItem(AUTH_KEY);
  removeToken();
}
function getUtilizadorAtual() {
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
function isAuthenticated() {
  return getUtilizadorAtual() !== null;
}
function isFuncionario() {
  const user = getUtilizadorAtual();
  return user?.tipo === "funcionario";
}
export {
  getUtilizadorAtual,
  isAuthenticated,
  isFuncionario,
  login,
  logout
};
