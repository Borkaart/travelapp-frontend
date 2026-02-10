import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import {
  createExpense,
  getExpensesByTrip,
  type Expense,
  type ExpenseCategory,
} from "../../api/expenseApi";

export default function TripExpensesPage() {
  const { tripId } = useParams();
  const tid = Number(tripId);

  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);

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

  async function load() {
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
    if (!Number.isFinite(tid)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid]);

  async function onCreate() {
    setError(null);
    try {
      const t = title.trim();
      if (!t) throw new Error("Descrição é obrigatória.");

      const n = Number(amount);
      if (!Number.isFinite(n) || n <= 0) throw new Error("Valor deve ser maior que zero.");

      await createExpense({
        tripId: tid,
        title: t,
        amount: n,
        category, // ✅ obrigatório no backend
        spentAt: spentAt ? `${spentAt}T00:00:00` : undefined,
      });

      setOpen(false);
      resetForm();

      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Expenses</h3>
        <button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          + Adicionar
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ marginTop: 8, opacity: 0.85 }}>
        Total: <b>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b>
      </div>

      <ul style={{ marginTop: 12 }}>
        {items.map((e) => (
          <li key={e.id}>
            {e.title} —{" "}
            <b>
              {Number(e.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </b>{" "}
            <span style={{ opacity: 0.8 }}>({e.category})</span>
            {e.spentAt ? <span style={{ opacity: 0.7 }}> — {e.spentAt}</span> : null}
          </li>
        ))}
      </ul>

      {open && (
        <div style={{ border: "1px solid #ddd", padding: 12, marginTop: 16, borderRadius: 8 }}>
          <h4>Nova Despesa</h4>

          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <label>
              Categoria
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
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
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label>
              Valor
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="ex: 100.50"
              />
            </label>

            <label>
              Data (opcional)
              <input type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onCreate}>Salvar</button>
              <button
                onClick={() => {
                  setOpen(false);
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
