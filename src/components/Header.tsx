import { useNavigate } from "react-router-dom";
import { LogOut, Map, Plus } from "lucide-react";
import { clearToken } from "../auth";
import { ui } from "../shared/ui/tokens";
import { images } from "../shared/ui/assets";
import { ghostButtonStyle, primaryButtonStyle } from "../shared/ui/styles";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${ui.space.md}px ${ui.space.xl}px`,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${ui.colors.neutral[200]}`,
        position: "sticky",
        top: 0,
        zIndex: ui.z.header,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate("/trips")}
        onKeyDown={(e) => (e.key === "Enter" ? navigate("/trips") : null)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: ui.space.sm,
          cursor: "pointer",
          outline: "none",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: `linear-gradient(135deg, ${ui.colors.primary[500]}, ${ui.colors.primary[600]})`,
            borderRadius: ui.radius.md,
            display: "grid",
            placeItems: "center",
            color: "white",
          }}
        >
          <Map size={18} />
        </div>
        <span
          style={{
            fontFamily: ui.typography.fontFamily.heading,
            fontWeight: ui.typography.fontWeight.bold,
            fontSize: ui.typography.fontSize.lg,
            color: ui.colors.neutral[900],
          }}
        >
          Travel App
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: ui.space.md }}>
        <button
          onClick={() => navigate("/trips/new")}
          style={{
            ...primaryButtonStyle(),
            padding: "8px 16px",
            minHeight: 36,
            fontSize: ui.typography.fontSize.sm,
          }}
        >
          <Plus size={16} style={{ marginRight: 6 }} />
          Nova Viagem
        </button>

        <div
          style={{
            width: 1,
            height: 24,
            background: ui.colors.neutral[200],
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: ui.space.sm }}>
          <img
            src={images.userAvatar}
            alt="User"
            style={{
              width: 32,
              height: 32,
              borderRadius: ui.radius.full,
              border: `2px solid ${ui.colors.white}`,
              boxShadow: ui.shadows.sm,
            }}
          />
          <button
            onClick={() => {
              clearToken();
              navigate("/login");
            }}
            style={{
              ...ghostButtonStyle(),
              padding: 8,
              minHeight: 32,
              color: ui.colors.neutral[500],
            }}
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
