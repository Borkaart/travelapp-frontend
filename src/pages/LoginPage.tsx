import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";

type LoginResponse = {
  accessToken?: string;
  token?: string;
  jwt?: string;
  access_token?: string;
  tokenType?: string; // se existir
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

      // DEBUG (temporário): veja exatamente o que o backend devolve
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("LOGIN RESPONSE:", res.data);
      }

      const token =
        res.data?.accessToken ||
        res.data?.token ||
        res.data?.jwt ||
        res.data?.access_token;

      if (!token) {
        throw new Error("Token não recebido no login.");
      }

      // se o backend mandar tokenType, você poderia armazenar junto,
      // mas como seu interceptor monta "Bearer <token>", salvamos só o token.
      localStorage.setItem("accessToken", token);

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32, maxWidth: 400 }}>
      <h2>Login</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {error && (
        <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>
      )}
    </div>
  );
}
