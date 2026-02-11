import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import TripSummary from "../TripSummary";

type OutletCtx = { refreshKey: number; triggerRefresh: () => void };

export default function TripSummaryPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { refreshKey } = useOutletContext<OutletCtx>();

  const tid = Number(tripId);
  if (!Number.isFinite(tid)) return <p>Trip inválida.</p>;

  return <TripSummary tripId={tid} refreshKey={refreshKey} onBack={() => navigate(-1)} />;
}
