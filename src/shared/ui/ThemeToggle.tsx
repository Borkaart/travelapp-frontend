import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { ghostButtonStyle } from "./styles";
import { ui } from "./tokens";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        ...ghostButtonStyle(),
        color: theme === 'dark' ? ui.colors.neutral[50] : ui.colors.neutral[900],
        padding: "8px",
        borderRadius: ui.radius.full,
        width: ui.controlHeight.md,
        height: ui.controlHeight.md,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} color="#FFFFFF" fill="#FFD700" strokeWidth={2} />
      ) : (
        <Moon size={20} color="#003366" fill="#003366" />
      )}
    </button>
  );
}
