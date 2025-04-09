import { NextApiRequest, NextApiResponse } from "next";

const rooms: { name: string; password?: string }[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "DELETE") {
    const { roomName } = req.body;
    const index = rooms.findIndex((r) => r.name === roomName);
    if (index === -1) {
      return res.status(404).json({ error: "Room not found" });
    }
    // Remove room from the list
    rooms.splice(index, 1);
    return res.status(200).json({ message: "Room closed successfully" });
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
