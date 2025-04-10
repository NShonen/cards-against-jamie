import { LoadingState } from "@/components/LoadingState";

export default function GameRoomLoading() {
  return (
    <div className="container mx-auto p-4">
      <LoadingState type="full" />
    </div>
  );
}
