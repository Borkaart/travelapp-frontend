import { useNavigate } from "react-router-dom";
import BudgetProgressBar from "../features/trip-summary/components/BudgetProgressBar";
import { useTripSummary } from "../features/trip-summary/hooks/useTripSummary";

type Props = {
  tripId: number;
  onBack: () => void;
  refreshKey: number;
};

export default function TripSummary({ tripId, onBack, refreshKey }: Props) {
  const navigate = useNavigate();
  const { data, loading, error, health } = useTripSummary(tripId, refreshKey);

  if (loading) return <p>Carregando summary...</p>;

  if (error) {
    return (
      <div>
        <button onClick={onBack} style={btn()}>
          ← Voltar
        </button>
        <p style={{ color: "crimson", marginTop: 12 }}>Erro: {error}</p>
      </div>
    );
  }

  if (!data || !health) return <p>Nenhum dado.</p>;

  const hasBudget = Number(data.budgetTotal ?? 0) > 0;
  const hasExpenses = Number(data.expensesCount ?? 0) > 0;

  return (
    <div>
      <button onClick={onBack} style={btn()}>
        ← Voltar
      </button>

      <h1 style={{ marginTop: 12 }}>{data.title}</h1>

      <p style={{ opacity: 0.8 }}>
        {data.startDate} → {data.endDate} • {data.totalDays} dias
      </p>

      {/* EMPTY STATE: sem budget */}
      {!hasBudget && (
        <div style={emptyBox}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            Defina um orçamento para acompanhar seus gastos
          </div>

          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Sem orçamento não é possível calcular progresso e status financeiro da viagem.
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => navigate("../budget")} style={primaryBtn}>
              Definir Budget →
            </button>

            <button type="button" onClick={() => navigate("../expenses")} style={secondaryBtn}>
              Registrar despesa
            </button>
          </div>
        </div>
      )}

      {/* Barra só aparece quando existe budget */}
      {hasBudget && (
        <div style={{ marginTop: 16 }}>
          <BudgetProgressBar health={health} />
        </div>
      )}

      <div style={grid}>
        <Card label="Dias do Itinerário" value={data.itineraryDaysCount} />
        <Card label="Atividades" value={data.activitiesCount} />
        <Card label="Despesas" value={data.expensesCount} />
        <Card label="Total de Despesas" value={formatMoney(data.expensesTotal)} />
        <Card label="Budget Total" value={hasBudget ? formatMoney(data.budgetTotal) : "—"} />
        <Card label="Saldo do Orçamento" value={hasBudget ? formatMoney(health.remaining) : "—"} />
      </div>

      {/* EMPTY STATE: sem despesas */}
      {!hasExpenses && (
        <div style={{ marginTop: 14, opacity: 0.85 }}>
          Você ainda não registrou despesas. Adicione a primeira na aba <b>Expenses</b>.
        </div>
      )}

      {hasBudget && health.status === "exceeded" && (
        <p style={{ marginTop: 12, color: "crimson" }}>
          Orçamento estourado em {formatMoney(Math.abs(health.remaining))}
        </p>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function formatMoney(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v ?? 0));
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 16,
};

const card: React.CSSProperties = {
  borderRadius: 14,
  padding: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
};

function btn(): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#e8eefc",
    cursor: "pointer",
  };
}

const emptyBox: React.CSSProperties = {
  marginTop: 16,
  borderRadius: 14,
  padding: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
};

const primaryBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.10)",
  color: "#e8eefc",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.85)",
  cursor: "pointer",
  fontWeight: 600,
};
