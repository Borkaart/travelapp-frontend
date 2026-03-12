import React from "react";
import type { BudgetHealth } from "../../../domain/budget";
import { ui } from "../../../shared/ui/tokens";

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
        <span style={labelStyle}>Gasto: {money(spent)}</span>
        <span style={labelStyle}>Limite: {money(limit)}</span>
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
          <span style={{ ...labelStyle, color: ui.colors.error, fontWeight: "bold" }}>
            Estourado em {money(Math.abs(remaining))}
          </span>
        ) : (
          <span style={labelStyle}>Restante: {money(remaining)}</span>
        )}

        <span style={pill(status)}>
          {statusLabel(status)} • {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

function statusColor(status: BudgetHealth["status"]) {
  switch (status) {
    case "healthy":
      return ui.colors.success;
    case "warning":
      return ui.colors.warning;
    case "danger":
      return ui.colors.accent[500]; // Orange
    case "exceeded":
      return ui.colors.error;
  }
}

function statusLabel(status: BudgetHealth["status"]) {
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
  borderRadius: ui.radius.lg,
  padding: ui.space.md,
  border: `1px solid ${ui.colors.neutral[200]}`,
  background: ui.colors.white,
  boxShadow: ui.shadows.sm,
};

const topRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: ui.space.sm,
  marginBottom: ui.space.xs,
};

const bottomRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: ui.space.sm,
  marginTop: ui.space.sm,
};

const labelStyle: React.CSSProperties = {
  fontSize: ui.typography.fontSize.xs,
  color: ui.colors.neutral[600],
  fontWeight: ui.typography.fontWeight.medium,
};

const track: React.CSSProperties = {
  height: 8,
  borderRadius: ui.radius.full,
  background: ui.colors.neutral[100],
  overflow: "hidden",
};

const fill: React.CSSProperties = {
  height: "100%",
  borderRadius: ui.radius.full,
  transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
};

function pill(status: BudgetHealth["status"]): React.CSSProperties {
  const bg =
    status === "healthy"
      ? ui.colors.secondary[50]
      : status === "warning"
      ? ui.colors.accent[50]
      : status === "danger"
      ? ui.colors.accent[100]
      : ui.colors.error + "1A"; // 10% opacity hex approximation

  const text =
    status === "healthy"
      ? ui.colors.secondary[700]
      : status === "warning"
      ? ui.colors.accent[700]
      : status === "danger"
      ? ui.colors.accent[800]
      : ui.colors.error;

  return {
    fontSize: ui.typography.fontSize.xs,
    padding: "2px 8px",
    borderRadius: ui.radius.full,
    background: bg,
    color: text,
    fontWeight: ui.typography.fontWeight.semibold,
    whiteSpace: "nowrap",
  };
}
