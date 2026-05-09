const API_URL = "http://localhost:3000";
const TOKEN_KEY = "fighappens_token";
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
async function apiFetch(path, options = {}) {
  const token = getToken();
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...options.headers || {},
    ...token ? { Authorization: `Bearer ${token}` } : {}
  };
  const hasBody = options.body !== void 0 && options.body !== null;
  if (hasBody && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && path !== "/auth/login") {
    localStorage.removeItem("fighappens_auth");
    localStorage.removeItem("fighappens_token");
    window.location.href = "/login";
  }
  return response;
}
export {
  apiFetch,
  getToken,
  removeToken,
  setToken
};
