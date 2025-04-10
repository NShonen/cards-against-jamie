import { Server } from "socket.io";
import { NextApiRequest } from "next";
import { Server as NetServer } from "http";
import { Socket as NetSocket } from "net";
import { headers } from "next/headers";

interface SocketServer extends NetServer {
  io?: Server;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

// Store the Socket.IO server instance
let io: Server | undefined;

// Get the global HTTP server instance
const getHttpServer = () => {
  // @ts-ignore - This is a Next.js internal property
  const httpServer = global.__nextHttpServer;
  if (!httpServer) {
    throw new Error("HTTP Server not initialized");
  }
  return httpServer;
};

export async function GET(req: Request) {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const origin = req.headers.get("origin");
    if (!origin?.includes("vercel.app")) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    if (!io) {
      const httpServer = getHttpServer();

      io = new Server(httpServer, {
        path: "/api/socket",
        addTrailingSlash: false,
        cors: {
          origin: isProduction
            ? ["https://*.vercel.app"]
            : ["http://localhost:3000"],
          methods: ["GET", "POST"],
          credentials: true,
        },
      });

      // Set up connection handling
      io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        // Example of maintaining state (possible in traditional runtime)
        const userSessions = new Map();

        socket.on("login", (userData) => {
          userSessions.set(socket.id, {
            ...userData,
            lastActive: Date.now(),
          });
        });

        socket.on("disconnect", () => {
          userSessions.delete(socket.id);
          console.log("Client disconnected:", socket.id);
        });
      });
    }

    return new Response("WebSocket server is running", { status: 200 });
  } catch (error) {
    console.error("Socket server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export { GET as POST };
