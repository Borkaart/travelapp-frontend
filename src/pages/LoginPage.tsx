import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import { setToken } from "../auth";

type LoginResponse = {
  accessToken?: string;
  token?: string;
  jwt?: string;
  access_token?: string;
  tokenType?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (location.state as any)?.from || "/trips";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const res = await api.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });

      const token =
        res.data?.accessToken ||
        res.data?.token ||
        res.data?.jwt ||
        res.data?.access_token;

      if (!token) throw new Error("Token não recebido no login.");

      setToken(token);

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 20% 0%, #2a2a2a 0%, #141414 60%, #0f0f0f 100%)",
        color: "#fff",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Brand / Title */}
        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>
            Travel App
          </div>
          <h1 style={{ margin: 0, fontSize: 30, letterSpacing: -0.3 }}>
            Entrar
          </h1>
          <div style={{ opacity: 0.75, marginTop: 8 }}>
            Acesse sua conta para gerenciar suas viagens.
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>Email</span>
              <input
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                style={{
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>Senha</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                style={{
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  outline: "none",
                }}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(74,222,128,0.35)",
                background: loading ? "rgba(74,222,128,0.10)" : "rgba(74,222,128,0.18)",
                color: "#CFFFE0",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: "rgba(220,38,38,0.12)",
                border: "1px solid rgba(220,38,38,0.30)",
                color: "#fecaca",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, opacity: 0.55, fontSize: 12 }}>
          Dica: use as mesmas credenciais do seu backend (Spring Security).
        </div>
      </div>
    </div>
  );
}
