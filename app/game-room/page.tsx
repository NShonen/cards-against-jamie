import RoomCreation from "../../components/room/RoomCreation";
import RoomJoin from "../../components/room/RoomJoin";

export default function GameRoomPage() {
  return (
    <div>
      <h1>Game Room</h1>
      <RoomCreation />
      <RoomJoin />
    </div>
  );
}
