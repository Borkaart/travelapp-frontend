import api from "./client";

export type Budget = {
  id?: number;
  tripId: number;
  total: number;
  currency?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertBudgetRequest = {
  total: number;
  currency?: string;
};

/**
 * GET /api/budgets/trip/{tripId}
 */
export async function getBudgetByTrip(tripId: number): Promise<Budget | null> {
  const res = await api.get<Budget>(`/budgets/trip/${tripId}`);
  return res.data ?? null;
}

/**
 * PUT /api/budgets/trip/{tripId}
 * Upsert (cria/atualiza)
 */
export async function upsertBudget(tripId: number, payload: UpsertBudgetRequest): Promise<Budget> {
  const res = await api.put<Budget>(`/budgets/trip/${tripId}`, payload);
  return res.data;
}

/**
 * (Opcional) Delete, se existir no backend
 */
export async function deleteBudgetByTrip(tripId: number): Promise<void> {
  await api.delete(`/budgets/trip/${tripId}`);
}
