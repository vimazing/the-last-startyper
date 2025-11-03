import { useState, useRef, useCallback } from "react";
import type { GameStatus, FallingLetter } from "../types";

const LETTER_SPEED = 100; // pixels per second
const SPAWN_INTERVAL = 1000; // ms between letter spawns
const MAX_ACTIVE_LETTERS = 1; // Only one letter on screen at a time
const MARGIN_LEFT = 50; // Safe margin from left edge
const MARGIN_RIGHT = 50; // Safe margin from right edge
const CANVAS_WIDTH = 800;

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

    // Spawn new letter if enough time has passed and no letters active
    if (currentTime - lastSpawnRef.current > SPAWN_INTERVAL && lettersRef.current.length < MAX_ACTIVE_LETTERS) {
      const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      const spawnWidth = CANVAS_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
      const randomX = MARGIN_LEFT + Math.random() * spawnWidth;
      const randomY = Math.random() * 150; // Between 0-150 (top half of screen)
      const newLetter: FallingLetter = {
        id: `${currentTime}-${randomX}`,
        letter: randomLetter,
        x: randomX,
        y: randomY,
        state: 'normal',
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

  const handleTypedLetter = useCallback((typedLetter: string) => {
    if (lettersRef.current.length === 0) return;
    
    const currentLetter = lettersRef.current[0];
    
    if (typedLetter.toUpperCase() === currentLetter.letter) {
      currentLetter.state = 'exploding';
      currentLetter.stateStartTime = performance.now();
      
      setTimeout(() => {
        lettersRef.current = [];
        lastSpawnRef.current = 0;
      }, 300);
    } else {
      currentLetter.state = 'wrong';
      currentLetter.stateStartTime = performance.now();
      
      setTimeout(() => {
        if (currentLetter.state === 'wrong') {
          currentLetter.state = 'normal';
        }
      }, 200);
    }
  }, []);

  return {
    gameStatus,
    setGameStatus,
    startGame,
    quitGame,
    handleTypedLetter,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
