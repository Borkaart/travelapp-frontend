import React from "react";

type Props = {
  title?: string;
  onLogout?: () => void;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};

export default function AppShell({ title = "TravelApp", onLogout, sidebar, children }: Props) {
  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <span style={styles.badge}>DEV</span>
        </div>

        {onLogout && (
          <button onClick={onLogout} style={styles.logoutBtn}>
            Sair
          </button>
        )}
      </header>

      <div style={styles.body}>
        <aside style={styles.sidebar}>
          {sidebar ?? (
            <div>
              <p style={styles.sideTitle}>Menu</p>
              <p style={styles.sideItemMuted}>Trips</p>
              <p style={styles.sideItemMuted}>Summary</p>
            </div>
          )}
        </aside>

        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    background: "#0b1020",
    color: "#e8eefc",
  },
  header: {
    height: 56,
    padding: "0 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0b1020",
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
    gridTemplateColumns: "240px 1fr",
  },
  sidebar: {
    padding: 16,
    borderRight: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
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
  content: {
    padding: 16,
    maxWidth: 980,
  },
};
