import type { RefObject } from 'react';

// ============================================================================
// Core Game Types
// ============================================================================

export type GameStatus = 'waiting' | 'started' | 'game-won' | 'game-over';
export type GamePhase = 'idle' | 'playing';
export type PlayStatus = 'started' | 'game-over' | 'game-won';
export type GameMode = 'letters' | 'words' | 'sentences' | 'paragraphs';

export const isPlaying = (status: GameStatus): status is PlayStatus =>
  status === 'started' || status === 'game-over' || status === 'game-won';

export const getGamePhase = (status: GameStatus): GamePhase =>
  status === 'waiting' ? 'idle' : 'playing';

// ============================================================================
// Game-Specific Types
// ============================================================================

export type PlayerPosition = { x: number }; // pixel position 0-800

export type LetterState = 'normal' | 'wrong' | 'exploding';
export type ShipState = 'normal' | 'exploding';

export type Laser = {
  id: string;
  startX: number; // Ship position
  startY: number; // Ship Y
  endX: number; // Target position (offset left/right for misses)
  endY: number; // Target Y
  startTime: number;
  duration: number; // How long the laser is visible
  hit: boolean; // True for hits (not implemented yet), false for misses
};

export type FallingLetter = {
  id: string;
  letter: string;
  x: number; // 0-800 pixel position
  y: number; // 0-600 pixel position
  state: LetterState;
  stateStartTime?: number; // For animation timing
  // For word/sentence/paragraph modes
  fullText?: string; // The complete word/sentence/paragraph
  charIndex?: number; // Current character index being typed (0-based)
  // For line transitions in sentences/paragraphs
  lineTransition?: boolean;
  lineTransitionTime?: number;
  // For ship tracking in sentences
  currentCharX?: number; // X position of current character to type
};

// ============================================================================
// Input & Key Tracking
// ============================================================================

export type KeyLogEntry = { key: string; timestamp: number };

export type GameOptions = {
  initialGameMode?: GameMode;
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

export type CursorManager = {
  position: () => PlayerPosition;
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
  score: number;
  correct: number;
  missed: number;
  deaths: number;
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
  shipState: ShipState;
  shipExplosionTime: number;
  updatePlayerX: (x: number) => void;
  handleTypedLetter: (letter: string) => void;
  setGameLoopCallback: (callback: (deltaTime: number, letters: FallingLetter[]) => void) => void;
  setGameMode: (mode: GameMode) => void;
  addCorrect: () => void;
  addMissed: () => void;
  addDeath: () => void;
  score: number;
  correct: number;
  missed: number;
  deaths: number;
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

  // Game-specific
  handleTypedLetter: (letter: string) => void;
  changeGameMode: (mode: GameMode) => void;
};

// ============================================================================
// Hook Return Types
// ============================================================================

// Forward declarations for hook return types
// These will be imported from their respective modules
