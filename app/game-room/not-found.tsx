import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GameRoomNotFound() {
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Alert>
          <AlertTitle>Game Room Not Found</AlertTitle>
          <AlertDescription>
            The game room you&apos;re looking for doesn&apos;t exist or has been
            closed.
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
