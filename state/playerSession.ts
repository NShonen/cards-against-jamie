interface PlayerSession {
  playerId: string;
  roomName: string;
}

const playerSessions: PlayerSession[] = [];

export const addPlayerSession = (playerId: string, roomName: string) => {
  playerSessions.push({ playerId, roomName });
};

export const removePlayerSession = (playerId: string) => {
  const index = playerSessions.findIndex(
    (session) => session.playerId === playerId
  );
  if (index !== -1) {
    playerSessions.splice(index, 1);
  }
};

export const getPlayerSession = (
  playerId: string
): PlayerSession | undefined => {
  return playerSessions.find((session) => session.playerId === playerId);
};
