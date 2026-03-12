import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plane, User, Lock, Mail, ArrowRight } from "lucide-react";
import api, { getApiErrorMessage } from "../api/client";
import { setToken } from "../auth";
import {
  inputSurfaceStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
  glassCardStyle,
} from "../shared/ui/styles";
import { ui } from "../shared/ui/tokens";
import { images } from "../shared/ui/assets";
import { ThemeToggle } from "../shared/ui/ThemeToggle";

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

      if (!token) throw new Error("Token não recebido no login.");

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
      setSuccess("Usuário criado com sucesso. Agora faça login.");
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
        background: `url(${images.loginBackground}) no-repeat center center / cover`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: ui.space.lg,
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: ui.space.lg, right: ui.space.lg }}>
        <ThemeToggle />
      </div>

      <div
        className="fade-in"
        style={{
          ...glassCardStyle(),
          width: "100%",
          maxWidth: 440,
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: ui.space.xl }}>
          <div
            style={{
              display: "inline-flex",
              padding: ui.space.md,
              background: ui.colors.primary[500],
              borderRadius: ui.radius.full,
              marginBottom: ui.space.md,
              boxShadow: ui.shadows.lg,
            }}
          >
            <Plane size={32} color="white" />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: ui.typography.fontSize["3xl"],
              fontWeight: ui.typography.fontWeight.bold,
              color: ui.colors.neutral[900],
            }}
          >
            {registerMode ? "Comece sua Aventura" : "Bem-vindo de Volta"}
          </h1>
          <p
            style={{
              marginTop: ui.space.sm,
              color: ui.colors.neutral[600],
              fontSize: ui.typography.fontSize.sm,
            }}
          >
            {registerMode
              ? "Crie sua conta para planejar viagens inesquecíveis."
              : "Acesse para continuar sua jornada."}
          </p>
        </div>

        <form onSubmit={registerMode ? onRegister : onSubmit} style={{ display: "grid", gap: ui.space.md }}>
          {registerMode && (
            <div style={{ position: "relative" }}>
              <User
                size={20}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: ui.colors.neutral[400],
                }}
              />
              <input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={loading}
                style={{
                  ...inputSurfaceStyle(),
                  paddingLeft: 40,
                }}
              />
            </div>
          )}

          <div style={{ position: "relative" }}>
            <Mail
              size={20}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: ui.colors.neutral[400],
              }}
            />
            <input
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
              style={{
                ...inputSurfaceStyle(),
                paddingLeft: 40,
              }}
            />
          </div>

          <div style={{ position: "relative" }}>
            <Lock
              size={20}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: ui.colors.neutral[400],
              }}
            />
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={registerMode ? "new-password" : "current-password"}
              disabled={loading}
              style={{
                ...inputSurfaceStyle(),
                paddingLeft: 40,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...primaryButtonStyle(),
              width: "100%",
              marginTop: ui.space.sm,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              "Processando..."
            ) : (
              <>
                {registerMode ? "Criar Conta" : "Entrar"}
                <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </>
            )}
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
              width: "100%",
              border: "none",
              background: "transparent",
              color: ui.colors.primary[600],
              boxShadow: "none",
            }}
          >
            {registerMode ? "Já tem uma conta? Entrar" : "Não tem conta? Cadastre-se"}
          </button>
        </form>

        {error && (
          <div
            className="slide-up"
            style={{
              marginTop: ui.space.md,
              padding: ui.space.md,
              borderRadius: ui.radius.md,
              background: "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${ui.colors.error}`,
              color: ui.colors.error,
              fontSize: ui.typography.fontSize.sm,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="slide-up"
            style={{
              marginTop: ui.space.md,
              padding: ui.space.md,
              borderRadius: ui.radius.md,
              background: "rgba(34, 197, 94, 0.1)",
              border: `1px solid ${ui.colors.success}`,
              color: ui.colors.success,
              fontSize: ui.typography.fontSize.sm,
            }}
          >
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
