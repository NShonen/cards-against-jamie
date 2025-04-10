"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function NetworkDisconnectDialog() {
  const [isOnline, setIsOnline] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    function onOnline() {
      setIsOnline(true);
      setIsOpen(false);
      toast({
        title: "Connection Restored",
        description: "You are back online.",
        variant: "default",
      });
    }

    function onOffline() {
      setIsOnline(false);
      setIsOpen(true);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Network Disconnected</DialogTitle>
          <DialogDescription>
            You are currently offline. Please check your internet connection.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button variant="default" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
