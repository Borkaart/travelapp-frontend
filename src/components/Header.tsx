import { useNavigate } from "react-router-dom";
import { LogOut, Map, Plus } from "lucide-react";
import { clearToken } from "../auth";
import { useAuth } from "../shared/context/AuthContext";
import { ui } from "../shared/ui/tokens";
import { images } from "../shared/ui/assets";
import { ghostButtonStyle, primaryButtonStyle } from "../shared/ui/styles";
import { ThemeToggle } from "../shared/ui/ThemeToggle";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const getAvatarGradient = () => {
    if (!user) return "linear-gradient(135deg, #f59e0b, #ea580c)";
    if (user.gender === "MALE") return "linear-gradient(135deg, #3b82f6, #1d4ed8)";
    if (user.gender === "FEMALE") return "linear-gradient(135deg, #ec4899, #be185d)";
    return "linear-gradient(135deg, #f59e0b, #ea580c)";
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${ui.space.md}px ${ui.space.xl}px`,
        background: "rgba(var(--bg-glass-rgb), 0.8)",
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

        <ThemeToggle />

        <div
          style={{
            width: 1,
            height: 24,
            background: ui.colors.neutral[200],
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: ui.space.sm }}>
          <div 
            onClick={() => navigate("/profile")}
            style={{
              width: 32,
              height: 32,
              borderRadius: ui.radius.full,
              border: `2px solid ${ui.colors.white}`,
              boxShadow: ui.shadows.sm,
              background: user?.profileImage ? `url(${user.profileImage}) center/cover` : getAvatarGradient(),
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: 14, fontWeight: "bold", textTransform: "uppercase",
              cursor: "pointer",
              overflow: "hidden"
            }}
          >
            {!user?.profileImage && user?.name?.charAt(0)}
          </div>
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
