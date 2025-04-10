"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";

// Add immediate logging to verify context is being loaded
console.log("[SocketContext] Module initialized");

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastError: Error | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastError: null,
});

export const useSocket = () => useContext(SocketContext);

interface ExtendedError extends Error {
  description?: string;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  console.log("[SocketContext] Provider component rendered");

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("[SocketContext] useEffect triggered");

    const initSocket = async () => {
      try {
        console.log("[SocketContext] Fetching WebSocket URL...");
        const response = await fetch("/api/socket");
        console.log("[SocketContext] Initial fetch response:", {
          status: response.status,
          statusText: response.statusText,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to get WebSocket URL: ${response.status} ${
              response.statusText
            }\n${JSON.stringify(errorData, null, 2)}`
          );
        }

        const { url } = await response.json();
        console.log("[SocketContext] WebSocket URL received:", url);

        // Initialize socket with the provided URL
        console.log("[SocketContext] Initializing socket with URL:", url);
        const socketInstance = io(url, {
          path: "/api/socket",
          addTrailingSlash: false,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          transports: ["websocket", "polling"],
          autoConnect: true,
        });

        // Debug socket state
        console.log("[SocketContext] Socket instance created:", {
          id: socketInstance.id,
          connected: socketInstance.connected,
          disconnected: socketInstance.disconnected,
        });

        socketInstance.on("connect", () => {
          console.log("[SocketContext] Socket connected:", {
            id: socketInstance.id,
            transport: (socketInstance as any).io.engine.transport.name,
            upgrades: (socketInstance as any).io.engine.upgrades,
          });
          setIsConnected(true);
          setLastError(null);
        });

        socketInstance.on("disconnect", (reason) => {
          console.log("[SocketContext] Socket disconnected:", { reason });
          setIsConnected(false);
        });

        socketInstance.on("connect_error", (error: ExtendedError) => {
          console.error("[SocketContext] Socket connection error:", {
            name: error.name,
            message: error.message,
            description: error.description,
            context: {
              url,
              transport: (socketInstance as any).io?.engine?.transport?.name,
              readyState: (socketInstance as any).io?.engine?.readyState,
            },
          });
          setIsConnected(false);
          setLastError(error);
        });

        socketInstance.on("reconnect", (attemptNumber) => {
          console.log("[SocketContext] Socket reconnected:", {
            attemptNumber,
            transport: (socketInstance as any).io.engine.transport.name,
          });
          setIsConnected(true);
          setLastError(null);
        });

        socketInstance.on("reconnect_error", (error: Error) => {
          console.error("[SocketContext] Socket reconnection error:", {
            name: error.name,
            message: error.message,
            attempt: (socketInstance as any).io.reconnectionAttempts,
          });
          setIsConnected(false);
          setLastError(error);
        });

        socketInstance.on("reconnect_attempt", (attemptNumber) => {
          console.log("[SocketContext] Reconnection attempt:", {
            attemptNumber,
            delay: (socketInstance as any).io.reconnectionDelay,
          });
        });

        setSocket(socketInstance);

        return () => {
          console.log("[SocketContext] Cleaning up socket connection");
          socketInstance.disconnect();
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error("[SocketContext] Failed to initialize socket:", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
        setIsConnected(false);
        setLastError(err);
      }
    };

    initSocket();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, lastError }}>
      {children}
    </SocketContext.Provider>
  );
}
