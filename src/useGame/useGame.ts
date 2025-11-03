import { useState, useEffect } from "react";
import type { GameManager, GameOptions, KeyLogEntry, FallingLetter } from "../types";
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

  // Wrap renderBoard to include player position
  const renderBoardWrapped = (letters: any = []) => {
    boardManager.renderBoard(cursorManager.position(), letters, gameStatusManager.shipState, gameStatusManager.shipExplosionTime);
  };

  // Game loop tick handler
  const handleGameLoopTick = (deltaTime: number, letters: FallingLetter[]) => {
    const playerPos = cursorManager.position();
    gameStatusManager.updatePlayerX(playerPos.x);

    if (letters.length > 0) {
      const letter = letters[0];
      cursorManager.setTargetX(letter.x);
    }
    
    cursorManager.moveTowardTarget(deltaTime);
    renderBoardWrapped(letters);
  };

  // Set the game loop callback
  useEffect(() => {
    gameStatusManager.setGameLoopCallback(handleGameLoopTick);
  }, [gameStatusManager, cursorManager, boardManager]);

  // Initial render on mount
  useEffect(() => {
    renderBoardWrapped();
  }, []);

  const scoreManager = useScore(gameStatusManager);

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
