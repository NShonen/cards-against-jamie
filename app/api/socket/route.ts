import { Server } from "socket.io";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Server as NetServer } from "http";
import { Socket as NetSocket } from "net";

interface SocketServer extends NetServer {
  io?: Server;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export const runtime = "edge";

const socketHandler = (req: NextRequest) => {
  if (
    process.env.NODE_ENV === "production" &&
    !req.headers.get("origin")?.includes("vercel.app")
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const io = new Server({
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
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    return new NextResponse("WebSocket server is running", { status: 200 });
  } catch (error) {
    console.error("Socket server error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export { socketHandler as GET, socketHandler as POST };
