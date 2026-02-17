import type { BudgetHealth, BudgetStatus } from './budget.types'

export function calculateBudgetHealth(limit: number, spent: number): BudgetHealth {
  const safeLimit = Number.isFinite(limit) ? limit : 0
  const safeSpent = Number.isFinite(spent) ? spent : 0

  if (safeLimit <= 0) {
    return {
      limit: 0,
      spent: safeSpent,
      remaining: 0,
      percentage: 0,
      status: 'healthy',
    }
  }

  const percentage = (safeSpent / safeLimit) * 100
  const remaining = safeLimit - safeSpent

  const status: BudgetStatus =
    percentage < 70 ? 'healthy' :
    percentage < 90 ? 'warning' :
    percentage <= 100 ? 'danger' :
    'exceeded'

  return {
    limit: safeLimit,
    spent: safeSpent,
    remaining,
    percentage: Math.min(percentage, 999),
    status,
  }
}
