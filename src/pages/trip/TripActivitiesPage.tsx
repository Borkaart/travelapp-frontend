import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import {
  createActivity,
  deleteActivity,
  getActivitiesByItineraryDay,
  updateActivity,
  type Activity,
} from "../../api/activityApi";
import { getItineraryDaysByTrip, type ItineraryDay } from "../../api/itineraryDayApi";

type OutletCtx = { refreshKey: number; triggerRefresh: () => void };

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

  // form
  const [type, setType] = useState<ActivityType>("FOOD");
  const [time, setTime] = useState(""); // "HH:mm"
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

  function openEditModal(a: Activity) {
    setEditing(a);

    setType(a.type as ActivityType);
    setTitle(a.title ?? "");
    setPlace((a as any).place ?? "");
    setNotes((a as any).notes ?? "");

    const t = (a as any).time;
    setTime(t ? String(t).slice(0, 5) : ""); // "HH:mm:ss" -> "HH:mm"

    const c = (a as any).cost;
    setCost(c !== null && c !== undefined ? String(c) : "");

    setOpen(true);
  }

  async function loadDays() {
    if (!Number.isFinite(tid)) return;

    setLoading(true);
    setError(null);
    try {
      const d = await getItineraryDaysByTrip(tid);
      setDays(d);
      if (d.length > 0) setSelectedDayId(d[0].id);
      else setSelectedDayId("");
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

  async function onSubmit() {
    console.log("ACTIVITY SUBMIT CLICKED");
    setError(null);
    setSaving(true);

    try {
      if (!title.trim()) throw new Error("Título é obrigatório.");
      if (selectedDayId === "") throw new Error("Selecione um dia.");

      const payload: any = {
        title: title.trim(),
        type,
      };

      if (place.trim()) payload.place = place.trim();
      if (notes.trim()) payload.notes = notes.trim();
      if (time) payload.time = time;

      if (cost !== "") {
        const n = Number(cost);
        if (!Number.isFinite(n) || n < 0) throw new Error("Custo inválido.");
        payload.cost = n;
      }

      console.log("ACTIVITY PAYLOAD:", payload);

      if (editing) {
        await updateActivity(editing.id, payload);
      } else {
        await createActivity({
          ...payload,
          itineraryDayId: selectedDayId as number,
        });
      }

      setOpen(false);
      setEditing(null);
      resetForm();

      await loadActivities(selectedDayId as number);

      // ✅ AUTO REFRESH SUMMARY
      triggerRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(a: Activity) {
    setError(null);
    if (!confirm(`Excluir "${a.title}"?`)) return;

    setSaving(true);
    try {
      await deleteActivity(a.id);

      if (selectedDayId !== "") {
        await loadActivities(selectedDayId as number);
      }

      // ✅ AUTO REFRESH SUMMARY
      triggerRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando...</p>;
  if (!Number.isFinite(tid)) return <p>Trip inválida.</p>;

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
            {days.map((d) => (
              <option key={d.id} value={d.id}>
                {d.date} (id {d.id})
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => selectedDayId !== "" && loadActivities(selectedDayId as number)}
          disabled={selectedDayId === "" || loadingActivities || saving}
        >
          Recarregar
        </button>
      </div>

      {loadingActivities ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {items.map((a) => {
            const placeV = (a as any).place;
            const notesV = (a as any).notes;
            const timeV = (a as any).time;
            const costV = (a as any).cost;

            return (
              <li key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <b>{a.title}</b> <span style={{ opacity: 0.8 }}>({a.type})</span>
                  {placeV ? <div style={{ opacity: 0.85 }}>{placeV}</div> : null}
                  {notesV ? <div style={{ opacity: 0.75 }}>{notesV}</div> : null}
                  <div style={{ opacity: 0.75 }}>
                    {timeV ? `⏰ ${String(timeV).slice(0, 5)}` : ""}
                    {costV !== null && costV !== undefined
                      ? ` • 💰 ${Number(costV).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}`
                      : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => openEditModal(a)} disabled={saving}>
                    Editar
                  </button>
                  <button type="button" onClick={() => onDelete(a)} disabled={saving}>
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <div style={{ border: "1px solid #ddd", padding: 12, marginTop: 16, borderRadius: 8 }}>
          <h4>{editing ? "Editar Activity" : "Nova Activity"}</h4>

          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            {!editing && (
              <div style={{ opacity: 0.8 }}>
                Será criada no dia:{" "}
                <b>{days.find((d) => d.id === selectedDayId)?.date ?? "(selecione um dia)"}</b>
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
              Título
              <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
            </label>

            <label>
              Local (opcional)
              <input value={place} onChange={(e) => setPlace(e.target.value)} disabled={saving} />
            </label>

            <label>
              Observações (opcional)
              <input value={notes} onChange={(e) => setNotes(e.target.value)} disabled={saving} />
            </label>

            <label>
              Horário (opcional)
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
