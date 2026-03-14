import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { 
  MapPin, Utensils, Car, Bed, Ticket, ShoppingBag, 
  Plane, Mountain, Sun, Beer, Landmark, Activity as ActivityIcon, 
  Coffee, HelpCircle, Clock, Map, Trash2, Edit3, Plus, X, Save, AlertCircle
} from "lucide-react";
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
import { ui } from "../../shared/ui/tokens";
import { 
  cardStyle, 
  glassCardStyle, 
  inputSurfaceStyle, 
  primaryButtonStyle, 
  secondaryButtonStyle,
  ghostButtonStyle 
} from "../../shared/ui/styles";

type OutletCtx = { refreshKey: number; triggerRefresh: () => void };

const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { label: string; icon: any; color: string }> = {
  SIGHTSEEING: { label: "Ponto Turístico", icon: MapPin, color: "#3B82F6" },
  FOOD: { label: "Alimentação", icon: Utensils, color: "#EF4444" },
  TRANSPORT: { label: "Transporte", icon: Car, color: "#6B7280" },
  HOTEL: { label: "Hospedagem", icon: Bed, color: "#8B5CF6" },
  TOUR: { label: "Passeio/Tour", icon: Ticket, color: "#F59E0B" },
  SHOPPING: { label: "Compras", icon: ShoppingBag, color: "#EC4899" },
  FLIGHT: { label: "Voo", icon: Plane, color: "#0EA5E9" },
  HIKING: { label: "Trilha/Natureza", icon: Mountain, color: "#10B981" },
  BEACH: { label: "Praia", icon: Sun, color: "#FBBF24" },
  NIGHTLIFE: { label: "Vida Noturna", icon: Beer, color: "#6366F1" },
  CULTURE: { label: "Cultura/Museu", icon: Landmark, color: "#78350F" },
  SPORTS: { label: "Esportes/Aventura", icon: ActivityIcon, color: "#D946EF" },
  RELAXATION: { label: "Descanso/SPA", icon: Coffee, color: "#14B8A6" },
  OTHER: { label: "Outro", icon: HelpCircle, color: "#94A3B8" },
};

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

  const [type, setType] = useState<ActivityType>("SIGHTSEEING");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");

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
      if (!title.trim()) throw new Error("Título é obrigatório.");
      if (selectedDayId === "") throw new Error("Selecione um dia.");

      const payload: ActivityUpdateRequest = {
        title: title.trim(),
        type,
        place: place.trim() || undefined,
        notes: notes.trim() || undefined,
        time: time || undefined,
      };

      if (cost !== "") {
        const parsedCost = Number(cost.replace(',', '.'));
        if (!Number.isFinite(parsedCost) || parsedCost < 0) throw new Error("Custo inválido.");
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
    if (!confirm(`Deseja excluir "${activity.title}"?`)) return;

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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
      <p style={{ fontFamily: ui.typography.fontFamily.body, color: ui.colors.neutral[500] }}>Carregando roteiro...</p>
    </div>
  );
  
  if (!Number.isFinite(tid)) return <p>Viagem inválida.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '24px' }}>
        <h2 style={{ fontFamily: ui.typography.fontFamily.heading, margin: 0, color: ui.colors.neutral[900] }}>
          Atividades do Roteiro
        </h2>
        <button 
          type="button" 
          onClick={openCreateModal} 
          disabled={days.length === 0 || saving}
          style={{ ...primaryButtonStyle(), gap: '8px' }}
        >
          <Plus size={18} /> Novo Atividade
        </button>
      </div>

      {error && (
        <div style={{ 
          background: '#FEF2F2', 
          color: ui.colors.error, 
          padding: '12px 16px', 
          borderRadius: ui.radius.lg, 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: `1px solid ${ui.colors.error}20`
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: ui.typography.fontSize.sm, fontWeight: ui.typography.fontWeight.medium }}>{error}</span>
        </div>
      )}

      <div style={{ ...cardStyle(), display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: ui.typography.fontSize.xs, color: ui.colors.neutral[500], fontWeight: ui.typography.fontWeight.semibold, textTransform: 'uppercase' }}>
            Dia Selecionado
          </label>
          <select
            value={selectedDayId}
            onChange={(e) => setSelectedDayId(Number(e.target.value))}
            disabled={days.length === 0 || saving}
            style={inputSurfaceStyle()}
          >
            {days.length === 0 && <option value="">Nenhum dia cadastrado</option>}
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                Dia {day.date}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => selectedDayId !== "" && reloadActivities(selectedDayId)}
          disabled={selectedDayId === "" || loadingActivities || saving}
          style={secondaryButtonStyle()}
        >
          Atualizar
        </button>
      </div>

      {loadingActivities ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: ui.colors.neutral[500] }}>Carregando atividades...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.length === 0 ? (
            <div style={{ ...cardStyle(), textAlign: 'center', padding: '48px', opacity: 0.6 }}>
              <Map size={48} style={{ marginBottom: '16px', color: ui.colors.neutral[300] }} />
              <p>Nenhuma atividade planejada para este dia.</p>
            </div>
          ) : (
            items.map((activity) => {
              const config = ACTIVITY_TYPE_CONFIG[activity.type] || ACTIVITY_TYPE_CONFIG.OTHER;
              const Icon = config.icon;
              
              return (
                <div 
                  key={activity.id} 
                  style={{ 
                    ...cardStyle(), 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: 'center',
                    gap: 12,
                    borderLeft: `4px solid ${config.color}`
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      background: `${config.color}15`, 
                      color: config.color, 
                      padding: '10px', 
                      borderRadius: ui.radius.lg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={24} />
                    </div>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          background: ui.colors.neutral[100], 
                          color: ui.colors.neutral[500],
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {config.label}
                        </span>
                        {activity.time && (
                          <span style={{ fontSize: '12px', color: ui.colors.neutral[400], display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {String(activity.time).slice(0, 5)}
                          </span>
                        )}
                      </div>
                      
                      <h4 style={{ margin: '0 0 4px 0', fontSize: ui.typography.fontSize.lg, color: ui.colors.neutral[900] }}>
                        {activity.title}
                      </h4>
                      
                      {activity.place && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: ui.typography.fontSize.sm, color: ui.colors.neutral[500], marginBottom: '4px' }}>
                          <MapPin size={14} /> {activity.place}
                        </div>
                      )}
                      
                      {activity.cost != null && (
                        <div style={{ fontWeight: 600, color: ui.colors.primary[600], fontSize: ui.typography.fontSize.sm }}>
                          {Number(activity.cost).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </div>
                      )}
                      
                      {activity.notes && (
                        <p style={{ margin: '8px 0 0 0', fontSize: ui.typography.fontSize.sm, color: ui.colors.neutral[500], fontStyle: 'italic', borderLeft: `2px solid ${ui.colors.neutral[100]}`, paddingLeft: '8px' }}>
                          {activity.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button 
                      type="button" 
                      onClick={() => openEditModal(activity)} 
                      disabled={saving}
                      style={{ ...ghostButtonStyle(), padding: '8px' }}
                      title="Editar"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => onDelete(activity)} 
                      disabled={saving}
                      style={{ ...ghostButtonStyle(), color: ui.colors.error, padding: '8px' }}
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal / Form Overhaul */}
      {open && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.4)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: ui.z.modal,
          padding: '20px'
        }}>
          <div style={{ 
            ...glassCardStyle(), 
            width: '100%', 
            maxWidth: '550px', 
            maxHeight: '90vh', 
            overflowY: 'auto',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: ui.typography.fontSize['2xl'] }}>
                  {editing ? "Editar Atividade" : "Nova Atividade"}
                </h3>
                {!editing && (
                  <p style={{ margin: '4px 0 0 0', fontSize: ui.typography.fontSize.sm, color: ui.colors.neutral[500] }}>
                    Será adicionada ao dia <b>{days.find((day) => day.id === selectedDayId)?.date ?? "selecionado"}</b>
                  </p>
                )}
              </div>
              <button onClick={() => setOpen(false)} style={{ ...ghostButtonStyle(), color: ui.colors.neutral[400] }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tipo de Atividade</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                  {(Object.keys(ACTIVITY_TYPE_CONFIG) as ActivityType[]).map((t) => {
                    const cfg = ACTIVITY_TYPE_CONFIG[t];
                    const Icon = cfg.icon;
                    const isSelected = type === t;
                    
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 8px',
                          borderRadius: ui.radius.lg,
                          border: `2px solid ${isSelected ? cfg.color : 'transparent'}`,
                          background: isSelected ? `${cfg.color}10` : 'var(--bg-surface)',
                          cursor: 'pointer',
                          transition: ui.transitions.fast,
                          boxShadow: ui.shadows.sm,
                        }}
                      >
                        <div style={{ color: isSelected ? cfg.color : ui.colors.neutral[400] }}>
                          <Icon size={20} />
                        </div>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? ui.colors.neutral[900] : ui.colors.neutral[500]
                        }}>
                          {cfg.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Título *</label>
                  <input 
                    placeholder="Ex: Almoço no Centro"
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    disabled={saving} 
                    style={inputSurfaceStyle()}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Horário</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    disabled={saving}
                    style={inputSurfaceStyle()}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Localização</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: ui.colors.neutral[400] }} />
                  <input 
                    placeholder="Nome do lugar ou endereço"
                    value={place} 
                    onChange={(e) => setPlace(e.target.value)} 
                    disabled={saving} 
                    style={{ ...inputSurfaceStyle(), paddingLeft: '40px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Custo Estimado (R$)</label>
                <input 
                  placeholder="0,00"
                  value={cost} 
                  onChange={(e) => setCost(e.target.value)} 
                  inputMode="decimal"
                  disabled={saving} 
                  style={inputSurfaceStyle()}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Observações</label>
                <textarea 
                  placeholder="Detalhes extras, links ou dicas..."
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  disabled={saving} 
                  style={{ ...inputSurfaceStyle(), minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={onSubmit} 
                  disabled={saving}
                  style={{ ...primaryButtonStyle(), flex: 2, gap: '8px' }}
                >
                  <Save size={18} /> {saving ? "Salvando..." : "Salvar Atividade"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  style={{ ...secondaryButtonStyle(), flex: 1 }}
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
        </div>
      )}
    </div>
  );
}
