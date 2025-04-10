const PLAYER_ID_KEY = "playerId";
const ROOM_CODE_KEY = "roomCode";
const PLAYER_NAME_KEY = "playerName";

export function savePlayerInfo({
  playerId,
  roomCode,
  playerName,
}: {
  playerId: string;
  roomCode: string;
  playerName: string;
}) {
  localStorage.setItem(PLAYER_ID_KEY, playerId);
  localStorage.setItem(ROOM_CODE_KEY, roomCode);
  localStorage.setItem(PLAYER_NAME_KEY, playerName);
}

export function getPlayerInfo(): {
  playerId: string | null;
  roomCode: string | null;
  playerName: string | null;
} {
  return {
    playerId: localStorage.getItem(PLAYER_ID_KEY),
    roomCode: localStorage.getItem(ROOM_CODE_KEY),
    playerName: localStorage.getItem(PLAYER_NAME_KEY),
  };
}

export function clearPlayerInfo() {
  localStorage.removeItem(PLAYER_ID_KEY);
  localStorage.removeItem(ROOM_CODE_KEY);
  localStorage.removeItem(PLAYER_NAME_KEY);
}
