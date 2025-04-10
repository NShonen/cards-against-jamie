"use client";

import { ReactNode } from "react";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { ToastProvider } from "@/app/components/providers/ToastProvider";
import { NetworkDisconnectDialog } from "@/app/components/NetworkDisconnectDialog";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <ToastProvider />
      <NetworkDisconnectDialog />
      {children}
    </ErrorBoundary>
  );
}
