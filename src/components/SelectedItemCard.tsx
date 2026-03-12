import type { CSSProperties, ReactNode } from "react";
import { useMediaQuery } from "../shared/hooks/useMediaQuery";
import { ui } from "../shared/ui/tokens";
import { ghostButtonStyle } from "../shared/ui/styles";

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
      <div style={{ fontSize: ui.typography.fontSize.xs, color: "var(--text-selected-label)", marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: isNarrow ? ui.typography.fontSize.base : ui.typography.fontSize.lg,
          fontWeight: ui.typography.fontWeight.bold,
          color: "var(--text-selected-title)",
          wordBreak: "break-word",
        }}
      >
        {title}
      </div>
      {description ? (
        <div style={{ marginTop: 4, color: "var(--text-selected-desc)", fontSize: ui.typography.fontSize.sm }}>
          {description}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onAction}
        style={{
          ...ghostButtonStyle(),
          marginTop: ui.space.sm,
          padding: 0,
          color: ui.colors.primary[600],
          justifyContent: "flex-start",
          height: "auto",
          minHeight: "auto",
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

const card: CSSProperties = {
  borderRadius: ui.radius.lg,
  border: "1px solid var(--border-selected-card)",
  background: "var(--bg-selected-card)",
  boxShadow: ui.shadows.sm,
};
