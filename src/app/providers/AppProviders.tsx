import React from "react";
import { ToastProvider } from "../../shared/toast/ToastProvider";

type Props = { children: React.ReactNode };

export default function AppProviders({ children }: Props) {
  return <ToastProvider>{children}</ToastProvider>;
}
