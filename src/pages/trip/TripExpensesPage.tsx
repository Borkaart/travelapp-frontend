import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import {
  createExpense,
  deleteExpense,
  getExpensesByTrip,
  updateExpense,
  type Expense,
  type ExpenseCategory,
} from "../../api/expenseApi";

type OutletCtx = { refreshKey: number; triggerRefresh: () => void };

export default function TripExpensesPage() {
  const { tripId } = useParams();
  const tid = Number(tripId);

  const { triggerRefresh } = useOutletContext<OutletCtx>();

  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  // Form
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [spentAt, setSpentAt] = useState<string>(""); // yyyy-MM-dd
  const [category, setCategory] = useState<ExpenseCategory>("TRANSPORT");

  const total = useMemo(() => {
    return items.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  }, [items]);

  function resetForm() {
    setTitle("");
    setAmount("");
    setSpentAt("");
    setCategory("TRANSPORT");
  }

  function openCreateModal() {
    setEditing(null);
    resetForm();
    setOpen(true);
  }

  function openEditModal(e: Expense) {
    setEditing(e);
    setTitle(e.title ?? "");
    setAmount(e.amount !== null && e.amount !== undefined ? String(e.amount) : "");
    setCategory(e.category);

    const raw = (e.spentAt as any) ?? "";
    setSpentAt(raw ? String(raw).slice(0, 10) : "");

    setOpen(true);
  }

  async function load() {
    if (!Number.isFinite(tid)) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getExpensesByTrip(tid);
      setItems(data);
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

  async function onSubmit() {
    console.log("EXPENSE SUBMIT CLICKED");
    setError(null);
    setSaving(true);

    try {
      const t = title.trim();
      if (!t) throw new Error("Descrição é obrigatória.");

      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0) throw new Error("Valor deve ser maior que zero.");

      const payload: any = {
        title: t,
        amount: n,
        category,
        spentAt: spentAt ? `${spentAt}T00:00:00` : undefined,
      };

      console.log("EXPENSE PAYLOAD:", payload);

      if (editing) {
        await updateExpense(editing.id, payload);
      } else {
        await createExpense({
          tripId: tid,
          ...payload,
        });
      }

      setOpen(false);
      setEditing(null);
      resetForm();

      await load();

      // ✅ AUTO REFRESH SUMMARY
      triggerRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(e: Expense) {
    setError(null);
    if (!confirm(`Excluir despesa "${e.title}"?`)) return;

    setSaving(true);
    try {
      await deleteExpense(e.id);
      await load();

      // ✅ AUTO REFRESH SUMMARY
      triggerRefresh();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando...</p>;
  if (!Number.isFinite(tid)) return <p>Trip inválida.</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Expenses</h3>
        <button type="button" onClick={openCreateModal} disabled={saving}>
          + Adicionar
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ marginTop: 8, opacity: 0.85 }}>
        Total:{" "}
        <b>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b>
      </div>

      <ul style={{ marginTop: 12 }}>
        {items.map((e) => (
          <li key={e.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              {e.title} —{" "}
              <b>
                {Number(e.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </b>{" "}
              <span style={{ opacity: 0.8 }}>({e.category})</span>
              {e.spentAt ? (
                <span style={{ opacity: 0.7 }}> — {String(e.spentAt).slice(0, 10)}</span>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => openEditModal(e)} disabled={saving}>
                Editar
              </button>
              <button type="button" onClick={() => onDelete(e)} disabled={saving}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      {open && (
        <div style={{ border: "1px solid #ddd", padding: 12, marginTop: 16, borderRadius: 8 }}>
          <h4>{editing ? "Editar Despesa" : "Nova Despesa"}</h4>

          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <label>
              Categoria
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                disabled={saving}
              >
                <option value="FOOD">Food</option>
                <option value="TRANSPORT">Transport</option>
                <option value="LODGING">Lodging</option>
                <option value="TICKETS">Tickets</option>
                <option value="SHOPPING">Shopping</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label>
              Descrição
              <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} />
            </label>

            <label>
              Valor
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="ex: 100.50"
                disabled={saving}
              />
            </label>

            <label>
              Data (opcional)
              <input
                type="date"
                value={spentAt}
                onChange={(e) => setSpentAt(e.target.value)}
                disabled={saving}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={onSubmit} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                  resetForm();
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
