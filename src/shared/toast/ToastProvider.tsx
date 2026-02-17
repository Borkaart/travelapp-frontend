import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "error" | "info";

export type Toast = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
  durationMs?: number;
};

type ToastContextValue = {
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const toast: Toast = { id, durationMs: 3500, ...t };
    setToasts((prev) => [...prev, toast]);

    window.setTimeout(() => remove(id), toast.durationMs);
  }, [remove]);

  const value = useMemo(() => ({ push, remove }), [push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastViewport({
  toasts,
  onClose,
}: {
  toasts: Toast[];
  onClose: (id: string) => void;
}) {
  return (
    <div style={viewport}>
      {toasts.map((t) => (
        <div key={t.id} style={{ ...toastBase, ...toastKind(t.kind) }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700 }}>{t.title}</div>
              {t.message && <div style={{ opacity: 0.85, marginTop: 4 }}>{t.message}</div>}
            </div>
            <button onClick={() => onClose(t.id)} style={closeBtn} aria-label="Fechar toast">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const viewport: React.CSSProperties = {
  position: "fixed",
  right: 16,
  bottom: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 9999,
};

const toastBase: React.CSSProperties = {
  width: 320,
  borderRadius: 14,
  padding: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(20,20,28,0.92)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
  color: "#e8eefc",
};

function toastKind(kind: ToastKind): React.CSSProperties {
  if (kind === "success") return { borderColor: "rgba(34,197,94,0.35)" };
  if (kind === "error") return { borderColor: "rgba(239,68,68,0.40)" };
  return { borderColor: "rgba(59,130,246,0.35)" };
}

const closeBtn: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
  color: "#e8eefc",
  borderRadius: 10,
  cursor: "pointer",
  padding: "6px 10px",
  height: 34,
};
