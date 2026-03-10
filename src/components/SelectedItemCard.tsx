import type { CSSProperties, ReactNode } from "react";
import { useMediaQuery } from "../shared/hooks/useMediaQuery";
import { ui } from "../shared/ui/tokens";

type SelectedItemCardProps = {
  actionLabel: string;
  description?: ReactNode;
  onAction: () => void;
  title: ReactNode;
  label: string;
};

export default function SelectedItemCard({
  actionLabel,
  description,
  onAction,
  title,
  label,
}: SelectedItemCardProps) {
  const isNarrow = useMediaQuery("(max-width: 640px)");

  return (
    <div style={{ ...card, padding: isNarrow ? ui.space.md : ui.space.lg }}>
      <div style={{ fontSize: 12, opacity: 0.68 }}>{label}</div>
      <div style={{ marginTop: ui.space.xs, fontSize: isNarrow ? 16 : 18, fontWeight: 700, wordBreak: "break-word" }}>{title}</div>
      {description ? <div style={{ marginTop: 4, opacity: 0.8 }}>{description}</div> : null}
      <button
        type="button"
        onClick={onAction}
        style={{ ...action, width: isNarrow ? "100%" : undefined, minHeight: ui.controlHeight.md }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

const card: CSSProperties = {
  padding: ui.space.lg,
  borderRadius: ui.radius.lg,
  border: "1px solid rgba(74,222,128,0.22)",
  background: "rgba(74,222,128,0.08)",
};

const action: CSSProperties = {
  marginTop: 10,
  padding: "8px 10px",
  borderRadius: ui.radius.sm,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  cursor: "pointer",
};
