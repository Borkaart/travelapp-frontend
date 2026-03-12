import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import { getBudgetByTrip, upsertBudget } from "../../api/budgetApi";
import { inputSurfaceStyle, primaryButtonStyle } from "../../shared/ui/styles";
import { useToast } from "../../shared/toast/toast";
import { ui } from "../../shared/ui/tokens";

type OutletCtx = { refreshKey: number; triggerRefresh: () => void };

export default function TripBudgetPage() {
  const { tripId } = useParams();
  const tid = Number(tripId);

  const outlet = useOutletContext<OutletCtx>();
  const triggerRefresh = outlet?.triggerRefresh;

  const { push } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<string>("");
  const [currency, setCurrency] = useState<string>("BRL");

  async function load() {
    if (!Number.isFinite(tid)) return;

    setLoading(true);
    setError(null);
    try {
      const b = await getBudgetByTrip(tid);
      setTotal(b?.limitAmount != null ? String(b.limitAmount) : "");
      setCurrency(b?.currency ?? "BRL");
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid]);

  async function onSave() {
    setError(null);
    setSaving(true);

    try {
      const n = Number(total);

      if (!Number.isFinite(n) || n < 0) {
        throw new Error("Budget deve ser um numero >= 0.");
      }

      const cur = currency?.trim() || "BRL";

      await upsertBudget(tid, {
        limitAmount: n,
        currency: cur.toUpperCase(),
      });

      triggerRefresh?.();

      push({
        kind: "success",
        title: "Orcamento atualizado",
        message: "Summary sincronizado.",
      });

      await load();
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e);
      setError(msg);

      push({
        kind: "error",
        title: "Falha ao salvar orcamento",
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  }

  if (!Number.isFinite(tid)) return <p>Trip invalida.</p>;
  if (loading) return <p>Carregando budget...</p>;

  return (
    <div style={{ minHeight: "100%", display: "grid", alignContent: "start", gap: ui.space.lg }}>
      <h3 style={{ margin: 0 }}>Budget</h3>

      {error ? <p style={{ color: "crimson", margin: 0 }}>{error}</p> : null}

      <div
        style={{
          display: "grid",
          gap: 10,
          maxWidth: 420,
          padding: ui.space.xl,
          borderRadius: ui.radius.xl,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <label>
          Total
          <input
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            inputMode="decimal"
            placeholder="ex: 2500.00"
            disabled={saving}
            style={inputSurfaceStyle()}
          />
        </label>

        <label>
          Moeda (opcional)
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="BRL"
            disabled={saving}
            style={inputSurfaceStyle()}
          />
        </label>

        <button type="button" onClick={onSave} disabled={saving} style={primaryButtonStyle()}>
          {saving ? "Salvando..." : "Salvar Budget"}
        </button>

        <p style={{ opacity: 0.75, fontSize: 12, margin: 0 }}>
          Apos salvar, o Summary atualiza automaticamente.
        </p>
      </div>
    </div>
  );
}
