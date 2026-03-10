import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { useMediaQuery } from "../shared/hooks/useMediaQuery";
import { ui } from "../shared/ui/tokens";

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

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, items]);

  const selectedKey = useMemo(
    () => (selectedItem ? getItemKey(selectedItem) : null),
    [getItemKey, selectedItem],
  );

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
      const item = items[highlightedIndex];
      if (item) selectItem(item);
      return;
    }

    if (event.key === "Escape") {
      setDropdownOpen(false);
    }
  }

  return (
    <label style={field}>
      <span style={labelStyle}>{label}</span>
      {helperText ? <span style={helperStyle}>{helperText}</span> : null}
      <div style={{ position: "relative" }}>
        <input
          value={query}
          onChange={(event) => {
            onChangeQuery(event.target.value);
            setDropdownOpen(true);
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setDropdownOpen(false), 120);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={inputPlaceholder}
          style={{
            ...input,
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
                  const highlighted = highlightedIndex === index;

                  return (
                    <button
                      key={key}
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectItem(item);
                      }}
                      style={autocompleteItem(active, highlighted, isNarrow)}
                    >
                      {renderItem(item)}
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && items.length === 0 && <div style={autocompleteState}>{emptyMessage}</div>}
          </div>
        )}
      </div>
    </label>
  );
}

const field: CSSProperties = {
  display: "grid",
  gap: ui.space.xs,
};

const labelStyle: CSSProperties = {
  fontSize: 13,
  opacity: 0.75,
};

const helperStyle: CSSProperties = {
  fontSize: 12,
  opacity: 0.65,
};

const input: CSSProperties = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: ui.radius.md,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  outline: "none",
};

const autocompleteBox: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  zIndex: 10,
  padding: ui.space.sm,
  borderRadius: ui.radius.lg,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(8,16,28,0.96)",
  boxShadow: "0 18px 48px rgba(0,0,0,0.28)",
  backdropFilter: "blur(16px)",
};

const autocompleteList: CSSProperties = {
  display: "grid",
  gap: ui.space.xs,
  maxHeight: 260,
  overflowY: "auto",
};

const autocompleteState: CSSProperties = {
  padding: ui.space.md,
  opacity: 0.76,
};

const autocompleteItem = (active: boolean, highlighted: boolean, isNarrow: boolean): CSSProperties => ({
  textAlign: "left",
  padding: isNarrow ? ui.space.lg : ui.space.md,
  borderRadius: ui.radius.md,
  border: `1px solid ${
    active ? "rgba(74,222,128,0.45)" : highlighted ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)"
  }`,
  background: active
    ? "rgba(74,222,128,0.12)"
    : highlighted
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.03)",
  color: "#fff",
  cursor: "pointer",
  minHeight: isNarrow ? ui.controlHeight.xl : ui.controlHeight.md,
});
