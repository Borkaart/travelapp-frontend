import axios from "axios";

/**
 * Base URL da API.
 * No Vite, variáveis expostas ao browser precisam começar com VITE_
 */
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function getApiErrorMessage(err: unknown): string {
  if (!axios.isAxiosError(err)) return "Unexpected error";

  const status = err.response?.status;
  const data = err.response?.data as any;

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
