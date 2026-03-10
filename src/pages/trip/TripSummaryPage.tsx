import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import TripSummary from "../TripSummary";
import type { TripOutletContext } from "./TripLayout";

export default function TripSummaryPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { refreshKey, trip } = useOutletContext<TripOutletContext>();

  const tid = Number(tripId);
  if (!Number.isFinite(tid)) return <p>Trip invalida.</p>;

  return (
    <TripSummary
      tripId={tid}
      destinationId={trip?.destinationId}
      refreshKey={refreshKey}
      onBack={() => navigate(-1)}
    />
  );
}
