import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import { setToken } from "../auth";
import { inputSurfaceStyle, primaryButtonStyle, secondaryButtonStyle } from "../shared/ui/styles";
import { ui } from "../shared/ui/tokens";

type LoginResponse = {
  accessToken?: string;
  token?: string;
  jwt?: string;
  access_token?: string;
};

type LoginLocationState = {
  from?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = (location.state as LoginLocationState | null)?.from || "/trips";

  const [registerMode, setRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      const res = await api.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });

      const token =
        res.data?.accessToken || res.data?.token || res.data?.jwt || res.data?.access_token;

      if (!token) throw new Error("Token nao recebido no login.");

      setToken(token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      await api.post("/users", {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSuccess("Usuario criado com sucesso. Agora faca login.");
      setRegisterMode(false);
      setName("");
      setPassword("");
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
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ marginBottom: 16, textAlign: "left" }}>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>Travel App</div>
          <h1 style={{ margin: 0, fontSize: 30, letterSpacing: -0.3 }}>
            {registerMode ? "Criar usuario" : "Entrar"}
          </h1>
          <div style={{ opacity: 0.75, marginTop: 8 }}>
            {registerMode
              ? "Cadastre uma conta para comecar a gerenciar suas viagens."
              : "Acesse sua conta para gerenciar suas viagens."}
          </div>
        </div>

        <div
          style={{
            padding: ui.space.xl,
            borderRadius: ui.radius.xl,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <form onSubmit={registerMode ? onRegister : onSubmit} style={{ display: "grid", gap: ui.space.md }}>
            {registerMode ? (
              <label style={{ display: "grid", gap: 6 }}>
                <span style={{ fontSize: 13, opacity: 0.75 }}>Nome</span>
                <input
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                  style={inputStyle}
                />
              </label>
            ) : null}

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>Email</span>
              <input
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, opacity: 0.75 }}>Senha</span>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={registerMode ? "new-password" : "current-password"}
                disabled={loading}
                style={inputStyle}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle(),
                marginTop: 4,
                padding: "12px 14px",
                background: loading ? "rgba(74,222,128,0.10)" : "rgba(74,222,128,0.18)",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (registerMode ? "Criando..." : "Entrando...") : registerMode ? "Criar usuario" : "Entrar"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setRegisterMode((current) => !current);
                setError(null);
                setSuccess(null);
              }}
              style={{
                ...secondaryButtonStyle(),
                padding: "12px 14px",
              }}
            >
              {registerMode ? "Voltar para login" : "Criar novo usuario"}
            </button>
          </form>

          {error ? (
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
          ) : null}

          {success ? (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.30)",
                color: "#d9ffe9",
              }}
            >
              {success}
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 12, opacity: 0.55, fontSize: 12 }}>
          Dica: use as mesmas credenciais do backend.
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  ...inputSurfaceStyle(),
};
