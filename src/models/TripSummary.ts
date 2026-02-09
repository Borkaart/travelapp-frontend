export interface TripSummary {
  tripId: number;
  title: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  itineraryDaysCount: number;
  activitiesCount: number;
  expensesCount: number;
  expensesTotal: number;
  budgetTotal: number;
}
