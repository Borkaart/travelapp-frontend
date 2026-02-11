import api from "./client";

export type ExpenseCategory =
  | "FOOD"
  | "TRANSPORT"
  | "LODGING"
  | "TICKETS"
  | "SHOPPING"
  | "OTHER";

export type Expense = {
  id: number;
  tripId: number;              // ⬅️ importante (seu backend responde tripId)
  title: string;
  amount: number;
  category: ExpenseCategory;
  spentAt?: string | null;     // pode ser ISO
  currency?: string | null;
  createdAt?: string;
};

export type CreateExpenseRequest = {
  tripId: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  spentAt?: string;   // "yyyy-MM-ddT00:00:00" (você já monta assim no page)
  currency?: string;
};

export type UpdateExpenseRequest = Partial<Omit<CreateExpenseRequest, "tripId">>;

export async function getExpensesByTrip(tripId: number): Promise<Expense[]> {
  const res = await api.get<Expense[]>(`/expenses/trip/${tripId}`);
  return res.data;
}

export async function createExpense(payload: CreateExpenseRequest): Promise<Expense> {
  const res = await api.post<Expense>("/expenses", payload);
  return res.data;
}

export async function updateExpense(id: number, payload: UpdateExpenseRequest): Promise<Expense> {
  const res = await api.put<Expense>(`/expenses/${id}`, payload);
  return res.data;
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/expenses/${id}`);
}
