import { useState, useEffect, useCallback } from "react";
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
  const renderBoardWrapped = useCallback((letters: any = []) => {
    boardManager.renderBoard(cursorManager.position(), letters);
  }, [boardManager, cursorManager]);

  // Game loop tick handler
  const handleGameLoopTick = useCallback((_deltaTime: number, letters: any) => {
    renderBoardWrapped(letters);
  }, [renderBoardWrapped]);

  const gameStatusManager = useGameStatus(handleGameLoopTick);
  const scoreManager = useScore(gameStatusManager);

  // Initial render on mount
  useEffect(() => {
    renderBoardWrapped();
  }, [renderBoardWrapped]);

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
