import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import {
  createActivity,
  deleteActivity,
  getActivitiesByItineraryDay,
  updateActivity,
  type Activity,
  type ActivityCreateRequest,
  type ActivityType,
  type ActivityUpdateRequest,
} from "../../api/activityApi";
import { getItineraryDaysByTrip, type ItineraryDay } from "../../api/itineraryDayApi";

type OutletCtx = { refreshKey: number; triggerRefresh: () => void };

export default function TripActivitiesPage() {
  const { tripId } = useParams();
  const tid = Number(tripId);

  const { triggerRefresh } = useOutletContext<OutletCtx>();

  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<number | "">("");
  const [items, setItems] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const [type, setType] = useState<ActivityType>("FOOD");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");

  function resetForm() {
    setType("FOOD");
    setTime("");
    setPlace("");
    setNotes("");
    setTitle("");
    setCost("");
  }

  function openCreateModal() {
    setEditing(null);
    resetForm();
    setOpen(true);
  }

  function openEditModal(activity: Activity) {
    setEditing(activity);
    setType(activity.type);
    setTitle(activity.title ?? "");
    setPlace(activity.place ?? "");
    setNotes(activity.notes ?? "");
    setTime(activity.time ? String(activity.time).slice(0, 5) : "");
    setCost(activity.cost != null ? String(activity.cost) : "");
    setOpen(true);
  }

  useEffect(() => {
    if (!Number.isFinite(tid)) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getItineraryDaysByTrip(tid);
        setDays(data);
        setSelectedDayId(data.length > 0 ? data[0].id : "");
      } catch (e) {
        setError(getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [tid]);

  useEffect(() => {
    if (selectedDayId === "") {
      setItems([]);
      return;
    }

    (async () => {
      setLoadingActivities(true);
      setError(null);
      try {
        const data = await getActivitiesByItineraryDay(selectedDayId);
        setItems(data);
      } catch (e) {
        setError(getApiErrorMessage(e));
      } finally {
        setLoadingActivities(false);
      }
    })();
  }, [selectedDayId]);

  async function reloadActivities(dayId: number) {
    const data = await getActivitiesByItineraryDay(dayId);
    setItems(data);
  }

  async function onSubmit() {
    setError(null);
    setSaving(true);

    try {
      if (!title.trim()) throw new Error("Titulo e obrigatorio.");
      if (selectedDayId === "") throw new Error("Selecione um dia.");

      const payload: ActivityUpdateRequest = {
        title: title.trim(),
        type,
        place: place.trim() || undefined,
        notes: notes.trim() || undefined,
        time: time || undefined,
      };

      if (cost !== "") {
        const parsedCost = Number(cost);
        if (!Number.isFinite(parsedCost) || parsedCost < 0) throw new Error("Custo invalido.");
        payload.cost = parsedCost;
      }

      if (editing) {
        await updateActivity(editing.id, payload);
      } else {
        const createPayload: ActivityCreateRequest = {
          itineraryDayId: selectedDayId,
          title: title.trim(),
          type,
          place: payload.place,
          notes: payload.notes,
          time: payload.time,
          cost: payload.cost,
        };

        await createActivity(createPayload);
      }

      setOpen(false);
      setEditing(null);
      resetForm();

      await reloadActivities(selectedDayId);
      triggerRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(activity: Activity) {
    setError(null);
    if (!confirm(`Excluir "${activity.title}"?`)) return;

    setSaving(true);
    try {
      await deleteActivity(activity.id);

      if (selectedDayId !== "") {
        await reloadActivities(selectedDayId);
      }

      triggerRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando...</p>;
  if (!Number.isFinite(tid)) return <p>Trip invalida.</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Activities</h3>
        <button type="button" onClick={openCreateModal} disabled={days.length === 0 || saving}>
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
            disabled={days.length === 0 || saving}
          >
            {days.length === 0 && <option value="">Nenhum dia cadastrado</option>}
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                {day.date} (id {day.id})
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => selectedDayId !== "" && reloadActivities(selectedDayId)}
          disabled={selectedDayId === "" || loadingActivities || saving}
        >
          Recarregar
        </button>
      </div>

      {loadingActivities ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {items.map((activity) => (
            <li key={activity.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <b>{activity.title}</b> <span style={{ opacity: 0.8 }}>({activity.type})</span>
                {activity.place ? <div style={{ opacity: 0.85 }}>{activity.place}</div> : null}
                {activity.notes ? <div style={{ opacity: 0.75 }}>{activity.notes}</div> : null}
                <div style={{ opacity: 0.75 }}>
                  {activity.time ? `Hora ${String(activity.time).slice(0, 5)}` : ""}
                  {activity.cost != null
                    ? ` - ${Number(activity.cost).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}`
                    : ""}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => openEditModal(activity)} disabled={saving}>
                  Editar
                </button>
                <button type="button" onClick={() => onDelete(activity)} disabled={saving}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div style={{ border: "1px solid #ddd", padding: 12, marginTop: 16, borderRadius: 8 }}>
          <h4>{editing ? "Editar Activity" : "Nova Activity"}</h4>

          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            {!editing && (
              <div style={{ opacity: 0.8 }}>
                Sera criada no dia:{" "}
                <b>{days.find((day) => day.id === selectedDayId)?.date ?? "(selecione um dia)"}</b>
              </div>
            )}

            <label>
              Tipo
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                disabled={saving}
              >
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
              Titulo
              <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
            </label>

            <label>
              Local (opcional)
              <input value={place} onChange={(e) => setPlace(e.target.value)} disabled={saving} />
            </label>

            <label>
              Observacoes (opcional)
              <input value={notes} onChange={(e) => setNotes(e.target.value)} disabled={saving} />
            </label>

            <label>
              Horario (opcional)
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={saving}
              />
            </label>

            <label>
              Custo (opcional)
              <input
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                inputMode="decimal"
                placeholder="ex: 50.00"
                disabled={saving}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={onSubmit} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
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
