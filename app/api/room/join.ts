import { NextApiRequest, NextApiResponse } from "next";

const rooms: { name: string; password?: string }[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { roomName, password } = req.body;
    const room = rooms.find((r) => r.name === roomName);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    if (room.password && room.password !== password) {
      return res.status(403).json({ error: "Incorrect password" });
    }
    // Logic to join room
    return res.status(200).json({ message: "Joined room successfully" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
