// Room Events
export const ROOM_EVENTS = {
  CREATE: "room:create",
  JOIN: "room:join",
  JOINED: "room:joined",
  UPDATED: "room:updated",
} as const;

// Game Events
export const GAME_EVENTS = {
  START: "game:start",
  STARTED: "game:started",
  ENDED: "game:ended",
} as const;

// Round Events
export const ROUND_EVENTS = {
  START: "round:start",
  STARTED: "round:started",
  ENDED: "round:ended",
} as const;

// Card Events
export const CARD_EVENTS = {
  SUBMIT: "cards:submit",
  SUBMITTED: "cards:submitted",
  DEALT: "cards:dealt",
} as const;

// Judging Events
export const JUDGING_EVENTS = {
  START: "judging:started",
  SELECT_WINNER: "winner:select",
} as const;

// Player Events
export const PLAYER_EVENTS = {
  LEAVE: "player:leave",
} as const;

// Error Events
export const ERROR_EVENTS = {
  ERROR: "error",
} as const;
