import { NextApiRequest, NextApiResponse } from "next";

const rooms: { name: string; password?: string }[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { roomName, password } = req.body;
    if (!roomName) {
      return res.status(400).json({ error: "Room name is required" });
    }
    // Add room to the list
    rooms.push({ name: roomName, password });
    return res.status(201).json({ message: "Room created successfully" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
