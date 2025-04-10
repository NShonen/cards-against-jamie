"use client";

import { ReactNode } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { NetworkDisconnectDialog } from "@/components/NetworkDisconnectDialog";
import { Providers } from "@/components/providers/Providers";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <Providers>
        <ToastProvider />
        <NetworkDisconnectDialog />
        {children}
      </Providers>
    </ErrorBoundary>
  );
}
