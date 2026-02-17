import React from "react";
import type { BudgetHealth } from "../../../domain/budget";

type Props = {
  health: BudgetHealth;
};

export default function BudgetProgressBar({ health }: Props) {
  const { spent, limit, remaining, percentage, status } = health;

  const clamped = Math.max(0, Math.min(percentage, 100));
  const color = statusColor(status);

  return (
    <div style={wrap}>
      <div style={topRow}>
        <span style={muted}>Gasto: {money(spent)}</span>
        <span style={muted}>Limite: {money(limit)}</span>
      </div>

      <div style={track}>
        <div
          style={{
            ...fill,
            width: `${clamped}%`,
            background: color,
          }}
        />
      </div>

      <div style={bottomRow}>
        {status === "exceeded" ? (
          <span style={{ ...muted, color: "crimson" }}>
            Estourado em {money(Math.abs(remaining))}
          </span>
        ) : (
          <span style={muted}>Restante: {money(remaining)}</span>
        )}

        <span style={pill(status)}>
          {label(status)} • {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

function statusColor(status: BudgetHealth["status"]) {
  switch (status) {
    case "healthy":
      return "linear-gradient(90deg, #22c55e, #16a34a)";
    case "warning":
      return "linear-gradient(90deg, #facc15, #eab308)";
    case "danger":
      return "linear-gradient(90deg, #fb923c, #f97316)";
    case "exceeded":
      return "linear-gradient(90deg, #ef4444, #dc2626)";
  }
}

function label(status: BudgetHealth["status"]) {
  switch (status) {
    case "healthy":
      return "Saudável";
    case "warning":
      return "Atenção";
    case "danger":
      return "No limite";
    case "exceeded":
      return "Estourado";
  }
}

function money(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(v ?? 0));
}

const wrap: React.CSSProperties = {
  borderRadius: 14,
  padding: 14,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: 12,
};

const bottomRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginTop: 10,
};

const muted: React.CSSProperties = {
  opacity: 0.8,
};

const track: React.CSSProperties = {
  height: 10,
  marginTop: 10,
  borderRadius: 999,
  background: "rgba(255,255,255,0.10)",
  overflow: "hidden",
};

const fill: React.CSSProperties = {
  height: "100%",
  borderRadius: 999,
  transition: "width 300ms ease",
};

function pill(status: BudgetHealth["status"]): React.CSSProperties {
  const bg =
    status === "healthy"
      ? "rgba(34,197,94,0.15)"
      : status === "warning"
      ? "rgba(250,204,21,0.15)"
      : status === "danger"
      ? "rgba(249,115,22,0.15)"
      : "rgba(239,68,68,0.15)";

  const border =
    status === "healthy"
      ? "rgba(34,197,94,0.30)"
      : status === "warning"
      ? "rgba(250,204,21,0.30)"
      : status === "danger"
      ? "rgba(249,115,22,0.30)"
      : "rgba(239,68,68,0.30)";

  return {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    background: bg,
    border: `1px solid ${border}`,
    opacity: 0.95,
    whiteSpace: "nowrap",
  };
}
