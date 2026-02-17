import api from "./client";

export type Budget = {
  id?: number;
  tripId: number;
  limitAmount: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpsertBudgetRequest = {
  limitAmount: number;
  currency: string;
};

/**
 * GET /api/budgets/trip/{tripId}
 */
export async function getBudgetByTrip(tripId: number): Promise<Budget | null> {
  const res = await api.get<any>(`/budgets/trip/${tripId}`);
  return {
    ...res.data,
    limitAmount: res.data.limitAmount,
  };
}

/**
 * PUT /api/budgets/trip/{tripId}
 */
export async function upsertBudget(
  tripId: number,
  payload: UpsertBudgetRequest
): Promise<Budget> {
  const res = await api.put<Budget>(`/budgets/trip/${tripId}`, payload);
  return res.data;
}


/**
 */
export async function deleteBudgetByTrip(tripId: number): Promise<void> {
  await api.delete(`/budgets/trip/${tripId}`);
}
