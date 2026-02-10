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
  title: string;
  amount: number;
  category: ExpenseCategory;
  spentAt: string; // yyyy-MM-dd (ou ISO dependendo do backend)
  currency?: string | null;
  createdAt?: string;
};

export type CreateExpenseRequest = {
  tripId: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  spentAt?: string; // "yyyy-MM-dd"
  currency?: string; // opcional
};

export async function getExpensesByTrip(tripId: number): Promise<Expense[]> {
  const res = await api.get<Expense[]>(`/expenses/trip/${tripId}`);
  return res.data;
}

export async function createExpense(payload: CreateExpenseRequest): Promise<Expense> {
  const res = await api.post<Expense>("/expenses", payload);
  return res.data;
}
