import axios, { type InternalAxiosRequestConfig } from "axios";
import { clearToken, getToken, isJwtExpired } from "../auth";

type ApiValidationMessage = {
  defaultMessage?: string;
  message?: string;
};

type ApiErrorPayload = {
  fieldErrors?: ApiValidationMessage[];
  errors?: ApiValidationMessage[];
  message?: string;
  error?: string;
  detail?: string;
};

const baseURL = String(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080/api",
).replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

function isAuthEndpoint(config: InternalAxiosRequestConfig) {
  const url = String(config.url || "");
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

    if (token && isJwtExpired(token) && isAuthEndpoint(config)) {
      clearToken();
      return config;
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
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = String(err?.config?.url || "");

    if (status === 401 && !url.startsWith("/auth")) {
      clearToken();
      redirectToLogin();
    }

    return Promise.reject(err);
  },
);

export function getApiErrorMessage(err: unknown): string {
  if (axios.isCancel(err)) return "Request cancelled";
  if (!axios.isAxiosError(err)) return "Unexpected error";

  const status = err.response?.status;
  const data = err.response?.data as ApiErrorPayload | string | undefined;

  if (typeof data === "string") return data;

  const fieldError =
    data?.fieldErrors?.[0]?.defaultMessage ||
    data?.fieldErrors?.[0]?.message ||
    data?.errors?.[0]?.defaultMessage ||
    data?.errors?.[0]?.message;

  if (fieldError) return fieldError;

  const message = data?.message || data?.error || data?.detail;

  if (message) return message;

  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "Not found";

  return "Request failed";
}

export default api;
