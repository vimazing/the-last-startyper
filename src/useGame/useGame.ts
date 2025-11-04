import { useState, useEffect, useRef } from "react";
import type { GameManager, GameOptions, KeyLogEntry, FallingLetter, GameMode, Laser, ShipState } from "../types";
import { useBoard } from "../useBoard";
import { useCursor } from "../useCursor";
import { useGameStatus } from "../useGameStatus";
import { useScore } from "../useScore";

export function useGame(
  initialOptions?: GameOptions,
  platformHook?: unknown
): GameManager {
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const [options, setOptions] = useState<GameOptions>(initialOptions ?? {});
  const gameMode = options.gameMode ?? 'letters';
  const gameModeRef = useRef<GameMode>(gameMode);

  const boardManager = useBoard();
  const cursorManager = useCursor();
  const gameStatusManager = useGameStatus(undefined, options);

  // Wrap renderBoard to include player position and lasers
  const renderBoardWrapped = (letters: any = [], lasers: Laser[] = [], shipState: ShipState = 'normal', shipExplosionTime: number = 0) => {
    boardManager.renderBoard(cursorManager.position(), letters, shipState, shipExplosionTime, gameModeRef.current, lasers);
  };

  // Game loop tick handler
  const handleGameLoopTick = (deltaTime: number, letters: FallingLetter[], lasers: Laser[] = [], shipState: ShipState = 'normal', shipExplosionTime: number = 0) => {
    const playerPos = cursorManager.position();
    gameStatusManager.updatePlayerX(playerPos.x);

    // Handle ship tracking based on game mode
    if (gameModeRef.current === 'letters') {
      // Letters mode: track to letter position (original behavior)
      if (letters.length > 0) {
        const letter = letters[0];
        cursorManager.setTargetX(letter.x);
      }
      
      cursorManager.moveTowardTarget(deltaTime);
    } else if (gameModeRef.current === 'words') {
      // Words mode: track to current character within word
      if (letters.length > 0) {
        const letter = letters[0];
        // Use stored character position or fall back to word center
        const targetX = letter.currentCharX || letter.x;
        cursorManager.setTargetX(targetX);
      }
      
      cursorManager.moveTowardTarget(deltaTime);
    } else {
      // For sentences: track to current character position
      if (letters.length > 0) {
        const letter = letters[0];
        // Use the stored character position or default to center
        const targetX = letter.currentCharX || 400;
        cursorManager.setTargetX(targetX);
      } else {
        cursorManager.setTargetX(400); // Default to center when no letters
      }
      cursorManager.moveTowardTarget(deltaTime);
    }
    
    renderBoardWrapped(letters, lasers, shipState, shipExplosionTime);
  };

  // Update gameMode when it changes (without recreating gameStatus state)
  useEffect(() => {
    gameModeRef.current = gameMode;
    gameStatusManager.setGameMode(gameMode);
  }, [gameMode]);

  const changeGameMode = (newOptions: GameOptions) => {
    setOptions(newOptions);
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
