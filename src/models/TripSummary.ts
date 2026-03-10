export interface TripSummary {
  tripId: number;
  title: string;
  destinationId?: number | null;
  destinationName?: string | null;
  startDate: string;
  endDate: string;
  totalDays: number;
  itineraryDaysCount: number;
  activitiesCount: number;
  itineraryPlannedTotal: number;
  expensesCount: number;
  expensesTotal: number;
  budgetTotal: number;
}
