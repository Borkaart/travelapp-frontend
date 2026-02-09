import { useEffect, useMemo, useState } from "react";
import { getTripSummary } from "../api/tripApi";
import type { TripSummary } from "../models/TripSummary";
import { getApiErrorMessage } from "../api/client";

type Props = {
  tripId: number;
  onBack: () => void;
};

export default function TripSummaryPage({ tripId, onBack }: Props) {
  const [data, setData] = useState<TripSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getTripSummary(tripId)
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [tripId]);

  const remaining = useMemo(() => {
    if (!data) return 0;
    const budgetTotal = Number((data as any).budgetTotal ?? 0);
    const expensesTotal = Number((data as any).expensesTotal ?? 0);
    return budgetTotal - expensesTotal;
  }, [data]);

  if (loading) return <p>Carregando summary...</p>;

  if (error) {
    return (
      <div>
        <button onClick={onBack} style={btn()}>
          ← Voltar
        </button>
        <p style={{ color: "crimson" }}>Erro: {error}</p>
      </div>
    );
  }

  if (!data) return <p>Nenhum dado.</p>;

  return (
    <div>
      <button onClick={onBack} style={btn()}>
        ← Voltar
      </button>

      <h1 style={{ marginTop: 12 }}>{data.title}</h1>
      <p style={{ opacity: 0.8 }}>
        {data.startDate} → {data.endDate} • {data.totalDays} dias
      </p>

      <div style={grid}>
        <Card label="Dias do Itinerário" value={data.itineraryDaysCount} />
        <Card label="Atividades" value={data.activitiesCount} />
        <Card label="Despesas" value={data.expensesCount} />
        <Card label="Total de Despesas" value={formatMoney(data.expensesTotal)} />
        <Card label="Budget Total" value={formatMoney(data.budgetTotal)} />
        <Card label="Saldo do Orçamento" value={formatMoney(remaining)} />
      </div>

      {remaining < 0 && (
        <p style={{ marginTop: 12, color: "crimson" }}>
          Orçamento estourado em {formatMoney(Math.abs(remaining))}
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
