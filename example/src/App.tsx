import { useState, useEffect } from "react";
import { useGame, type GameMode } from "@vimazing/typing-chud";
import "@vimazing/typing-chud/game.css";
import { useKeyBindings } from "./useKeyBindings";

function App() {
  const [gameMode, setGameMode] = useState<GameMode>("letters");
  const gameManager = useGame({ gameMode }, useKeyBindings);
  const { containerRef, gameStatus, scoreManager } = gameManager;

  useEffect(() => {
    if (scoreManager.score === 5 && gameMode === "letters") {
      setGameMode("words");
      gameManager.changeGameMode({ gameMode: "words" });
    }
  }, [scoreManager.score, gameMode, gameManager]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative mx-auto my-4 w-fit space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-center">Typing Chud</h1>
        <div className="flex gap-2 justify-center text-sm">
          {(['letters', 'words', 'sentences', 'paragraphs'] as const).map((mode) => (
            <button
              key={mode}
              onClick={(e) => {
                setGameMode(mode);
                gameManager.changeGameMode({ gameMode: mode });
                e.currentTarget.blur(); // Remove focus from button
              }}
              className={`px-3 py-1 rounded capitalize font-medium transition ${gameMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-foreground hover:bg-blue-500 hover:text-white'
                }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 justify-center text-sm font-mono">
        <div className="px-3 py-1 bg-muted rounded">
          <div className="text-xs text-muted-foreground">Time</div>
          <div className="font-bold">{formatTime(scoreManager.timeValue)}</div>
        </div>
        <div className="px-3 py-1 bg-muted rounded">
          <div className="text-xs text-muted-foreground">Score</div>
          <div className="font-bold">{scoreManager.score}</div>
        </div>
        <div className="px-3 py-1 bg-green-900 rounded">
          <div className="text-xs text-green-200">Correct</div>
          <div className="font-bold text-green-100">{scoreManager.correct}</div>
        </div>
        <div className="px-3 py-1 bg-yellow-900 rounded">
          <div className="text-xs text-yellow-200">Missed</div>
          <div className="font-bold text-yellow-100">{scoreManager.missed}</div>
        </div>
        <div className="px-3 py-1 bg-red-900 rounded">
          <div className="text-xs text-red-200">Deaths</div>
          <div className="font-bold text-red-100">{scoreManager.deaths}</div>
        </div>
        <div className="px-3 py-1 bg-muted rounded">
          <div className="text-xs text-muted-foreground">Keystrokes</div>
          <div className="font-bold">{scoreManager.totalKeystrokes}</div>
        </div>
      </div>

      <div ref={containerRef} className="relative" />

      <div className="text-center text-sm text-muted-foreground">
        {gameStatus === "waiting" && <p>Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to start</p>}
        {gameStatus === "started" && <p>Type letters • Press <kbd className="px-2 py-1 bg-muted rounded">esc</kbd> to quit</p>}
        {gameStatus === "game-over" && <p>Game Over! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to restart</p>}
        {gameStatus === "game-won" && <p>You Won! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to restart</p>}
      </div>
    </div>
  );
}

export default App;
