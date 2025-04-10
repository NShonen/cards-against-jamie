"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription>
            {error.message || "An unexpected error occurred."}
          </AlertDescription>
        </Alert>
        <div className="flex space-x-4">
          <Button onClick={() => reset()} variant="secondary">
            Try again
          </Button>
          <Button onClick={() => router.push("/")} variant="default">
            Return home
          </Button>
        </div>
      </div>
    </div>
  );
}
