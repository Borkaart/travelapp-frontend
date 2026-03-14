import React from "react";
import { ToastProvider } from "../../shared/toast/ToastProvider";
import { ThemeProvider } from "../../shared/contexts/ThemeContext";
import { AuthProvider } from "../../shared/context/AuthContext";

type Props = { children: React.ReactNode };

export default function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
