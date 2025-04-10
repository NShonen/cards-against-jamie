"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { setRoom } from "@/store/slices/roomSlice";
import { savePlayerInfo } from "@/lib/localStorage";

const RoomCreation = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [roomName, setRoomName] = useState("");
  const [hostName, setHostName] = useState("");
  const [password, setPassword] = useState("");
  const [winCondition, setWinCondition] = useState<"score" | "rounds">("score");
  const [target, setTarget] = useState("5");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/room/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName,
          hostName,
          password: isPasswordProtected ? password : undefined,
          winCondition: {
            type: winCondition,
            target: parseInt(target),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create room");
      }

      // Save to Redux or context
      dispatch(
        setRoom({
          roomCode: data.roomCode,
          playerId: data.playerId,
          winCondition: data.winCondition,
        })
      );

      // After room creation success
      savePlayerInfo({
        playerId: data.playerId,
        roomCode: data.roomCode,
        playerName: hostName,
      });

      router.push(`/room/${data.roomCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              placeholder="Enter a name for your room"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hostName">Your Name</Label>
            <Input
              id="hostName"
              placeholder="Enter your display name"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="password-toggle" className="cursor-pointer">
                Password Protection
              </Label>
              <Switch
                id="password-toggle"
                checked={isPasswordProtected}
                onCheckedChange={setIsPasswordProtected}
                disabled={isLoading}
              />
            </div>
            {isPasswordProtected && (
              <div className="space-y-2">
                <Label htmlFor="password">Room Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Win Condition</Label>
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={winCondition}
                onValueChange={(value: "score" | "rounds") =>
                  setWinCondition(value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">Points</SelectItem>
                  <SelectItem value="rounds">Rounds</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={target}
                onValueChange={setTarget}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 15, 20].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {winCondition === "score" ? "points" : "rounds"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RoomCreation;
