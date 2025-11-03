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
    if (letters.length > 0) {
      const letter = letters[0];
      cursorManager.setTargetX(letter.x);
    }
    
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
    handleTypedLetter: gameStatusManager.handleTypedLetter,
  };

  if (typeof platformHook === 'function') {
    platformHook(gameManager);
  }

  return gameManager;
}

export type UseGameType = ReturnType<typeof useGame>;
