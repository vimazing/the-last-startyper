# Unified API Specification

**Version:** 2.0  
**Last Updated:** 2025-01-22

Complete specification for building VIMazing games. This document defines the architecture, requirements, and patterns that all games must follow to maintain consistency while allowing game-specific customization.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [Architecture Overview](#architecture-overview)
3. [Core Requirements](#core-requirements)
4. [Game-Specific Flexibility](#game-specific-flexibility)
5. [Hook Specifications](#hook-specifications)
6. [Type System](#type-system)
7. [Game Instructions Export](#game-instructions-export)
8. [Creating a New Game](#creating-a-new-game)
9. [Integration Guide](#integration-guide)

---

## Philosophy

The Unified API is designed around three core principles:

### 1. Consistent Entry Point
Every game uses `useGame(options?, platformHook?)` as its single entry point. This ensures:
- Predictable initialization across all games
- Easy platform integration
- Consistent developer experience

### 2. Composable Architecture
Games are built from independent, composable hooks that manage distinct concerns:
- **useBoard** - Level/puzzle generation and rendering
- **useCursor** - Player input and interaction
- **useScore** - Metrics and performance tracking
- **useGameStatus** - Game lifecycle state machine

### 3. Freedom Within Constraints
The API defines WHAT must be exposed, not HOW it works internally. Games have complete freedom in:
- Scoring algorithms
- Rendering strategies
- Internal state management
- Additional game-specific features

---

## Architecture Overview

### The Unified Pattern

```
useGame(options, platformHook?)
  ├─ useBoard()          → Game-specific board/level management
  ├─ useCursor()         → Player input and interaction
  ├─ useGameStatus()     → Lifecycle state machine
  └─ useScore()          → Metrics and scoring (game-specific)
```

### Data Flow

```
User Input
  ↓
useCursor (validates, processes)
  ↓
useBoard (updates state)
  ↓
useScore (tracks metrics)
  ↓
useGameStatus (manages lifecycle)
  ↓
GameManager (unified interface)
  ↓
Platform/UI
```

---

## Core Requirements

These elements MUST be present in every VIMazing game:

### 1. Entry Point

```typescript
export function useGame(
  options: GameOptions,
  platformHook?: unknown
): GameManager
```

**Required:**
- Accept options object (game-specific structure)
- Support optional platform hook function
- Return GameManager interface

**Example:**
```typescript
// vim-sudoku
useGame({ difficulty: 'easy', timeLimit: 600 })

// vim-maze
useGame({ rows: 24, cols: 32, timeLimit: 600 })
```

### 2. GameManager Interface

Every game must return a GameManager with these minimum fields:

```typescript
type GameManager = {
  // Required Core
  containerRef: RefObject<HTMLDivElement | null>;  // DOM mounting point
  renderBoard: () => void;                          // Force re-render
  
  // Required State Management
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  quitGame: () => void;
  
  // Required Managers
  cursor: CursorManager;      // Player interaction
  scoreManager: ScoreManager; // Metrics and scoring
  
  // Required Input Tracking
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];
  
  // Optional: Game-specific additions
  // [additional fields as needed]
};
```

### 3. Game Status State Machine

All games must implement this lifecycle:

```
waiting → started → game-won
              ↓
           game-over
```

**Required States:**
- `waiting` - Initial state, game not started
- `started` - Game in progress
- `game-won` - Successfully completed
- `game-over` - Failed to complete

**Optional States:**
- `paused` - Temporarily stopped
- Game-specific states (e.g., vim-maze's `has-key`)

### 4. Cursor/Input Manager

```typescript
type CursorManager = {
  position: () => Coord;        // Current position
  mode: () => CursorMode;       // Current mode
  
  // Movement (VIM-style)
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
  
  // Anchors (VIM-style)
  moveToStart: () => void;      // ^ or 0
  moveToEnd: () => void;        // $
  moveToTop: () => void;        // gg
  moveToBottom: () => void;     // G
  
  // Repeat (VIM-style)
  repeatLastMotion: () => void; // .
  
  // Optional: Game-specific methods
  // [additional methods as needed]
};
```

### 5. Score Manager (Minimal Interface)

```typescript
type ScoreManager = {
  // Required Timing
  timeValue: number;            // Current time in milliseconds
  
  // Required Metrics
  totalKeystrokes: number;      // Total keys pressed
  
  // Required Result
  finalScore: number | null;    // 0-1000 (null until game-won)
  
  // Optional: Game-specific metrics
  // [additional fields as needed]
};
```

**Scoring Requirements:**
- Score range: 0-1000 (capped)
- Score calculated on game-won
- Based on time and keystrokes (minimum)
- Can include game-specific penalties/bonuses

---

## Game-Specific Flexibility

These elements CAN vary between games:

### 1. GameOptions Structure

Each game defines its own options:

```typescript
// vim-sudoku
type GameOptions = {
  difficulty?: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  removedCells?: number;
};

// vim-maze
type GameOptions = {
  rows: number;
  cols: number;
  timeLimit?: number;
};

// vim-snake (hypothetical)
type GameOptions = {
  boardSize?: number;
  speed?: 'slow' | 'medium' | 'fast';
  obstacles?: boolean;
};
```

**Recommended Defaults:**
- Always provide sensible defaults
- Make most options optional
- Use consistent naming (e.g., `timeLimit` always in seconds)

### 2. Scoring Implementation

Complete freedom in how scoring works internally:

**vim-sudoku approach:**
```typescript
// Simple formula: time + keystrokes + hints
const baseScore = 1000 - timePenalty - keystrokePenalty - hintPenalty;
const finalScore = min(1000, baseScore * difficultyMultiplier);
```

**vim-maze approach:**
```typescript
// Size-based: time + keystrokes × maze size
const baseScore = 1000 - timePenalty - keystrokePenalty;
const sizeMultiplier = max(1.0, (rows × cols) / 500);
const finalScore = min(1000, baseScore × sizeMultiplier);
```

**vim-snake approach (hypothetical):**
```typescript
// Performance-based: length achieved vs time
const lengthScore = (snakeLength / maxLength) × 500;
const timeBonus = (timeRemaining / timeLimit) × 500;
const finalScore = min(1000, lengthScore + timeBonus);
```

### 3. Rendering Strategy

Games choose their own rendering approach:

**DOM Rendering (vim-maze, vim-sudoku):**
```typescript
class GameRenderer {
  constructor(container: HTMLElement) { }
  render(data: GameData): void {
    // Direct DOM manipulation
    container.innerHTML = generateHTML(data);
  }
}
```

**React Rendering (hypothetical):**
```typescript
function GameBoard({ boardState }: Props) {
  return (
    <div>
      {boardState.map(cell => <Cell key={cell.id} {...cell} />)}
    </div>
  );
}
```

**Canvas Rendering (hypothetical):**
```typescript
class CanvasRenderer {
  render(ctx: CanvasRenderingContext2D, gameState: State): void {
    // Direct canvas drawing
  }
}
```

### 4. Internal State Management

Games manage state however they need:

**vim-sudoku:**
- Board as 81-character string
- Initial board (immutable)
- Solution board (for validation)
- No complex animation state

**vim-maze:**
- 2D array of maze cells
- Hero position tracking
- Animation state for multi-step movements
- Distance calculations for pathfinding

**vim-snake (hypothetical):**
- Snake segments array
- Food position
- Direction queue
- Collision detection

### 5. Additional Features

Games can add unique features:

**vim-sudoku specific:**
- Hint system (Shift+H)
- Edit modes (i/r/c for different entry styles)
- Cell validation (given vs user-entered)

**vim-maze specific:**
- Key pickup mechanic
- Wall collision detection
- Entrance/exit system
- Distance tracking

**vim-snake specific (hypothetical):**
- Power-ups
- Speed changes
- Obstacle generation
- Multiplayer

---

## Hook Specifications

### useBoard

**Purpose:** Manage game board/level state and rendering.

**Flexibility:** Complete freedom in implementation.

**Minimum Interface:**
```typescript
type BoardManager = {
  containerRef: RefObject<HTMLDivElement | null>;
  renderBoard: () => void;
  
  // Game-specific additions allowed
};
```

**Common Patterns:**
```typescript
// Pattern 1: Generator + Renderer classes
const generator = new GameGenerator(options);
const renderer = new GameRenderer(container);
generator.generate();
renderer.render(generator.getData());

// Pattern 2: Direct state management
const [board, setBoard] = useState(generateInitial());
renderBoard(board);

// Pattern 3: Canvas-based
const canvasRef = useRef<HTMLCanvasElement>(null);
drawBoard(canvasRef.current, boardState);
```

### useCursor

**Purpose:** Handle player input and interaction.

**Required:** VIM-style navigation (hjkl, counts, anchors, repeat).

**Minimum Interface:**
```typescript
type CursorManager = {
  position: () => Coord;
  mode: () => CursorMode;
  
  // VIM motions (required)
  moveLeft: (count?: number) => void;
  moveRight: (count?: number) => void;
  moveUp: (count?: number) => void;
  moveDown: (count?: number) => void;
  moveToStart: () => void;
  moveToEnd: () => void;
  moveToTop: () => void;
  moveToBottom: () => void;
  repeatLastMotion: () => void;
  
  // Game-specific additions allowed
};
```

**Mode System:**
All games use at minimum:
- `normal` - Navigation mode
- `edit` - Interaction mode (if applicable)

Games can add modes as needed (e.g., sudoku's distinction between i/r/c entry modes).

### useScore

**Purpose:** Track metrics and calculate final score.

**Flexibility:** Almost complete freedom.

**Minimum Interface:**
```typescript
type ScoreManager = {
  timeValue: number;
  totalKeystrokes: number;
  finalScore: number | null;
  
  // Game-specific metrics allowed
};
```

**Requirements:**
- Track time in milliseconds
- Track total keystrokes
- Calculate score 0-1000 (capped)
- Set finalScore only on game-won

**Optional but Recommended:**
- Game-over conditions based on time/performance
- Additional metrics for display
- Difficulty multipliers

### useGameStatus

**Purpose:** Manage game lifecycle state machine.

**Required States:**
```typescript
type GameStatus = 
  | 'waiting'
  | 'started'
  | 'game-won'
  | 'game-over'
  | ...  // Optional game-specific states
```

**Minimum Interface:**
```typescript
type GameStatusManager = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
  startGame: () => void;
  quitGame: () => void;
  
  // Optional: togglePause, reset, etc.
};
```

---

## Type System

### Required Core Types

```typescript
// Coordinates (all games use this)
type Coord = { row: number; col: number };

// Key logging (all games track this)
type KeyLogEntry = { key: string; timestamp: number };

// Game status (required states)
type GameStatus = 'waiting' | 'started' | 'game-won' | 'game-over' | ...;

// Cursor mode (at minimum)
type CursorMode = 'normal' | 'edit' | ...;
```

### Type Organization

Recommended structure:
```
src/
├── types.ts              # Game-specific exports + core types
├── useBoard/
│   └── types.ts          # Board-specific types
├── useCursor/
│   └── types.ts          # Cursor-specific types
├── useGameStatus/
│   └── types.ts          # Status-specific types
└── useScore/
    └── types.ts          # Score-specific types
```

**Main types.ts pattern:**
```typescript
// Re-export all module types
export * from './useBoard/types';
export * from './useCursor/types';
export * from './useGameStatus/types';
export * from './useScore/types';

// Game-specific types
export type GameOptions = { /* game-specific */ };
export type GameManager = { /* unified interface */ };
```

---

## Game Instructions Export

### Required Export

All games must export a `gameInfo` object containing structured documentation for platform consumption.

**File:** `src/gameInfo.ts`

```typescript
export const gameInfo = {
  name: string;                    // Game name
  description: string;             // Brief description
  
  controls: {
    navigation: Array<{ keys: string; description: string }>;
    // Additional control sections as needed
    game: Array<{ keys: string; description: string }>;
  };
  
  rules: {
    // Game-specific rule sections
  };
  
  scoring: {
    formula: string;
    range: string;
    penalties: Array<{ factor: string; formula: string; example: string }>;
    examples: Array<any>;
  };
  
  gameOver: {
    conditions: Array<{ type: string; trigger: string; message: string }>;
  };
  
  objective: string;               // How to win (one sentence)
  winCondition: string;            // Specific win trigger
} as const;

export type GameInfo = typeof gameInfo;
```

**Export from main index:**
```typescript
// src/index.ts
export { gameInfo } from './gameInfo';
export type { GameInfo } from './gameInfo';
```

### Purpose

The `gameInfo` export allows platforms to:
- Render in-game help screens
- Generate tutorials
- Display control references
- Show scoring breakdowns
- Explain game mechanics

Without needing to parse documentation or README files.

### Usage by Platforms

```typescript
import { gameInfo } from '@vimazing/your-game';

// Render controls
gameInfo.controls.navigation.forEach(control => {
  renderControl(control.keys, control.description);
});

// Show scoring formula
displayScoringInfo(gameInfo.scoring.formula, gameInfo.scoring.penalties);

// Display game-over conditions
gameInfo.gameOver.conditions.forEach(condition => {
  showCondition(condition.type, condition.trigger);
});
```

### Required Sections

**Minimum structure:**
- `name` - Game name
- `description` - Brief description
- `controls.navigation` - VIM motion controls (required)
- `controls.game` - Game lifecycle controls (space, q, p)
- `rules` - At least one rule section
- `scoring.formula` - Score calculation
- `scoring.range` - Score bounds (always "0 - 1000 points")
- `gameOver.conditions` - At least one condition
- `objective` - Win goal
- `winCondition` - Specific trigger

**Optional sections:**
- Additional control groups (editing, actions, etc.)
- Visual feedback explanations
- Hints/power-ups/special mechanics
- Examples and breakdowns

### Examples

See implementations:
- **vim-sudoku/src/gameInfo.ts** - Complex puzzle game with modes, hints
- **vim-maze/src/gameInfo.ts** - Navigation game with maze mechanics
- **vimazing-game-skeleton/src/gameInfo.ts** - Template with TODOs

---

## Creating a New Game

### Step 1: Define Your Game

Answer these questions:
- What is the game mechanic?
- What does the board/level look like?
- How does the player interact?
- What constitutes winning/losing?
- How should scoring work?

### Step 2: Design GameOptions

```typescript
export type GameOptions = {
  // Required configuration
  [key: string]: any;
  
  // Recommended: timeLimit
  timeLimit?: number;  // Seconds
};
```

### Step 3: Implement Core Hooks

**useBoard:**
```typescript
export function useBoard(/* game-specific params */) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  function renderBoard() {
    // Your rendering logic
  }
  
  return {
    containerRef,
    renderBoard,
    // Additional methods
  };
}
```

**useCursor:**
```typescript
export function useCursor(/* dependencies */) {
  const [position, setPosition] = useState<Coord>({ row: 0, col: 0 });
  const [mode, setMode] = useState<CursorMode>('normal');
  
  // Implement VIM motions
  function moveLeft(count = 1) { /* ... */ }
  function moveRight(count = 1) { /* ... */ }
  // ... etc
  
  return {
    position: () => position,
    mode: () => mode,
    moveLeft,
    moveRight,
    // ... etc
  };
}
```

**useScore:**
```typescript
export function useScore(/* dependencies */) {
  const [timeValue, setTimeValue] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const totalKeystrokes = keyLog.length;
  
  // Calculate score on game-won
  useEffect(() => {
    if (gameStatus === 'game-won') {
      const score = calculateScore(timeValue, totalKeystrokes);
      setFinalScore(Math.min(1000, Math.max(0, score)));
    }
  }, [gameStatus]);
  
  return {
    timeValue,
    totalKeystrokes,
    finalScore,
    // Additional metrics
  };
}
```

**useGameStatus:**
```typescript
export function useGameStatus() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');
  
  function startGame() {
    setGameStatus('started');
  }
  
  function quitGame() {
    setGameStatus('waiting');
  }
  
  return {
    gameStatus,
    setGameStatus,
    startGame,
    quitGame,
  };
}
```

### Step 4: Compose in useGame

```typescript
export function useGame(
  options: GameOptions,
  platformHook?: unknown
): GameManager {
  const board = useBoard(/* options */);
  const gameStatusManager = useGameStatus();
  const cursor = useCursor(/* dependencies */);
  const scoreManager = useScore(/* dependencies */);
  
  const gameManager: GameManager = {
    containerRef: board.containerRef,
    renderBoard: board.renderBoard,
    gameStatus: gameStatusManager.gameStatus,
    setGameStatus: gameStatusManager.setGameStatus,
    startGame: gameStatusManager.startGame,
    quitGame: gameStatusManager.quitGame,
    cursor,
    scoreManager,
    keyLog: [],  // Implement key tracking
    clearKeyLog: () => {},
    getKeyLog: () => [],
  };
  
  if (typeof platformHook === 'function') {
    platformHook(gameManager);
  }
  
  return gameManager;
}
```

### Step 5: Export Public API

```typescript
// src/index.ts
export { useGame } from './useGame';
export type { GameManager, GameOptions } from './types';
export type { CursorManager } from './useCursor/types';
export type { ScoreManager } from './useScore/types';
```

---

## Integration Guide

### For Game Consumers

**Basic Usage:**
```typescript
import { useGame } from '@vimazing/your-game';
import '@vimazing/your-game/game.css';

function GameComponent() {
  const game = useGame(options);
  
  return (
    <div>
      <div ref={game.containerRef} />
      <button onClick={game.startGame}>Start</button>
      <p>Status: {game.gameStatus}</p>
      <p>Score: {game.scoreManager.finalScore || 0} / 1000</p>
    </div>
  );
}
```

**With Platform Hook:**
```typescript
function platformHook(gameManager: GameManager) {
  // Analytics
  trackGameStart(gameManager.gameStatus);
  
  // Custom keybindings
  window.addEventListener('keydown', (e) => {
    if (e.key === 'h') trackHelp();
  });
  
  // Monitor completion
  const interval = setInterval(() => {
    if (gameManager.gameStatus === 'game-won') {
      trackVictory(gameManager.scoreManager.finalScore);
      clearInterval(interval);
    }
  }, 100);
}

const game = useGame(options, platformHook);
```

### For Platform Developers

All games expose the same core interface:
```typescript
interface UnifiedGame {
  useGame(options: any, platformHook?: Function): GameManager;
}
```

**Integration checklist:**
- ✅ Game exposes `useGame` entry point
- ✅ Returns `GameManager` with required fields
- ✅ Accepts optional platform hook
- ✅ Implements core game status states
- ✅ Provides VIM-style cursor navigation
- ✅ Scores on 0-1000 scale

---

## Version History

**v2.0** (2025-01-22)
- Rewritten for game-agnostic specification
- Clarified requirements vs flexibility
- Added comprehensive creation guide
- Removed game-specific implementation details
- Simplified scoring requirements

**v1.0** (2024)
- Initial unified API documentation
- Based on vim-maze implementation

---

## License

MIT © VIMazing Project
