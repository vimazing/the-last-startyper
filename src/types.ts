import type { RefObject } from 'react';

// ============================================================================
// Core Game Types
// ============================================================================

export type GameStatus = 'waiting' | 'started' | 'game-won' | 'game-over';
export type GamePhase = 'idle' | 'playing';
export type PlayStatus = 'started' | 'game-over' | 'game-won';

export const isPlaying = (status: GameStatus): status is PlayStatus =>
  status === 'started' || status === 'game-over' || status === 'game-won';

export const getGamePhase = (status: GameStatus): GamePhase =>
  status === 'waiting' ? 'idle' : 'playing';

// ============================================================================
// Game-Specific Types (to be defined)
// ============================================================================

// TODO: Define game-specific types here

// ============================================================================
// Input & Key Tracking
// ============================================================================

export type KeyLogEntry = { key: string; timestamp: number };

export type GameOptions = {
  // TODO: Define game options
};

// ============================================================================
// Manager Interfaces - Board
// ============================================================================

export type BoardManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: (cols: number, rows: number) => void;
};

// ============================================================================
// Manager Interfaces - Cursor/Snake
// ============================================================================

export type CursorMode = 'normal';

export type Coord = { row: number; col: number };

export type CursorManager = {
  position: () => Coord;
  mode: () => CursorMode;

  // VIM-style motions (required by Unified API)
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
  moveToStart: () => void;
  moveToEnd: () => void;
  moveToTop: () => void;
  moveToBottom: () => void;
  repeatLastMotion: () => void;
};

// TODO: Define game-specific CursorManager extension if needed

// ============================================================================
// Manager Interfaces - Score
// ============================================================================

export type ScoreManager = {
  timeValue: number;
  totalKeystrokes: number;
};

// ============================================================================
// Manager Interfaces - Game Status
// ============================================================================

export type GameStatusManager = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  quitGame: () => void;
  level: number;
  score: number;
  togglePause: () => void;
};

// ============================================================================
// Manager Interfaces - Key Tracking
// ============================================================================

export type GameKeyManager = {
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];
};

// ============================================================================
// Unified Game Manager - Main Interface
// ============================================================================

export type GameManager = {
  // Required rendering
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: () => void;

  // Required managers
  cursor: CursorManager;
  scoreManager: ScoreManager;

  // Required lifecycle
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  quitGame: () => void;

  // Required key tracking
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];

  // TODO: Add game-specific additions
};

// ============================================================================
// Hook Return Types
// ============================================================================

// Forward declarations for hook return types
// These will be imported from their respective modules
