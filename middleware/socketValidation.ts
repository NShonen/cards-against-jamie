import { Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  Room,
  GameState,
} from "@/types/socket";
import {
  ROOM_EVENTS,
  GAME_EVENTS,
  CARD_EVENTS,
  JUDGING_EVENTS,
} from "@/constants/socketEvents";

type SocketWithData = Socket<ClientToServerEvents, ServerToClientEvents> & {
  data: {
    playerId?: string;
    playerName?: string;
    roomId?: string;
    __lastEventArgs?: any[];
  };
};

type ValidationMiddleware = (
  socket: SocketWithData,
  next: (err?: Error) => void
) => void;

type EventValidator = (
  socket: SocketWithData,
  ...args: any[]
) => boolean | Promise<boolean>;

// Validation Rules
const validationRules: Record<string, EventValidator> = {
  [ROOM_EVENTS.CREATE]: (socket: SocketWithData, playerName: string) => {
    return typeof playerName === "string" && playerName.trim().length > 0;
  },

  [ROOM_EVENTS.JOIN]: (
    socket: SocketWithData,
    roomId: string,
    playerName: string
  ) => {
    return (
      typeof roomId === "string" &&
      roomId.trim().length > 0 &&
      typeof playerName === "string" &&
      playerName.trim().length > 0
    );
  },

  [GAME_EVENTS.START]: async (socket: SocketWithData, roomId: string) => {
    // Validate room exists and has minimum players
    const room = await getRoomFromDatabase(roomId);
    return Boolean(
      room && room.players.length >= 3 && room.gameState === GameState.WAITING
    );
  },

  [CARD_EVENTS.SUBMIT]: async (
    socket: SocketWithData,
    roomId: string,
    cards: string[]
  ) => {
    const room = await getRoomFromDatabase(roomId);
    if (!socket.data.playerId) return false;
    return Boolean(
      room &&
        room.gameState === GameState.PLAYING &&
        Array.isArray(cards) &&
        cards.length > 0 &&
        !room.submittedCards[socket.data.playerId]
    );
  },

  [JUDGING_EVENTS.SELECT_WINNER]: async (
    socket: SocketWithData,
    roomId: string,
    playerId: string
  ) => {
    const room = await getRoomFromDatabase(roomId);
    if (!socket.data.playerId) return false;
    const isCardCzar = room?.players.find(
      (p) => p.id === socket.data.playerId
    )?.isCardCzar;
    return Boolean(
      room &&
        room.gameState === GameState.JUDGING &&
        isCardCzar &&
        room.submittedCards[playerId]
    );
  },
};

// Helper function to get room from database (implement based on your database setup)
async function getRoomFromDatabase(roomId: string): Promise<Room | null> {
  // Implement database lookup
  return null;
}

// Create middleware for event validation
export const createValidationMiddleware = (
  eventName: string,
  validator: EventValidator
): ValidationMiddleware => {
  return async (socket: SocketWithData, next) => {
    try {
      const args = socket.data.__lastEventArgs || [];
      const isValid = await validator(socket, ...args);

      if (!isValid) {
        return next(new Error(`Invalid ${eventName} event`));
      }

      next();
    } catch (error) {
      next(error as Error);
    }
  };
};

// Apply validation middleware to socket events
export const applyValidationMiddleware = (socket: SocketWithData) => {
  // Store event arguments for validation
  const argsMiddleware: ValidationMiddleware = (socket, next) => {
    const [eventName, ...args] = socket.data.__lastEventArgs || [];
    socket.data.__lastEventArgs = args;
    next();
  };

  // Apply validation rules
  const validationMiddlewares = Object.entries(validationRules).map(
    ([eventName, validator]) => createValidationMiddleware(eventName, validator)
  );

  // Error handling middleware
  const errorMiddleware: ValidationMiddleware = (socket, next) => {
    const [eventName] = socket.data.__lastEventArgs || [];
    if (!validationRules[eventName]) {
      return next(new Error(`Unknown event: ${eventName}`));
    }
    next();
  };

  // Apply all middlewares
  [argsMiddleware, ...validationMiddlewares, errorMiddleware].forEach(
    (middleware) => {
      socket.use((event, next) => middleware(socket as SocketWithData, next));
    }
  );
};
