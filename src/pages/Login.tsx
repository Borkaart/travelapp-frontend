import { useState } from "react";
import api, { getApiErrorMessage } from "../api/client";

type Props = {
  onSuccess: () => void;
};

export default function Login({ onSuccess }: Props) {
  const [email, setEmail] = useState("teste@email.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      const accessToken =
        res.data?.accessToken ||
        res.data?.token ||
        res.data?.access_token ||
        null;

      if (!accessToken) {
        throw new Error("Resposta do login não trouxe accessToken/token.");
      }

      localStorage.setItem("accessToken", accessToken);
      onSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 360 }}>
      <h1>Login</h1>

      <div style={{ marginBottom: 8 }}>
        <label>Email</label>
        <input
          style={{ width: "100%", padding: 8 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Senha</label>
        <input
          style={{ width: "100%", padding: 8 }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {error && (
        <p style={{ marginTop: 8, color: "crimson" }}>
          Erro: {error}
        </p>
      )}
    </form>
  );
}
