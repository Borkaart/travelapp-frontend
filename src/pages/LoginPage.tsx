import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    (location.state as any)?.from || "/trips";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const token = res.data?.accessToken || res.data?.token;

      if (!token) {
        throw new Error("Token não recebido");
      }

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
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {error && (
        <p style={{ color: "crimson", marginTop: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}
