"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch } from "@/store/hooks";
import { setRoom } from "@/store/slices/roomSlice";

const formSchema = z.object({
  playerName: z.string().min(2, "Name must be at least 2 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface RoomJoinProps {
  roomCode: string;
}

export default function RoomJoin({ roomCode }: RoomJoinProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      playerName: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Join room via API
      const response = await fetch(`/api/rooms/${roomCode}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName: data.playerName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to join room");
      }

      const roomData = await response.json();
      dispatch(setRoom(roomData));

      // Navigate to the room page
      router.push(`/room/${roomCode}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join room",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Join Room</h1>
          <p className="text-muted-foreground mt-2">Room Code: {roomCode}</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name"
              {...form.register("playerName")}
              disabled={loading}
              className="w-full"
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
