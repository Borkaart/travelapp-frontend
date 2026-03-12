import React from "react";
import { ToastProvider } from "../../shared/toast/ToastProvider";
import { ThemeProvider } from "../../shared/contexts/ThemeContext";

type Props = { children: React.ReactNode };

export default function AppProviders({ children }: Props) {
  return (
    <ThemeProvider>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
