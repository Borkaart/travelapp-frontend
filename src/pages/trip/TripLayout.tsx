import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Calendar, DollarSign, List, PieChart } from "lucide-react";
import { getTripById, type TripListItem } from "../../api/tripApi";
import { ui } from "../../shared/ui/tokens";
import { images } from "../../shared/ui/assets";
import Header from "../../components/Header";

export type TripOutletContext = {
  refreshKey: number;
  triggerRefresh: () => void;
  trip: TripListItem | null;
};

export default function TripLayout() {
  const { tripId } = useParams();
  const location = useLocation();
  const numericTripId = Number(tripId);

  const [refreshKey, setRefreshKey] = useState(0);
  const [trip, setTrip] = useState<TripListItem | null>(null);

  function triggerRefresh() {
    setRefreshKey((k) => k + 1);
  }

  useEffect(() => {
    if (!Number.isFinite(numericTripId)) return;

    let alive = true;

    getTripById(numericTripId)
      .then((data) => {
        if (!alive) return;
        setTrip(data);
      })
      .catch(() => {
        if (!alive) return;
        setTrip(null);
      });

    return () => {
      alive = false;
    };
  }, [numericTripId]);

  const currentTab = useMemo(() => {
    const p = location.pathname;
    if (p.endsWith(`/trips/${tripId}`) || p.endsWith(`/trips/${tripId}/`)) return "summary";
    if (p.includes("/summary")) return "summary";
    if (p.includes("/budget")) return "budget";
    if (p.includes("/itinerary")) return "itinerary";
    if (p.includes("/activities")) return "itinerary";
    if (p.includes("/expenses")) return "expenses";
    return "";
  }, [location.pathname, tripId]);

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: ui.radius.full,
    fontSize: ui.typography.fontSize.sm,
    fontWeight: ui.typography.fontWeight.medium,
    textDecoration: "none",
    color: isActive ? ui.colors.primary[600] : ui.colors.neutral[600],
    background: isActive ? ui.colors.primary[50] : "transparent",
    border: `1px solid ${isActive ? ui.colors.primary[100] : "transparent"}`,
    transition: ui.transitions.fast,
  });

  return (
    <div style={{ minHeight: "100vh", background: ui.colors.neutral[50] }}>
      <Header />

      {/* Trip Hero */}
      <div
        className="fade-in"
        style={{
          height: 240,
          background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${
            trip?.destinationImageUrl || images.defaultDestination
          }) no-repeat center center / cover`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: `${ui.space.xl}px ${ui.space.xxl}px`,
          color: "white",
        }}
      >
        <div className="container" style={{ width: "100%", padding: 0 }}>
          <div style={{ fontSize: ui.typography.fontSize.sm, opacity: 0.9, marginBottom: 4 }}>
            Viagem para
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: ui.typography.fontSize["4xl"],
              fontWeight: ui.typography.fontWeight.bold,
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {trip?.title ?? `#${tripId}`}
          </h1>
          {trip?.destinationName && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, opacity: 0.9 }}>
              <span style={{ fontWeight: 600 }}>{trip.destinationName}</span>
              <span>•</span>
              <span>
                {new Date(trip.startDate).toLocaleDateString()} -{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          background: ui.colors.white,
          borderBottom: `1px solid ${ui.colors.neutral[200]}`,
          position: "sticky",
          top: 73, // Height of Header (approx)
          zIndex: ui.z.header - 1,
        }}
      >
        <div className="container" style={{ padding: "12px 16px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: ui.space.sm }}>
            <NavLink to="summary" style={navLinkStyle}>
              <PieChart size={16} />
              Resumo
            </NavLink>
            <NavLink to="itinerary" style={navLinkStyle}>
              <Calendar size={16} />
              Itinerário
            </NavLink>
            <NavLink to="budget" style={navLinkStyle}>
              <DollarSign size={16} />
              Orçamento
            </NavLink>
            <NavLink to="expenses" style={navLinkStyle}>
              <List size={16} />
              Despesas
            </NavLink>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container" style={{ padding: `${ui.space.xl}px 16px`, minHeight: "calc(100vh - 400px)" }}>
        <Outlet context={{ refreshKey, triggerRefresh, trip } satisfies TripOutletContext} />
      </div>
    </div>
  );
}
