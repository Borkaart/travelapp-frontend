import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { clearToken } from "../../auth";


export default function TripLayout() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [refreshKey, setRefreshKey] = useState(0);

  function triggerRefresh() {
    setRefreshKey((k) => k + 1);
  }

  // deixa "summary" como default visual quando cair em /trips/:tripId
  const currentTab = useMemo(() => {
    const p = location.pathname;
    if (p.endsWith(`/trips/${tripId}`) || p.endsWith(`/trips/${tripId}/`)) return "summary";
    if (p.includes("/summary")) return "summary";
    if (p.includes("/budget")) return "budget";
    if (p.includes("/itinerary")) return "itinerary";
    if (p.includes("/activities")) return "activities";
    if (p.includes("/expenses")) return "expenses";
    return "";
  }, [location.pathname, tripId]);

  const tabStyle = (isActive: boolean) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    border: `1px solid ${isActive ? "#2f2f2f" : "transparent"}`,
    background: isActive ? "#0f0f0f" : "transparent",
    color: isActive ? "#ffffff" : "rgba(255,255,255,0.80)",
    transition: "all 120ms ease",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(1200px 600px at 20% 0%, #2a2a2a 0%, #141414 60%, #0f0f0f 100%)",
        color: "#fff",
      }}
    >
      {/* Container central (resolve o “vazio” em telas grandes) */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                borderRadius: 12,
                border: "1px solid #2c2c2c",
                background: "#161616",
                color: "rgba(255,255,255,0.9)",
                cursor: "pointer",
              }}
            >
              ← Voltar
            </button>

            <div>
              <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 2 }}>Trip</div>
              <h2 style={{ margin: 0, fontSize: 22, letterSpacing: -0.2 }}>#{tripId}</h2>
            </div>
          </div>

          {/* espaço para ações futuras (Logout, Share etc.) */}
          <div style={{ display: "flex", gap: 10 }} />
        </div>

        {/* Tabs (estilo app, não “links azuis”) */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: 8,
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            width: "fit-content",
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

          <NavLink to="activities" style={({ isActive }) => tabStyle(isActive || currentTab === "activities")}>
            Activities
          </NavLink>

          <NavLink to="expenses" style={({ isActive }) => tabStyle(isActive || currentTab === "expenses")}>
            Expenses
          </NavLink>
        </div>

        {/* Conteúdo */}
        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Outlet context={{ refreshKey, triggerRefresh }} />
        </div>
      </div>
    </div>
  );
}
