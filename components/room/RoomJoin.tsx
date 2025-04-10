"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/store/hooks";
import { setRoom } from "@/store/slices/roomSlice";
import { savePlayerInfo } from "@/lib/localStorage";

const formSchema = z.object({
  roomCode: z
    .string()
    .min(4, "Room code must be at least 4 characters")
    .max(6, "Room code must be at most 6 characters"),
  playerName: z.string().min(2, "Name must be at least 2 characters"),
});

type FormData = z.infer<typeof formSchema>;

export default function RoomJoin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomCode: "",
      playerName: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const normalizedRoomCode = data.roomCode.toUpperCase().trim();

    try {
      const response = await fetch(`/api/room/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomCode: normalizedRoomCode,
          playerName: data.playerName,
        }),
      });

      const roomData = await response.json();

      if (!response.ok) {
        throw new Error(roomData.error || "Failed to join room");
      }

      dispatch(
        setRoom({
          ...roomData,
          playerName: data.playerName,
        })
      );

      savePlayerInfo({
        playerId: roomData.playerId,
        roomCode: roomData.roomCode,
        playerName: data.playerName,
      });

      router.push(`/room/${normalizedRoomCode}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to join room",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              id="roomCode"
              placeholder="ABC123"
              {...form.register("roomCode")}
              disabled={loading}
              maxLength={6}
              className="uppercase"
            />
            {form.formState.errors.roomCode && (
              <p className="text-sm text-destructive">
                {form.formState.errors.roomCode.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name"
              {...form.register("playerName")}
              disabled={loading}
              maxLength={20}
            />
            {form.formState.errors.playerName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.playerName.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
