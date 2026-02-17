import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "../auth"; // ajuste se seu auth.ts estiver em outro path

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();

  const title =
    location.pathname.startsWith("/trips") ? "Trips" :
    location.pathname.startsWith("/login") ? "Login" :
    "TravelApp";

  function onLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <span style={styles.badge}>DEV</span>
        </div>

        <button onClick={onLogout} style={styles.logoutBtn}>
          Sair
        </button>
      </header>

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          <p style={styles.sideTitle}>Menu</p>

          <NavLink to="/trips" style={({ isActive }) => navItem(isActive)}>
            📌 Trips
          </NavLink>

          <NavLink to="/trips/new" style={({ isActive }) => navItem(isActive)}>
            ➕ Nova Trip
          </NavLink>

          <div style={styles.sideDivider} />

          <p style={styles.sideTitle}>Contexto</p>
          <div style={styles.sideItemMuted}>
            {location.pathname.startsWith("/trips/")
              ? "Dentro de uma Trip"
              : "Visão geral"}
          </div>
        </aside>

        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function navItem(isActive: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 650,
    border: `1px solid ${isActive ? "rgba(255,255,255,0.14)" : "transparent"}`,
    background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
    color: isActive ? "#ffffff" : "rgba(232,238,252,0.85)",
    cursor: "pointer",
    transition: "all 120ms ease",
    marginTop: 6,
  };
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    background:
      "radial-gradient(1200px 600px at 20% 0%, #2a2a2a 0%, #141414 60%, #0f0f0f 100%)",
    color: "#e8eefc",
  },
  header: {
    height: 56,
    padding: "0 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  badge: {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: "rgba(99,102,241,0.18)",
    border: "1px solid rgba(99,102,241,0.35)",
    color: "#c7d2fe",
  },
  logoutBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#e8eefc",
    cursor: "pointer",
  },
  body: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "260px 1fr",
  },
  sidebar: {
    padding: 16,
    borderRight: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.18)",
    backdropFilter: "blur(10px)",
  },
  sideTitle: {
    margin: "0 0 8px 0",
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "rgba(232,238,252,0.7)",
  },
  sideItemMuted: {
    margin: "8px 0",
    color: "rgba(232,238,252,0.75)",
  },
  sideDivider: {
    height: 1,
    background: "rgba(255,255,255,0.10)",
    margin: "14px 0",
  },
  content: {
    padding: 16,
    maxWidth: 1100,
    width: "100%",
  },
};
