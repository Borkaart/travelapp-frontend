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
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2>Trips</h2>
        <button onClick={load} disabled={loading}>
          Recarregar
        </button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && trips.length === 0 && <p>Nenhuma viagem cadastrada.</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {trips.map((t) => (
          <div
            key={t.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              cursor: "pointer",
            }}
            onClick={() => navigate(`/trips/${t.id}/summary`)}
          >
            <div style={{ fontWeight: 700 }}>{t.title}</div>
            <div style={{ opacity: 0.85, marginTop: 4 }}>{t.destinationName}</div>
            <div style={{ opacity: 0.75, marginTop: 4 }}>
              {t.startDate} → {t.endDate}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
