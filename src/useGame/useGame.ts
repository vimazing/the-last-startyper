import { useState, useEffect, useRef } from "react";
import type { GameManager, GameOptions, KeyLogEntry, FallingLetter, GameMode } from "../types";
import { useBoard } from "../useBoard";
import { useCursor } from "../useCursor";
import { useGameStatus } from "../useGameStatus";
import { useScore } from "../useScore";

export function useGame(
  options?: GameOptions,
  platformHook?: unknown
): GameManager {
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const [gameMode, setGameModeState] = useState<GameMode>(options?.initialGameMode ?? 'letters');
  const gameModeRef = useRef<GameMode>(gameMode);

  const boardManager = useBoard();
  const cursorManager = useCursor();
  const gameStatusManager = useGameStatus(undefined, gameMode);

  // Wrap renderBoard to include player position
  const renderBoardWrapped = (letters: any = []) => {
    boardManager.renderBoard(cursorManager.position(), letters, gameStatusManager.shipState, gameStatusManager.shipExplosionTime, gameModeRef.current);
  };

  // Game loop tick handler
  const handleGameLoopTick = (deltaTime: number, letters: FallingLetter[]) => {
    const playerPos = cursorManager.position();
    gameStatusManager.updatePlayerX(playerPos.x);

    // For words/letters, auto-track to falling letters
    // For sentences/paragraphs, keep ship centered
    if (gameModeRef.current !== 'sentences' && gameModeRef.current !== 'paragraphs') {
      if (letters.length > 0) {
        const letter = letters[0];
        cursorManager.setTargetX(letter.x);
      }
      
      cursorManager.moveTowardTarget(deltaTime);
    } else {
      // Keep ship centered for sentence/paragraph mode
      cursorManager.setTargetX(400); // Canvas center
      cursorManager.moveTowardTarget(deltaTime); // Move to center but don't track letters
    }
    
    renderBoardWrapped(letters);
  };

  // Update gameMode when it changes (without recreating gameStatus state)
  useEffect(() => {
    gameModeRef.current = gameMode;
    gameStatusManager.setGameMode(gameMode);
  }, [gameMode]);

  const changeGameMode = (mode: GameMode) => {
    setGameModeState(mode);
    // Don't quit - just switch modes and let game continue
  };

  // Set the game loop callback
  useEffect(() => {
    gameStatusManager.setGameLoopCallback(handleGameLoopTick);
  }, []);

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
    changeGameMode,
  };

  if (typeof platformHook === 'function') {
    platformHook(gameManager);
  }

  return gameManager;
}

export type UseGameType = ReturnType<typeof useGame>;
