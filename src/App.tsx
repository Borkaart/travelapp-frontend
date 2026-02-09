import { useState } from "react";
import AppShell from "./components/AppShell";
import Trips from "./pages/Trips";
import Login from "./pages/Login";
import TripSummaryPage from "./pages/TripSummary";

function hasToken(): boolean {
  return Boolean(localStorage.getItem("accessToken"));
}

type View = "trips" | "summary";

export default function App() {
  const [authenticated, setAuthenticated] = useState(hasToken);
  const [view, setView] = useState<View>("trips");
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  function handleLoginSuccess() {
    setAuthenticated(true);
    setView("trips");
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    setAuthenticated(false);
    setView("trips");
    setSelectedTripId(null);
  }

  function openSummary(tripId: number) {
    setSelectedTripId(tripId);
    setView("summary");
  }

  function goBack() {
    setView("trips");
  }

  if (!authenticated) {
    return (
      <div style={{ padding: 16 }}>
        <Login onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <AppShell
      title="TravelApp"
      onLogout={handleLogout}
      sidebar={
        <div>
          <p style={{ margin: "0 0 12px 0", opacity: 0.75, fontSize: 12 }}>
            Navegação
          </p>

          <button
            onClick={() => setView("trips")}
            style={menuBtn(view === "trips")}
          >
            Trips
          </button>

          <button
            onClick={() => selectedTripId && setView("summary")}
            style={menuBtn(view === "summary")}
            disabled={!selectedTripId}
            title={!selectedTripId ? "Selecione uma trip primeiro" : undefined}
          >
            Summary
          </button>
        </div>
      }
    >
      {view === "trips" && <Trips onOpenSummary={openSummary} />}

      {view === "summary" && selectedTripId != null && (
        <TripSummaryPage tripId={selectedTripId} onBack={goBack} />
      )}

      {view === "summary" && selectedTripId == null && (
        <p>Selecione uma trip antes.</p>
      )}
    </AppShell>
  );
}

function menuBtn(active: boolean): React.CSSProperties {
  return {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: active ? "rgba(99,102,241,0.22)" : "rgba(255,255,255,0.04)",
    color: "#e8eefc",
    cursor: "pointer",
    marginBottom: 8,
    opacity: active ? 1 : 0.85,
  };
}
