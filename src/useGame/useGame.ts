import { useState, useEffect } from "react";
import type { GameManager, GameOptions, KeyLogEntry } from "../types";
import { useBoard } from "../useBoard";
import { useCursor } from "../useCursor";
import { useGameStatus } from "../useGameStatus";
import { useScore } from "../useScore";

export function useGame(
  _options?: GameOptions,
  platformHook?: unknown
): GameManager {
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);

  const boardManager = useBoard();
  const cursorManager = useCursor();

  // Wrap renderBoard to include player position
  const renderBoardWrapped = (letters: any = []) => {
    boardManager.renderBoard(cursorManager.position(), letters);
  };

  // Game loop tick handler
  const handleGameLoopTick = (deltaTime: number, letters: any) => {
    // If a letter just spawned, move ship to it
    if (letters.length > 0) {
      const letter = letters[0];
      console.log('Setting target to:', letter.x);
      cursorManager.setTargetX(letter.x);
    }
    
    // Move spaceship towards target
    cursorManager.moveTowardTarget(deltaTime);
    
    renderBoardWrapped(letters);
  };

  const gameStatusManager = useGameStatus(handleGameLoopTick);
  const scoreManager = useScore(gameStatusManager);

  // Initial render on mount
  useEffect(() => {
    renderBoardWrapped();
  }, []);

  const gameManager: GameManager = {
    containerRef: boardManager.containerRef,
    renderBoard: renderBoardWrapped,
    gameStatus: gameStatusManager.gameStatus,
    setGameStatus: gameStatusManager.setGameStatus,
    startGame: gameStatusManager.startGame,
    quitGame: gameStatusManager.quitGame,
    cursor: cursorManager,
    scoreManager,
    keyLog,
    clearKeyLog: () => setKeyLog([]),
    getKeyLog: () => [...keyLog],
  };

  if (typeof platformHook === 'function') {
    platformHook(gameManager);
  }

  return gameManager;
}

export type UseGameType = ReturnType<typeof useGame>;
