import { useEffect, useMemo, useState } from "react";
import { getTripSummary } from "../../../api/tripApi";
import type { TripSummary } from "../../../models/TripSummary";
import { getApiErrorMessage } from "../../../api/client";
import { calculateBudgetHealth } from "../../../domain/budget";


type State = {
  data: TripSummary | null;
  loading: boolean;
  error: string | null;
  health: ReturnType<typeof calculateBudgetHealth> | null;
};

export function useTripSummary(tripId: number, refreshKey: number): State {
  const [data, setData] = useState<TripSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    getTripSummary(tripId)
      .then((res) => {
        if (!alive) return;
        setData(res);
      })
      .catch((err) => {
        if (!alive) return;
        setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [tripId, refreshKey]);

  const health = useMemo(() => {
    if (!data) return null;
    return calculateBudgetHealth(
      Number(data.budgetTotal ?? 0),
      Number(data.expensesTotal ?? 0)
    );
  }, [data]);

  return { data, loading, error, health };
}
