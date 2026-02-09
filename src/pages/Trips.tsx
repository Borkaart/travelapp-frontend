import { useEffect, useState } from "react";
import { getMyTrips } from "../api/tripApi";
import { Trip } from "../models/Trip";
import { getApiErrorMessage } from "../api/client";

type Props = {
  onOpenSummary: (tripId: number) => void;
};

export default function Trips({ onOpenSummary }: Props) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getMyTrips()
      .then(setTrips)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando viagens...</p>;

  if (error) return <p style={{ color: "crimson" }}>Erro: {error}</p>;

  return (
    <div>
      <h1>Minhas Viagens</h1>

      {trips.length === 0 && <p>Nenhuma viagem cadastrada.</p>}

      <ul style={{ paddingLeft: 16 }}>
        {trips.map((trip) => (
          <li key={trip.id} style={{ marginBottom: 10 }}>
            <strong>{trip.title}</strong>
            <br />
            <span style={{ opacity: 0.8 }}>
              {trip.startDate} → {trip.endDate}
            </span>
            <br />
            <button
              onClick={() => onOpenSummary(trip.id)}
              style={{
                marginTop: 6,
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(99,102,241,0.18)",
                color: "#e8eefc",
                cursor: "pointer",
              }}
            >
              Ver summary
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
