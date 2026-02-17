import axios from "axios";
import { clearToken, getToken, isJwtExpired } from "../auth";

const baseURL = String(import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

function isAuthEndpoint(config: any) {
  const url = String(config?.url || "");
  // como seu baseURL já é /api, aqui chega "/auth/login"
  return url.startsWith("/auth");
}

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
}

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    // ✅ login/register nunca deve ser bloqueado pelo token antigo
    if (token && isJwtExpired(token) && isAuthEndpoint(config)) {
      clearToken();
      return config; // segue sem Authorization
    }

    if (token) {
      if (isJwtExpired(token)) {
        clearToken();
        redirectToLogin();
        return Promise.reject(new axios.CanceledError("JWT expired"));
      }

      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = String(err?.config?.url || "");

    // ✅ 401 no /auth/login deve aparecer como “credenciais inválidas”,
    // não auto-logout
    if (status === 401 && !url.startsWith("/auth")) {
      clearToken();
      redirectToLogin();
    }

    return Promise.reject(err);
  }
);

export function getApiErrorMessage(err: unknown): string {
  if (axios.isCancel(err)) return "Request cancelled";
  if (!axios.isAxiosError(err)) return "Unexpected error";

  const status = err.response?.status;
  const data = err.response?.data as any;

  const fieldError =
    data?.fieldErrors?.[0]?.defaultMessage ||
    data?.fieldErrors?.[0]?.message ||
    data?.errors?.[0]?.defaultMessage ||
    data?.errors?.[0]?.message;

  if (fieldError) return fieldError;

  const message =
    data?.message ||
    data?.error ||
    data?.detail ||
    (typeof data === "string" ? data : null);

  if (message) return message;

  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "Not found";

  return "Request failed";
}

export default api;
