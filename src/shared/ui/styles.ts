import type { CSSProperties } from "react";
import { ui } from "./tokens";

export function inputSurfaceStyle(): CSSProperties {
  return {
    width: "100%",
    padding: "12px 16px",
    borderRadius: ui.radius.lg,
    border: `1px solid ${ui.colors.neutral[200]}`,
    background: "var(--bg-surface)",
    color: ui.colors.neutral[900],
    fontSize: ui.typography.fontSize.base,
    fontFamily: ui.typography.fontFamily.body,
    outline: "none",
    minHeight: ui.controlHeight.lg,
    transition: ui.transitions.fast,
    boxShadow: ui.shadows.sm,
  };
}

export function primaryButtonStyle(): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    borderRadius: ui.radius.full, // Pill shape for travel app feel
    border: "none",
    background: `linear-gradient(135deg, ${ui.colors.primary[500]}, ${ui.colors.primary[600]})`,
    color: ui.colors.white,
    cursor: "pointer",
    fontWeight: ui.typography.fontWeight.semibold,
    fontSize: ui.typography.fontSize.base,
    fontFamily: ui.typography.fontFamily.body,
    minHeight: ui.controlHeight.lg,
    transition: ui.transitions.normal,
    boxShadow: ui.shadows.md,
    letterSpacing: "0.025em",
  };
}

export function secondaryButtonStyle(): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    borderRadius: ui.radius.full,
    border: `1px solid ${ui.colors.neutral[200]}`,
    background: "var(--bg-surface)",
    color: ui.colors.neutral[700],
    cursor: "pointer",
    fontWeight: ui.typography.fontWeight.medium,
    fontSize: ui.typography.fontSize.base,
    fontFamily: ui.typography.fontFamily.body,
    minHeight: ui.controlHeight.lg,
    transition: ui.transitions.normal,
  };
}

export function ghostButtonStyle(): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    borderRadius: ui.radius.md,
    border: "none",
    background: "transparent",
    color: ui.colors.primary[600],
    cursor: "pointer",
    fontWeight: ui.typography.fontWeight.medium,
    fontFamily: ui.typography.fontFamily.body,
    transition: ui.transitions.fast,
  };
}

export function cardStyle(): CSSProperties {
  return {
    background: "var(--bg-surface)",
    borderRadius: ui.radius.xl,
    padding: ui.space.lg,
    boxShadow: ui.shadows.lg,
    border: `1px solid ${ui.colors.neutral[100]}`,
    transition: ui.transitions.normal,
  };
}

export function glassCardStyle(): CSSProperties {
  return {
    background: "rgba(var(--bg-glass-rgb), 0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: ui.radius.xl,
    padding: ui.space.xl,
    border: "1px solid rgba(var(--border-glass-rgb), 0.3)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15)",
  };
}
