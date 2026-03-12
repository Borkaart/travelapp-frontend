import { useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useMediaQuery } from "../shared/hooks/useMediaQuery";
import { ui } from "../shared/ui/tokens";
import { inputSurfaceStyle } from "../shared/ui/styles";

type AutocompleteFieldProps<T> = {
  disabled?: boolean;
  emptyMessage: string;
  getItemKey: (item: T) => string;
  helperText?: string;
  inputPlaceholder: string;
  items: T[];
  label: string;
  loading?: boolean;
  loadingMessage: string;
  minQueryLength?: number;
  onChangeQuery: (value: string) => void;
  onSelect: (item: T) => void;
  query: string;
  renderItem: (item: T) => ReactNode;
  selectedItem: T | null;
};

export default function AutocompleteField<T>({
  disabled,
  emptyMessage,
  getItemKey,
  helperText,
  inputPlaceholder,
  items,
  label,
  loading,
  loadingMessage,
  minQueryLength = 0,
  onChangeQuery,
  onSelect,
  query,
  renderItem,
  selectedItem,
}: AutocompleteFieldProps<T>) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const isNarrow = useMediaQuery("(max-width: 640px)");

  const hasMinQuery = query.trim().length >= minQueryLength;
  const showDropdown = dropdownOpen && (loading || hasMinQuery || minQueryLength === 0);

  const selectedKey = useMemo(
    () => (selectedItem ? getItemKey(selectedItem) : null),
    [getItemKey, selectedItem],
  );

  const safeHighlightedIndex =
    items.length === 0 ? 0 : Math.max(0, Math.min(highlightedIndex, items.length - 1));

  function selectItem(item: T) {
    onSelect(item);
    setDropdownOpen(false);
    setHighlightedIndex(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || items.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % items.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => (current - 1 + items.length) % items.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const item = items[safeHighlightedIndex];
      if (item) selectItem(item);
      return;
    }

    if (event.key === "Escape") {
      setDropdownOpen(false);
    }
  }

  return (
    <div style={field}>
      <span style={labelStyle}>{label}</span>
      {helperText ? <span style={helperStyle}>{helperText}</span> : null}
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={(event) => {
            onChangeQuery(event.target.value);
            setDropdownOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setDropdownOpen(true);
            setHighlightedIndex(0);
          }}
          onBlur={() => {
            window.setTimeout(() => setDropdownOpen(false), 120);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={inputPlaceholder}
          style={{
            ...inputSurfaceStyle(),
            minHeight: isNarrow ? ui.controlHeight.lg : ui.controlHeight.md,
            fontSize: isNarrow ? 16 : 15,
          }}
        />

        {showDropdown && (
          <div style={{ ...autocompleteBox, padding: isNarrow ? ui.space.xs : ui.space.sm }}>
            {loading && <div style={autocompleteState}>{loadingMessage}</div>}

            {!loading && items.length > 0 && (
              <div style={autocompleteList}>
                {items.map((item, index) => {
                  const key = getItemKey(item);
                  const active = selectedKey === key;
                  const highlighted = safeHighlightedIndex === index;

                  return (
                    <div
                      key={key}
                      role="button"
                      tabIndex={0}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectItem(item);
                      }}
                      style={autocompleteItem(active, highlighted, isNarrow)}
                    >
                      {renderItem(item)}
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && items.length === 0 && <div style={autocompleteState}>{emptyMessage}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

const field: CSSProperties = {
  display: "grid",
  gap: ui.space.xs,
};

const labelStyle: CSSProperties = {
  fontSize: ui.typography.fontSize.sm,
  fontWeight: ui.typography.fontWeight.medium,
  color: ui.colors.neutral[700],
};

const helperStyle: CSSProperties = {
  fontSize: ui.typography.fontSize.xs,
  color: ui.colors.neutral[500],
};

const autocompleteBox: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  right: 0,
  zIndex: 10,
  padding: ui.space.sm,
  borderRadius: ui.radius.lg,
  border: `1px solid ${ui.colors.neutral[200]}`,
  background: ui.colors.white,
  boxShadow: ui.shadows.xl,
};

const autocompleteList: CSSProperties = {
  display: "grid",
  gap: 2,
  maxHeight: 260,
  overflowY: "auto",
};

const autocompleteState: CSSProperties = {
  padding: ui.space.md,
  color: ui.colors.neutral[500],
  fontSize: ui.typography.fontSize.sm,
};

const autocompleteItem = (active: boolean, highlighted: boolean, isNarrow: boolean): CSSProperties => ({
  textAlign: "left",
  padding: isNarrow ? ui.space.lg : ui.space.md,
  borderRadius: ui.radius.md,
  border: "none",
  background: active
    ? ui.colors.primary[50]
    : highlighted
    ? ui.colors.neutral[100]
    : "transparent",
  color: active ? ui.colors.primary[900] : ui.colors.neutral[900],
  cursor: "pointer",
  minHeight: isNarrow ? ui.controlHeight.xl : ui.controlHeight.md,
  transition: ui.transitions.fast,
});
