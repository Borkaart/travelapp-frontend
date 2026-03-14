import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import {
  createActivity,
  deleteActivity,
  getActivitiesByItineraryDay,
  reorderActivities,
  updateActivity,
  type Activity,
  type ActivityCreateRequest,
  type ActivityType,
  type ActivityUpdateRequest,
} from "../../api/activityApi";
import { getItineraryDaysByTrip, type ItineraryDay } from "../../api/itineraryDayApi";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { ghostButtonStyle, primaryButtonStyle } from "../../shared/ui/styles";
import { ui } from "../../shared/ui/tokens";
import type { TripOutletContext } from "./TripLayout";

export default function TripItineraryPage() {
  const { tripId } = useParams();
  const tid = Number(tripId);
  const { triggerRefresh } = useOutletContext<TripOutletContext>();
  const isNarrow = useMediaQuery("(max-width: 720px)");

  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingActivityId, setDraggingActivityId] = useState<number | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const [type, setType] = useState<ActivityType>("SIGHTSEEING");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");

  const selectedDay = useMemo(
    () => days.find((day) => day.id === selectedDayId) ?? null,
    [days, selectedDayId],
  );

  const plannedCost = useMemo(
    () => activities.reduce((total, activity) => total + Number(activity.cost ?? 0), 0),
    [activities],
  );

  const periodGroups = useMemo(() => {
    const groups: Array<{ key: DayPeriod; label: string; items: Activity[] }> = [
      { key: "morning", label: "Manha", items: [] },
      { key: "afternoon", label: "Tarde", items: [] },
      { key: "night", label: "Noite", items: [] },
      { key: "anytime", label: "Sem horario", items: [] },
    ];

    for (const activity of activities) {
      groups.find((group) => group.key === periodForActivity(activity))?.items.push(activity);
    }

    return groups.filter((group) => group.items.length > 0);
  }, [activities]);

  function resetForm() {
    setType("SIGHTSEEING");
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
        setSelectedDayId((current) => current ?? data[0]?.id ?? null);
      } catch (e) {
        setError(getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [tid]);

  useEffect(() => {
    if (!selectedDayId) {
      setActivities([]);
      return;
    }

    (async () => {
      setLoadingActivities(true);
      setError(null);
      try {
        const data = await getActivitiesByItineraryDay(selectedDayId);
        setActivities(data);
      } catch (e) {
        setError(getApiErrorMessage(e));
      } finally {
        setLoadingActivities(false);
      }
    })();
  }, [selectedDayId]);

  async function reloadActivities(dayId: number) {
    const data = await getActivitiesByItineraryDay(dayId);
    setActivities(data);
  }

  async function onSubmit() {
    setError(null);
    setSaving(true);

    try {
      if (!title.trim()) throw new Error("Titulo e obrigatorio.");
      if (!selectedDayId) throw new Error("Selecione um dia.");

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
    if (!confirm(`Excluir "${activity.title}"?`)) return;

    setSaving(true);
    setError(null);
    try {
      await deleteActivity(activity.id);
      if (selectedDayId) {
        await reloadActivities(selectedDayId);
      }
      triggerRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function onReorder(sourceActivityId: number, targetActivityId: number) {
    if (!selectedDayId || sourceActivityId === targetActivityId) return;

    const sourcePeriod = periodForActivity(activities.find((item) => item.id === sourceActivityId) ?? null);
    const targetPeriod = periodForActivity(activities.find((item) => item.id === targetActivityId) ?? null);

    if (sourcePeriod !== targetPeriod) return;

    const periodItems = activities.filter((item) => periodForActivity(item) === sourcePeriod);
    const sourceIndex = periodItems.findIndex((item) => item.id === sourceActivityId);
    const targetIndex = periodItems.findIndex((item) => item.id === targetActivityId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const reorderedPeriodItems = [...periodItems];
    const [moved] = reorderedPeriodItems.splice(sourceIndex, 1);
    reorderedPeriodItems.splice(targetIndex, 0, moved);

    const reorderedIds = activities
      .map((item) => item.id)
      .filter((id) => !periodItems.some((item) => item.id === id));

    const periodInsertionIndex = activities.findIndex((item) => periodForActivity(item) === sourcePeriod);
    reorderedIds.splice(periodInsertionIndex, 0, ...reorderedPeriodItems.map((item) => item.id));

    setSaving(true);
    setError(null);
    try {
      const updatedActivities = await reorderActivities({
        itineraryDayId: selectedDayId,
        activityIds: reorderedIds,
      });
      setActivities(updatedActivities);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
      setDraggingActivityId(null);
    }
  }

  if (loading) return <p>Carregando itinerary...</p>;
  if (!Number.isFinite(tid)) return <p>Trip invalida.</p>;

  return (
    <div style={{ minHeight: "100%", display: "grid", alignContent: "start", gap: ui.space.xl }}>
      <div style={hero}>
        <div>
          <h3 style={{ margin: 0, fontSize: isNarrow ? 24 : 28 }}>Itinerary</h3>
          <div style={{ marginTop: 8, opacity: 0.78, maxWidth: 700 }}>
            Seus dias ja foram preparados com base no periodo da viagem. Escolha um dia e monte a agenda com horarios,
            deslocamentos, passeios e reservas.
          </div>
        </div>
        <div style={heroStats}>
          <StatCard label="Dias planejados" value={String(days.length)} />
          <StatCard label="Atividades do dia" value={String(activities.length)} />
          <StatCard label="Custo previsto" value={formatMoney(plannedCost)} />
        </div>
      </div>

      {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}

      <div style={dayRail}>
        {days.map((day, index) => {
          const active = day.id === selectedDayId;

          return (
            <button
              key={day.id}
              type="button"
              onClick={() => setSelectedDayId(day.id)}
              style={dayCard(active)}
            >
              <div style={{ fontSize: 12, opacity: 0.68 }}>Dia {index + 1}</div>
              <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>{formatDate(day.date)}</div>
              <div style={{ marginTop: 4, opacity: 0.78, textTransform: "capitalize" }}>{formatWeekday(day.date)}</div>
            </button>
          );
        })}
      </div>

      {selectedDay ? (
        <section style={{ ...agendaShell, padding: isNarrow ? ui.space.lg : 20 }}>
          <div style={{ ...agendaHeader, alignItems: isNarrow ? "flex-start" : "center" }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase", opacity: 0.62 }}>
                Agenda do dia
              </div>
              <div style={{ marginTop: 6, fontSize: 28, fontWeight: 800, textTransform: "capitalize" }}>
                {formatWeekday(selectedDay.date)}
              </div>
              <div style={{ marginTop: 4, opacity: 0.76 }}>{formatLongDate(selectedDay.date)}</div>
            </div>

            <button type="button" onClick={openCreateModal} disabled={saving} style={{ ...primaryBtn, width: isNarrow ? "100%" : undefined }}>
              + Nova atividade
            </button>
          </div>

          {loadingActivities ? (
            <p>Carregando atividades...</p>
          ) : activities.length === 0 ? (
            <div style={emptyBox}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Nenhuma atividade planejada</div>
              <div style={{ marginTop: 6, opacity: 0.84 }}>
                Preencha esse dia com horarios, locais e tarefas para transformar o roteiro em uma agenda real.
              </div>
            </div>
          ) : (
            <div style={timeline}>
              {periodGroups.map((group) => (
                <section key={group.key} style={periodSection}>
                  <div style={periodHeader}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{group.label}</div>
                    <div style={{ opacity: 0.68 }}>{group.items.length} atividade(s)</div>
                  </div>

                  <div style={{ display: "grid", gap: ui.space.lg }}>
                    {group.items.map((activity, index) => (
                      <article
                        key={activity.id}
                        style={{
                          ...timelineRow,
                          gridTemplateColumns: isNarrow ? "1fr" : "96px 20px minmax(0, 1fr)",
                          opacity: draggingActivityId === activity.id ? 0.62 : 1,
                        }}
                        draggable={!saving}
                        onDragStart={() => setDraggingActivityId(activity.id)}
                        onDragEnd={() => setDraggingActivityId(null)}
                        onDragOver={(event) => {
                          event.preventDefault();
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (draggingActivityId) {
                            onReorder(draggingActivityId, activity.id);
                          }
                        }}
                        onTouchStart={() => {
                          // Simple press-and-hold for mobile reordering simulation
                          const timer = setTimeout(() => {
                            setDraggingActivityId(activity.id);
                          }, 500);
                          (window as any)._touchTimer = timer;
                        }}
                        onTouchEnd={() => {
                          const timer = (window as any)._touchTimer;
                          if (timer) clearTimeout(timer);
                          
                          // If we were "dragging" on mobile, and released over another item,
                          // we would need a drop target. Native touch doesn't trigger onDrop easily.
                          // For now, we mainly provide the visual cue of "dragging".
                          // A full mobile dnd would require coordinate tracking.
                        }}
                      >
                        <div style={{ ...timeColumn, justifyContent: isNarrow ? "flex-start" : "flex-end", paddingTop: isNarrow ? 0 : 10 }}>
                          <div style={timeBadge}>{activity.time ? String(activity.time).slice(0, 5) : "Livre"}</div>
                          <div style={{ marginTop: 8, opacity: 0.55, fontSize: 12 }}>#{index + 1}</div>
                        </div>

                        {!isNarrow ? (
                          <div style={timelineTrack}>
                            <div style={timelineDot} />
                            <div style={timelineLine} />
                          </div>
                        ) : null}

                        <div style={activityCard}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                            <div>
                              <div style={activityTypeTag(activity.type)}>{labelForType(activity.type)}</div>
                              <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800 }}>{activity.title}</div>
                            </div>

                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                              <button type="button" onClick={() => openEditModal(activity)} disabled={saving} style={ghostBtn}>
                                Editar
                              </button>
                              <button type="button" onClick={() => onDelete(activity)} disabled={saving} style={ghostBtn}>
                                Excluir
                              </button>
                            </div>
                          </div>

                          <div style={metaRow}>
                            {activity.place ? <InfoPill label="Local" value={activity.place} /> : null}
                            {activity.cost != null ? <InfoPill label="Custo" value={formatMoney(activity.cost)} /> : null}
                          </div>

                          {activity.notes ? <div style={notesBox}>{activity.notes}</div> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {open && (
        <div style={modalCard}>
          <h4 style={{ marginTop: 0 }}>{editing ? "Editar atividade" : "Nova atividade"}</h4>

          {!editing && selectedDay ? (
            <div style={{ opacity: 0.82, marginBottom: 12 }}>
              Esta atividade sera adicionada em <b>{formatLongDate(selectedDay.date)}</b>.
            </div>
          ) : null}

          <div style={{ display: "grid", gap: ui.space.sm, maxWidth: 560, width: "100%" }}>
            <label>
              Tipo
              <select value={type} onChange={(e) => setType(e.target.value as ActivityType)} disabled={saving}>
                <option value="SIGHTSEEING">Ponto Turístico</option>
                <option value="FOOD">Alimentação</option>
                <option value="TRANSPORT">Transporte</option>
                <option value="HOTEL">Hospedagem</option>
                <option value="TOUR">Passeio/Tour</option>
                <option value="SHOPPING">Compras</option>
                <option value="FLIGHT">Voo</option>
                <option value="HIKING">Trilha/Natureza</option>
                <option value="BEACH">Praia</option>
                <option value="NIGHTLIFE">Vida Noturna</option>
                <option value="CULTURE">Cultura/Museu</option>
                <option value="SPORTS">Esportes/Aventura</option>
                <option value="RELAXATION">Descanso/SPA</option>
                <option value="OTHER">Outro</option>
              </select>
            </label>

            <label>
              Titulo
              <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
            </label>

            <label>
              Local
              <input value={place} onChange={(e) => setPlace(e.target.value)} disabled={saving} />
            </label>

            <label>
              Observacoes
              <input value={notes} onChange={(e) => setNotes(e.target.value)} disabled={saving} />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr", gap: ui.space.sm }}>
              <label>
                Horario
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} disabled={saving} />
              </label>

              <label>
                Custo
                <input
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  inputMode="decimal"
                  placeholder="ex: 50.00"
                  disabled={saving}
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: ui.space.sm, marginTop: ui.space.sm, flexWrap: "wrap" }}>
              <button type="button" onClick={onSubmit} disabled={saving} style={primaryBtn}>
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
                style={ghostBtn}
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

type DayPeriod = "morning" | "afternoon" | "night" | "anytime";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCard}>
      <div style={{ fontSize: 12, opacity: 0.68 }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoPill}>
      <span style={{ opacity: 0.62 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function formatLongDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatWeekday(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
  });
}

function labelForType(type: ActivityType) {
  return {
    SIGHTSEEING: "Passeio",
    FOOD: "Gastronomia",
    TRANSPORT: "Deslocamento",
    HOTEL: "Hospedagem",
    TOUR: "Tour",
    SHOPPING: "Compras",
    FLIGHT: "Voo",
    HIKING: "Trilha",
    BEACH: "Praia",
    NIGHTLIFE: "Vida Noturna",
    CULTURE: "Cultura",
    SPORTS: "Esportes",
    RELAXATION: "Descanso",
    OTHER: "Outro",
  }[type];
}

function formatMoney(value: number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function periodForActivity(activity: Activity | null): DayPeriod {
  if (!activity?.time) return "anytime";
  const hour = Number(String(activity.time).slice(0, 2));
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "night";
}

const hero: React.CSSProperties = {
  display: "grid",
  gap: 16,
};

const heroStats: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: ui.space.md,
};

const statCard: React.CSSProperties = {
  borderRadius: ui.radius.xl,
  padding: 16,
  border: "1px solid var(--itinerary-day-border)",
  background: "var(--itinerary-day-bg)",
  color: "var(--itinerary-day-text)",
};

const dayRail: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: ui.space.md,
};

const dayCard = (active: boolean): React.CSSProperties => ({
  textAlign: "left",
  padding: 16,
  borderRadius: ui.radius.xl,
  border: `1px solid ${active ? "var(--itinerary-day-active-border)" : "var(--itinerary-day-border)"}`,
  background: active ? "var(--itinerary-day-active-bg)" : "var(--itinerary-day-bg)",
  color: active ? "var(--itinerary-day-active-text)" : "var(--itinerary-day-text)",
  cursor: "pointer",
  boxShadow: active ? "var(--itinerary-day-active-shadow)" : "none",
  transition: ui.transitions.fast,
});

const agendaShell: React.CSSProperties = {
  borderRadius: 24,
  padding: 20,
  border: "1px solid var(--itinerary-card-border)",
  background: "var(--itinerary-agenda-shell)",
};

const agendaHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
};

const timeline: React.CSSProperties = {
  display: "grid",
  gap: ui.space.xl,
};

const periodSection: React.CSSProperties = {
  display: "grid",
  gap: ui.space.md,
};

const periodHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: ui.space.md,
  paddingBottom: 4,
};

const timelineRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "96px 20px minmax(0, 1fr)",
  gap: ui.space.lg,
  alignItems: "stretch",
};

const timeColumn: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  paddingTop: 10,
};

const timeBadge: React.CSSProperties = {
  minWidth: 72,
  textAlign: "center",
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid var(--itinerary-badge-border)",
  background: "var(--itinerary-badge-bg)",
  color: "var(--itinerary-day-text)",
  fontWeight: 700,
};

const timelineTrack: React.CSSProperties = {
  position: "relative",
  display: "flex",
  justifyContent: "center",
};

const timelineDot: React.CSSProperties = {
  position: "relative",
  top: 18,
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: "var(--itinerary-timeline-dot)",
  boxShadow: "var(--itinerary-timeline-dot-shadow)",
  zIndex: 1,
};

const timelineLine: React.CSSProperties = {
  position: "absolute",
  top: 30,
  bottom: -20,
  width: 2,
  background: "var(--itinerary-timeline-line)",
};

const activityCard: React.CSSProperties = {
  padding: 16,
  borderRadius: ui.radius.xl,
  border: "1px solid var(--itinerary-card-border)",
  background: "var(--itinerary-card-bg)",
  cursor: "grab",
};

const metaRow: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginTop: ui.space.md,
};

const infoPill: React.CSSProperties = {
  display: "inline-flex",
  gap: 6,
  alignItems: "center",
  padding: "7px 10px",
  borderRadius: 999,
  background: "var(--itinerary-badge-bg)",
  border: "1px solid var(--itinerary-badge-border)",
};

const notesBox: React.CSSProperties = {
  marginTop: ui.space.md,
  padding: ui.space.md,
  borderRadius: ui.radius.lg,
  background: "var(--itinerary-notes-bg)",
  border: "1px solid var(--itinerary-notes-border)",
  color: "var(--text-primary)",
  opacity: 0.85,
  lineHeight: 1.5,
};

const emptyBox: React.CSSProperties = {
  borderRadius: 16,
  padding: ui.space.xl,
  border: "1px solid var(--itinerary-card-border)",
  background: "var(--itinerary-card-bg)",
};

const modalCard: React.CSSProperties = {
  border: "1px solid var(--itinerary-card-border)",
  padding: 16,
  borderRadius: 16,
  background: "var(--bg-surface)",
  boxShadow: ui.shadows.xl,
  width: "100%",
  maxWidth: 640,
};

const primaryBtn: React.CSSProperties = {
  ...primaryButtonStyle(),
};

const ghostBtn: React.CSSProperties = {
  ...ghostButtonStyle(),
  background: "var(--itinerary-badge-bg)",
  border: "1px solid var(--itinerary-badge-border)",
  color: "var(--itinerary-day-text)",
};

const dragHandle: React.CSSProperties = {
  display: "none",
};

const activityTypeTag = (type: ActivityType): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.2,
  border: "1px solid var(--itinerary-badge-border)",
  color: "var(--itinerary-day-text)",
  background:
    type === "FOOD"
      ? "var(--itinerary-badge-bg)"
      : type === "TRANSPORT"
        ? "var(--itinerary-badge-bg)"
        : type === "HOTEL"
          ? "var(--itinerary-badge-bg)"
          : type === "TOUR"
            ? "var(--itinerary-badge-bg)"
            : type === "SHOPPING"
              ? "var(--itinerary-badge-bg)"
              : "var(--itinerary-badge-bg)",
});
