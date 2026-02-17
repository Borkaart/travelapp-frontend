import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import { getDestinations, type Destination } from "../api/destinationApi";

type TripCreateResponse = { id?: number };

export default function TripCreatePage() {
  const navigate = useNavigate();

  // IMPORTANT: select value sempre string
  const [title, setTitle] = useState("");
  const [destinationId, setDestinationId] = useState(""); // string
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Diagnóstico: confirma que a tela está renderizando
  // eslint-disable-next-line no-console
  console.log("TripCreatePage render");

  const canSubmit = useMemo(() => {
    return (
      title.trim().length > 0 &&
      destinationId.trim().length > 0 &&
      Boolean(startDate) &&
      Boolean(endDate) &&
      !loading
    );
  }, [title, destinationId, startDate, endDate, loading]);

  useEffect(() => {
    (async () => {
      setLoadingDestinations(true);
      setError(null);
      try {
        const list = await getDestinations();
        setDestinations(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(getApiErrorMessage(e));
      } finally {
        setLoadingDestinations(false);
      }
    })();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const t = title.trim();
    if (!t) return setError("Título é obrigatório.");
    if (!destinationId) return setError("Selecione um destino.");
    if (!startDate) return setError("Data inicial é obrigatória.");
    if (!endDate) return setError("Data final é obrigatória.");
    if (endDate < startDate) return setError("Data final não pode ser menor que a inicial.");

    try {
      setLoading(true);

      const res = await api.post<TripCreateResponse>("/trips", {
        title: t,
        destinationId: Number(destinationId),
        startDate,
        endDate,
      });

      // Debug do retorno real
      // eslint-disable-next-line no-console
      console.log("CREATE TRIP RESPONSE:", res.status, res.data);

      const newId = (res.data as any)?.id;
      if (Number.isFinite(Number(newId))) {
        navigate(`/trips/${Number(newId)}/summary`, { replace: true });
      } else {
        navigate("/trips", { replace: true });
      }
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageBg}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>Trips</div>
          <h1 style={{ margin: 0, fontSize: 30, letterSpacing: -0.3 }}>Nova viagem</h1>
          <div style={{ opacity: 0.75, marginTop: 8 }}>
            Defina o destino e o período. Depois você monta roteiro, despesas e orçamento.
          </div>
        </div>

        <div style={card}>
          <form onSubmit={onCreate} style={{ display: "grid", gap: 12 }}>
            <label style={field}>
              <span style={label}>Título</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                placeholder="Ex: Paris 2026"
                style={input}
              />
            </label>

            <label style={field}>
              <span style={label}>Destino</span>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                disabled={loading || loadingDestinations}
                style={input}
              >
                <option value="">
                  {loadingDestinations ? "Carregando destinos..." : "Selecione um destino..."}
                </option>
                {destinations.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={field}>
                <span style={label}>Início</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={loading}
                  style={input}
                />
              </label>

              <label style={field}>
                <span style={label}>Fim</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={loading}
                  style={input}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button
                type="button"
                onClick={() => navigate("/trips")}
                disabled={loading}
                style={btnSecondary}
              >
                Cancelar
              </button>

              <button type="submit" disabled={!canSubmit} style={btnPrimary(canSubmit)}>
                {loading ? "Criando..." : "Criar viagem"}
              </button>
            </div>
          </form>

          {error && <div style={errorBox}>{error}</div>}
        </div>
      </div>
    </div>
  );
}

const pageBg: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(1200px 600px at 20% 0%, #2a2a2a 0%, #141414 60%, #0f0f0f 100%)",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  padding: 24,
};

const card: CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const field: CSSProperties = { display: "grid", gap: 6 };
const label: CSSProperties = { fontSize: 13, opacity: 0.75 };

const input: CSSProperties = {
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  outline: "none",
};

const btnPrimary = (enabled: boolean): CSSProperties => ({
  flex: 1,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(74,222,128,0.35)",
  background: enabled ? "rgba(74,222,128,0.18)" : "rgba(74,222,128,0.08)",
  color: "#CFFFE0",
  fontWeight: 800,
  cursor: enabled ? "pointer" : "not-allowed",
});

const btnSecondary: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.9)",
  cursor: "pointer",
};

const errorBox: CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  background: "rgba(220,38,38,0.12)",
  border: "1px solid rgba(220,38,38,0.30)",
  color: "#fecaca",
};
