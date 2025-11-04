# Typing Chud

A fast-paced typing game built with React and TypeScript. Type falling text before it reaches your ship!

## Features

- **Four Game Modes**: Letters, Words, Sentences, and Paragraphs
- **Dynamic Mode Switching**: Change game modes at runtime for endless variety
- **Real-time Score Tracking**: Track correct/incorrect keystrokes and deaths
- **Visual Effects**: Laser hits, ship explosions, and perspective effects
- **Platform Integration**: Customize speed, content, and mode switching via options
- **Independent Content Tracking**: Each mode tracks completion separately

## Installation

```bash
npm install @vimazing/typing-chud
```

## Quick Start

```typescript
import { useGame } from '@vimazing/typing-chud';
import '@vimazing/typing-chud/game.css';

function App() {
  const game = useGame({
    gameMode: 'letters',
    downwardSpeed: 100,
  });

  return (
    <div>
      <div ref={game.containerRef} />
      <button onClick={game.startGame}>Start</button>
      <p>Score: {game.scoreManager.score}</p>
    </div>
  );
}
```

## Game Modes

### Letters
Single characters fall one at a time. Type each letter to destroy it.

### Words
Full words fall from the top. Type each character of the word sequentially.

### Sentences
Multi-line sentences with perspective effect. Continue typing through line breaks.

### Paragraphs
4-line paragraphs with advanced perspective and smooth line transitions.

## API

### useGame(options?, platformHook?)

Main hook for initializing the game.

**Options:**
```typescript
type GameOptions = {
  gameMode?: 'letters' | 'words' | 'sentences' | 'paragraphs';
  downwardSpeed?: number; // pixels per second
  boardDimensions?: [number, number];
  wordList?: string[];
}
```

**Returns:**
```typescript
type GameManager = {
  containerRef: RefObject<HTMLDivElement>;
  renderBoard: () => void;
  gameStatus: 'waiting' | 'started' | 'game-over' | 'game-won';
  setGameStatus: (status) => void;
  startGame: () => void;
  quitGame: () => void;
  cursor: CursorManager;
  scoreManager: ScoreManager;
  keyLog: KeyLogEntry[];
  clearKeyLog: () => void;
  getKeyLog: () => KeyLogEntry[];
  handleTypedLetter: (letter: string) => void;
  changeGameMode: (options: GameOptions) => void;
}
```

### Platform Hook

Pass a function to `useGame` to receive game events:

```typescript
const platformHook = (gameManager: GameManager) => {
  // Analytics, custom bindings, monitoring, etc.
  window.addEventListener('keydown', (e) => {
    if (e.key === 'h') showHelp();
  });
};

const game = useGame(options, platformHook);
```

## Gameplay Controls

- **Space**: Start/Restart game
- **Esc**: Quit game
- **A-Z, 0-9, . , ! ?**: Type characters to destroy falling text

## Score Tracking

Access detailed metrics via `scoreManager`:

```typescript
game.scoreManager.score         // Current score
game.scoreManager.correct       // Correct keystrokes
game.scoreManager.missed        // Incorrect keystrokes
game.scoreManager.deaths        // Deaths (text hit ship)
game.scoreManager.currentCount  // Count for current mode
game.scoreManager.lettersCompleted
game.scoreManager.wordsCompleted
game.scoreManager.sentencesCompleted
game.scoreManager.paragraphsCompleted
```

## Mode Switching

Request mode changes at runtime:

```typescript
// Platform can request a mode change anytime
game.changeGameMode({ gameMode: 'words', downwardSpeed: 75 });

// Mode change applies after current text completes
// Maintains independent completion counts per mode
```

## Example

See the `/example` directory for a full implementation with:
- Test state machines
- Score-based and count-based transitions
- Custom platform hook
- Complete UI

## License

MIT

## Author

André Padez - VIMazing Project
