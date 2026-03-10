import type { CSSProperties } from "react";
import { ui } from "./tokens";

export function inputSurfaceStyle(): CSSProperties {
  return {
    width: "100%",
    padding: "12px 12px",
    borderRadius: ui.radius.md,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.35)",
    color: "#fff",
    outline: "none",
    minHeight: ui.controlHeight.md,
  };
}

export function elevatedInputStyle(): CSSProperties {
  return {
    width: "100%",
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: ui.radius.md,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    minHeight: ui.controlHeight.md,
  };
}

export function primaryButtonStyle(): CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: ui.radius.md,
    border: "1px solid rgba(74,222,128,0.35)",
    background: "rgba(74,222,128,0.18)",
    color: "#CFFFE0",
    cursor: "pointer",
    fontWeight: 700,
    minHeight: ui.controlHeight.md,
  };
}

export function secondaryButtonStyle(): CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: ui.radius.md,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.9)",
    cursor: "pointer",
    minHeight: ui.controlHeight.md,
  };
}

export function ghostButtonStyle(): CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: ui.radius.md,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "#e8eefc",
    cursor: "pointer",
    fontWeight: 700,
    minHeight: ui.controlHeight.md,
  };
}
