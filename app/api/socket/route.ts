import { Server } from "socket.io";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Add immediate logging to verify route is being hit
console.log("[Socket] Route module loaded");

let io: Server | undefined;

if (!io) {
  // @ts-ignore - Next.js server instance
  const httpServer = global.__nextHttpServer;

  if (httpServer) {
    console.log("[Socket] Creating Socket.IO instance");
    io = new Server(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? ["https://*.vercel.app"]
            : ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("[Socket] Client connected:", {
        id: socket.id,
        handshake: {
          headers: socket.handshake.headers,
          query: socket.handshake.query,
          auth: socket.handshake.auth,
        },
      });

      socket.on("room:create", (playerName, callback) => {
        console.log("[Socket] Room create request:", { playerName });
        const roomCode = Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase();
        socket.join(roomCode);
        callback(roomCode);
        console.log("[Socket] Room created:", { roomCode, playerName });
      });

      socket.on("room:join", (roomId, playerName) => {
        console.log("[Socket] Room join request:", { roomId, playerName });
        socket.join(roomId);
        io?.to(roomId).emit("room:joined", {
          id: roomId,
          players: [], // This should be populated from your room store
          currentRound: 0,
          gameState: "waiting",
        });
        console.log("[Socket] Player joined room:", { roomId, playerName });
      });

      socket.on("disconnect", () => {
        console.log("[Socket] Client disconnected:", socket.id);
      });
    });
  } else {
    console.error("[Socket] HTTP Server not available");
  }
}

export async function GET(req: Request) {
  console.log("[Socket] GET request received");

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "wss" : "ws";
    const wsUrl = `${protocol}://${host}`;

    console.log("[Socket] Returning WebSocket URL:", wsUrl);

    return NextResponse.json({ url: wsUrl });
  } catch (error) {
    console.error("[Socket] Error in GET handler:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export { GET as POST };
