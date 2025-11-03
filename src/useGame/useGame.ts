import { useState } from "react";
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
  const gameStatusManager = useGameStatus();
  const scoreManager = useScore(gameStatusManager);

  const gameManager: GameManager = {
    containerRef: boardManager.containerRef,
    renderBoard: boardManager.renderBoard,
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
