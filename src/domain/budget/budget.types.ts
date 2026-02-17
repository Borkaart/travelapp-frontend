export type BudgetStatus = 'healthy' | 'warning' | 'danger' | 'exceeded'

export interface BudgetHealth {
  limit: number
  spent: number
  remaining: number
  percentage: number
  status: BudgetStatus
}
