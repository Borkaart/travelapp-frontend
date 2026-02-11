import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import { getBudgetByTrip, upsertBudget } from "../../api/budgetApi";

type OutletCtx = { refreshKey: number; triggerRefresh: () => void };

export default function TripBudgetPage() {
  const { tripId } = useParams();
  const tid = Number(tripId);

  const outlet = useOutletContext<OutletCtx>();
  const triggerRefresh = outlet?.triggerRefresh;

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
      setTotal(b?.total != null ? String(b.total) : "");
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
      if (!Number.isFinite(n) || n < 0) throw new Error("Budget deve ser um número >= 0.");

      const cur = currency?.trim();
      await upsertBudget(tid, {
        total: n,
        currency: cur ? cur.toUpperCase() : undefined,
      });

      // atualiza summary automaticamente
      if (triggerRefresh) triggerRefresh();

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (!Number.isFinite(tid)) return <p>Trip inválida.</p>;
  if (loading) return <p>Carregando budget...</p>;

  return (
    <div>
      <h3>Budget</h3>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label>
          Total
          <input
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            inputMode="decimal"
            placeholder="ex: 2500.00"
            disabled={saving}
          />
        </label>

        <label>
          Moeda (opcional)
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="BRL"
            disabled={saving}
          />
        </label>

        <button type="button" onClick={onSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar Budget"}
        </button>

        <p style={{ opacity: 0.75, fontSize: 12 }}>
          Após salvar, o Summary atualiza automaticamente.
        </p>
      </div>
    </div>
  );
}
