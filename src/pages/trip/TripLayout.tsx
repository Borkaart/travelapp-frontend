import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { clearToken } from "../../auth";
import { getTripById, type TripListItem } from "../../api/tripApi";
import { buildBackgroundStyle } from "../../features/trips/backgrounds";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { ui } from "../../shared/ui/tokens";

export type TripOutletContext = {
  refreshKey: number;
  triggerRefresh: () => void;
  trip: TripListItem | null;
};

export default function TripLayout() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const numericTripId = Number(tripId);
  const isNarrow = useMediaQuery("(max-width: 720px)");

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

  const tabStyle = (isActive: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: isNarrow ? "12px 14px" : "10px 12px",
    borderRadius: ui.radius.sm,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    border: `1px solid ${isActive ? "#2f2f2f" : "transparent"}`,
    background: isActive ? "#0f0f0f" : "transparent",
    color: isActive ? "#ffffff" : "rgba(255,255,255,0.80)",
    transition: "all 120ms ease",
    cursor: "pointer",
    minHeight: ui.controlHeight.md,
    flex: isNarrow ? "1 1 140px" : undefined,
  });

  return (
    <div
      style={{
        ...buildBackgroundStyle(trip?.destinationImageUrl),
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isNarrow ? `${ui.space.xl}px ${ui.space.lg}px 28px` : `28px ${ui.space.xxl}px`,
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: isNarrow ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: isNarrow ? "flex-start" : "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => {
                clearToken();
                navigate("/login", { replace: true });
              }}
            >
              Sair
            </button>

            <button
              type="button"
              onClick={() => navigate("/trips")}
              style={{
                padding: "10px 12px",
                borderRadius: ui.radius.md,
                border: "1px solid #2c2c2c",
                background: "#161616",
                color: "rgba(255,255,255,0.9)",
                cursor: "pointer",
                minHeight: ui.controlHeight.md,
              }}
            >
              &lt;- Voltar
            </button>

            <div>
              <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 2 }}>Trip</div>
              <h2
                style={{
                  margin: 0,
                  fontSize: isNarrow ? 20 : 22,
                  letterSpacing: -0.2,
                  wordBreak: "break-word",
                }}
              >
                {trip?.title ?? `#${tripId}`}
              </h2>
              {trip?.destinationName ? (
                <div style={{ fontSize: 13, opacity: 0.72, marginTop: 4 }}>{trip.destinationName}</div>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }} />
        </div>

        <div
          style={{
            display: "flex",
            gap: ui.space.sm,
            flexWrap: "wrap",
            padding: ui.space.sm,
            borderRadius: ui.radius.lg,
            background: "rgba(4,12,24,0.38)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            width: isNarrow ? "100%" : "fit-content",
            marginBottom: 18,
          }}
        >
          <NavLink to="summary" style={({ isActive }) => tabStyle(isActive || currentTab === "summary")}>
            Summary
          </NavLink>

          <NavLink to="budget" style={({ isActive }) => tabStyle(isActive || currentTab === "budget")}>
            Budget
          </NavLink>

          <NavLink to="itinerary" style={({ isActive }) => tabStyle(isActive || currentTab === "itinerary")}>
            Itinerary
          </NavLink>

          <NavLink to="expenses" style={({ isActive }) => tabStyle(isActive || currentTab === "expenses")}>
            Expenses
          </NavLink>
        </div>

        <div
          style={{
            padding: ui.space.xl,
            borderRadius: ui.radius.xl,
            background: "rgba(4,12,24,0.40)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(14px)",
            overflow: "hidden",
            minHeight: "calc(100vh - 190px)",
            boxSizing: "border-box",
          }}
        >
          <Outlet context={{ refreshKey, triggerRefresh, trip } satisfies TripOutletContext} />
        </div>
      </div>
    </div>
  );
}
