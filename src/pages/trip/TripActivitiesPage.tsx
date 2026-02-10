import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import {
  createActivity,
  getActivitiesByItineraryDay,
  type Activity,
} from "../../api/activityApi";
import {
  getItineraryDaysByTrip,
  type ItineraryDay,
} from "../../api/itineraryDayApi";

type ActivityType =
  | "SIGHTSEEING"
  | "FOOD"
  | "TRANSPORT"
  | "HOTEL"
  | "TOUR"
  | "SHOPPING"
  | "OTHER";

export default function TripActivitiesPage() {
  const { tripId } = useParams();
  const tid = Number(tripId);

  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<number | "">("");
  const [items, setItems] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);

  // Form
  const [type, setType] = useState<ActivityType>("FOOD");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function resetForm() {
    setType("FOOD");
    setStartTime("");
    setEndTime("");
    setTitle("");
    setDescription("");
  }

  async function loadDays() {
    setLoading(true);
    setError(null);
    try {
      const d = await getItineraryDaysByTrip(tid);
      setDays(d);
      if (d.length > 0) setSelectedDayId(d[0].id);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  async function loadActivities(itineraryDayId: number) {
    setLoadingActivities(true);
    setError(null);
    try {
      const a = await getActivitiesByItineraryDay(itineraryDayId);
      setItems(a);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoadingActivities(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(tid)) return;
    loadDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid]);

  useEffect(() => {
    if (selectedDayId === "") {
      setItems([]);
      return;
    }
    loadActivities(selectedDayId as number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayId]);

  async function onCreate() {
    setError(null);
    try {
      if (!title.trim()) throw new Error("Título é obrigatório.");
      if (selectedDayId === "") throw new Error("Selecione um dia do roteiro.");

      const payload: any = {
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        itineraryDayId: selectedDayId as number,
        type, // obrigatório no backend
      };

      // LocalTime precisa ser "HH:mm" (input time retorna "HH:mm")
      if (startTime) payload.startTime = startTime;
      if (endTime) payload.endTime = endTime;

      await createActivity(payload);

      setOpen(false);
      resetForm();

      await loadActivities(selectedDayId as number);
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Activities</h3>
        <button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          disabled={days.length === 0}
        >
          + Adicionar
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <label>
          Dia do roteiro:&nbsp;
          <select
            value={selectedDayId}
            onChange={(e) => setSelectedDayId(Number(e.target.value))}
            disabled={days.length === 0}
          >
            {days.length === 0 && <option value="">Nenhum dia cadastrado</option>}
            {days.map((d) => (
              <option key={d.id} value={d.id}>
                {d.date} (id {d.id})
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => selectedDayId !== "" && loadActivities(selectedDayId as number)}
          disabled={selectedDayId === "" || loadingActivities}
        >
          Recarregar
        </button>
      </div>

      {loadingActivities ? (
        <p>Carregando atividades...</p>
      ) : (
        <ul>
          {items.map((a) => (
            <li key={a.id}>
              <b>{a.title}</b>
              {a.description ? ` — ${a.description}` : null}
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div style={{ border: "1px solid #ddd", padding: 12, marginTop: 16, borderRadius: 8 }}>
          <h4>Nova Activity</h4>

          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <div style={{ opacity: 0.8 }}>
              Será criada no dia:{" "}
              <b>{days.find((d) => d.id === selectedDayId)?.date ?? "(selecione um dia)"}</b>
            </div>

            <label>
              Tipo
              <select value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
                <option value="SIGHTSEEING">Sightseeing</option>
                <option value="FOOD">Food</option>
                <option value="TRANSPORT">Transport</option>
                <option value="HOTEL">Hotel</option>
                <option value="TOUR">Tour</option>
                <option value="SHOPPING">Shopping</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label>
              Início (opcional)
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </label>

            <label>
              Fim (opcional)
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </label>

            <label>
              Título
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label>
              Descrição (opcional)
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onCreate}>Salvar</button>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
