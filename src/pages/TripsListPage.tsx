import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { getTrips, type TripListItem } from "../api/tripApi";

export default function TripsListPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("TripsListPage mounted");
    load();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 20% 0%, #2a2a2a 0%, #141414 60%, #0f0f0f 100%)",
        color: "#fff",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 22,
            position: "relative",
            zIndex: 5,
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 6 }}>
              Dashboard
            </div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: -0.3 }}>
              Suas viagens
            </h1>
            <div style={{ opacity: 0.75, marginTop: 8 }}>
              Gerencie itinerário, atividades, despesas e orçamento em um só lugar.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.9)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Carregando..." : "Recarregar"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/trips/new")}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(74,222,128,0.35)",
                background: "rgba(74,222,128,0.18)",
                color: "#CFFFE0",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              + Nova viagem
            </button>
          </div>
        </div>

        {/* Content card */}
        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {error && (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: "rgba(220,38,38,0.12)",
                border: "1px solid rgba(220,38,38,0.30)",
                color: "#fecaca",
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          {!error && loading && (
            <div style={{ opacity: 0.75 }}>Carregando suas viagens…</div>
          )}

          {!loading && !error && trips.length === 0 && (
            <div
              style={{
                padding: 18,
                borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.80)",
              }}
            >
              Nenhuma viagem cadastrada ainda. Clique em <b>+ Nova viagem</b> para começar.
            </div>
          )}

          {!loading && !error && trips.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 14,
                marginTop: 6,
              }}
            >
              {trips.map((t) => (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/trips/${t.id}/summary`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/trips/${t.id}/summary`);
                    }
                  }}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    cursor: "pointer",
                    transition:
                      "transform 120ms ease, border-color 120ms ease, background 120ms ease",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.055)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0px)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 750, letterSpacing: -0.2 }}>
                    {t.title}
                  </div>

                  <div style={{ opacity: 0.78, marginTop: 6 }}>{t.destinationName}</div>

                  <div style={{ opacity: 0.68, marginTop: 10, fontSize: 13 }}>
                    {t.startDate} → {t.endDate}
                  </div>

                  <div style={{ marginTop: 12, opacity: 0.55, fontSize: 12 }}>
                    Abrir resumo →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
