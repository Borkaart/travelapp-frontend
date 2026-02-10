import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import {
  createItineraryDay,
  getItineraryDaysByTrip,
  type ItineraryDay,
} from "../../api/itineraryDayApi";

export default function TripItineraryPage() {
  const { tripId } = useParams();
  const tid = Number(tripId);

  const [items, setItems] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getItineraryDaysByTrip(tid));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(tid)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid]);

  async function onCreate() {
    setError(null);
    try {
      if (!date) throw new Error("Data é obrigatória.");

      await createItineraryDay({ tripId: tid, date });

      setOpen(false);
      setDate("");
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Itinerary Days</h3>
        <button onClick={() => setOpen(true)}>+ Adicionar</button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ul>
        {items.map((d) => (
          <li key={d.id}>
            <b>{d.date}</b> — id {d.id}
          </li>
        ))}
      </ul>

      {open && (
        <div style={{ border: "1px solid #ddd", padding: 12, marginTop: 16, borderRadius: 8 }}>
          <h4>Novo dia</h4>

          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <label>
              Data
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onCreate}>Salvar</button>
              <button onClick={() => setOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
