"use client";

import { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function GameRoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Game room error:", error);
  }, [error]);

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Game Room Error</AlertTitle>
          <AlertDescription>
            {error.message || "An error occurred while loading the game room."}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center space-x-4">
          <Button onClick={() => reset()} variant="secondary">
            Try again
          </Button>
          <Button onClick={() => router.push("/")} variant="default">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
