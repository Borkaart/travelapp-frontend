import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/client";
import {
  createExpense,
  deleteExpense,
  getExpensesByTrip,
  updateExpense,
  type CreateExpenseRequest,
  type Expense,
  type ExpenseCategory,
  type UpdateExpenseRequest,
} from "../../api/expenseApi";
import {
  elevatedInputStyle,
  ghostButtonStyle,
  primaryButtonStyle,
} from "../../shared/ui/styles";
import { ui } from "../../shared/ui/tokens";
import { useToast } from "../../shared/toast/toast";

type OutletCtx = { refreshKey: number; triggerRefresh: () => void };

export default function TripExpensesPage() {
  const { tripId } = useParams();
  const tid = Number(tripId);

  const { triggerRefresh } = useOutletContext<OutletCtx>();
  const { push } = useToast();

  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [spentAt, setSpentAt] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("TRANSPORT");

  const total = useMemo(() => items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0), [items]);

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

  function openEditModal(expense: Expense) {
    setEditing(expense);
    setTitle(expense.title ?? "");
    setAmount(expense.amount != null ? String(expense.amount) : "");
    setCategory(expense.category);
    setSpentAt(expense.spentAt ? String(expense.spentAt).slice(0, 10) : "");
    setOpen(true);
  }

  useEffect(() => {
    if (!Number.isFinite(tid)) return;

    (async () => {
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
    })();
  }, [tid]);

  async function reload() {
    if (!Number.isFinite(tid)) return;

    const data = await getExpensesByTrip(tid);
    setItems(data);
  }

  async function onSubmit() {
    setError(null);
    setSaving(true);

    try {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) throw new Error("Descricao e obrigatoria.");

      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Valor deve ser maior que zero.");
      }

      const payload: UpdateExpenseRequest = {
        title: trimmedTitle,
        amount: parsedAmount,
        category,
        spentAt: spentAt ? `${spentAt}T00:00:00` : undefined,
      };

      if (editing) {
        await updateExpense(editing.id, payload);
      } else {
        const createPayload: CreateExpenseRequest = {
          tripId: tid,
          title: trimmedTitle,
          amount: parsedAmount,
          category,
          spentAt: payload.spentAt,
        };

        await createExpense(createPayload);
      }

      setOpen(false);
      setEditing(null);
      resetForm();

      await reload();
      triggerRefresh();

      push({
        kind: "success",
        title: editing ? "Despesa atualizada" : "Despesa registrada",
        message: "Summary sincronizado.",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : getApiErrorMessage(e);
      setError(msg);

      push({
        kind: "error",
        title: "Falha ao salvar despesa",
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(expense: Expense) {
    setError(null);
    if (!confirm(`Excluir despesa "${expense.title}"?`)) return;

    setSaving(true);
    try {
      await deleteExpense(expense.id);
      await reload();
      triggerRefresh();

      push({
        kind: "success",
        title: "Despesa excluida",
        message: "Summary sincronizado.",
      });
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setError(msg);

      push({
        kind: "error",
        title: "Falha ao excluir despesa",
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Carregando...</p>;
  if (!Number.isFinite(tid)) return <p>Trip invalida.</p>;

  const isEmpty = items.length === 0;

  return (
    <div style={{ minHeight: "100%", display: "grid", alignContent: "start", gap: ui.space.lg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Expenses</h3>
        <button type="button" onClick={openCreateModal} disabled={saving} style={primaryBtn}>
          + Adicionar
        </button>
      </div>

      {error ? <p style={{ color: "crimson", margin: 0 }}>{error}</p> : null}

      <div style={{ opacity: 0.85 }}>
        Total:{" "}
        <b>{total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b>
      </div>

      {isEmpty ? (
        <div style={emptyBox}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Nenhuma despesa registrada</div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Registre a primeira despesa para ver o impacto no orcamento e no Summary.
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={openCreateModal} disabled={saving} style={primaryBtn}>
              Adicionar primeira despesa
            </button>
          </div>
        </div>
      ) : (
        <ul style={{ marginTop: 12, paddingLeft: 18 }}>
          {items.map((expense) => (
            <li key={expense.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <div>
                {expense.title} -{" "}
                <b>
                  {Number(expense.amount).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </b>{" "}
                <span style={{ opacity: 0.8 }}>({expense.category})</span>
                {expense.spentAt ? (
                  <span style={{ opacity: 0.7 }}> - {String(expense.spentAt).slice(0, 10)}</span>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={() => openEditModal(expense)} disabled={saving} style={ghostButtonStyle()}>
                  Editar
                </button>
                <button type="button" onClick={() => onDelete(expense)} disabled={saving} style={ghostButtonStyle()}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open ? (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            padding: ui.space.xl,
            marginTop: 16,
            borderRadius: ui.radius.xl,
            background: "rgba(255,255,255,0.04)",
            maxWidth: 520,
          }}
        >
          <h4 style={{ marginTop: 0 }}>{editing ? "Editar Despesa" : "Nova Despesa"}</h4>

          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <label>
              Categoria
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                disabled={saving}
                style={elevatedInputStyle()}
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
              Descricao
              <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={saving} style={elevatedInputStyle()} />
            </label>

            <label>
              Valor
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="ex: 100.50"
                disabled={saving}
                style={elevatedInputStyle()}
              />
            </label>

            <label>
              Data (opcional)
              <input
                type="date"
                value={spentAt}
                onChange={(e) => setSpentAt(e.target.value)}
                disabled={saving}
                style={elevatedInputStyle()}
              />
            </label>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={onSubmit} disabled={saving} style={primaryBtn}>
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
                style={ghostButtonStyle()}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const emptyBox: React.CSSProperties = {
  marginTop: 16,
  borderRadius: ui.radius.lg,
  padding: ui.space.lg,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
};

const primaryBtn: React.CSSProperties = {
  ...primaryButtonStyle(),
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.10)",
  color: "#e8eefc",
};
