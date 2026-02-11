import axios from "axios";

/**
 * Base URL da API (sempre string)
 * Mantém o padrão: http://localhost:8080/api
 */
const baseURL = String(import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(
  /\/+$/,
  ""
);

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
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

  // Spring validation (custom/global handlers variam)
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
