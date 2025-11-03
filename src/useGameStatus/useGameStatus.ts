import { useState, useRef, useCallback } from "react";
import type { GameStatus, FallingLetter } from "../types";

const LETTER_SPEED = 100; // pixels per second
const SPAWN_INTERVAL = 1000; // ms between letter spawns

export function useGameStatus(onGameLoopTick?: (deltaTime: number, letters: FallingLetter[]) => void) {
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const gameLoopRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const lettersRef = useRef<FallingLetter[]>([]);
  const lastSpawnRef = useRef<number>(0);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;

    // Spawn new letter if enough time has passed
    if (currentTime - lastSpawnRef.current > SPAWN_INTERVAL) {
      const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      const randomX = Math.random() * 800;
      const newLetter: FallingLetter = {
        id: `${currentTime}-${randomX}`,
        letter: randomLetter,
        x: randomX,
        y: 0,
      };
      lettersRef.current.push(newLetter);
      lastSpawnRef.current = currentTime;
    }

    // Update letter positions
    lettersRef.current.forEach(letter => {
      letter.y += (LETTER_SPEED * deltaTime) / 1000;
    });

    // Remove letters that went off screen
    lettersRef.current = lettersRef.current.filter(letter => letter.y < 600);

    // Call tick callback if provided
    if (onGameLoopTick) {
      onGameLoopTick(deltaTime, lettersRef.current);
    }

    // Continue loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [onGameLoopTick]);

  const startGame = useCallback(() => {
    lastFrameTimeRef.current = performance.now();
    lastSpawnRef.current = performance.now();
    lettersRef.current = [];
    setGameStatus("started");
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const quitGame = useCallback(() => {
    setGameStatus("waiting");
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  return {
    gameStatus,
    setGameStatus,
    startGame,
    quitGame,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
