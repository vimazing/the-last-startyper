import { useState, useRef, useCallback } from "react";
import type { GameStatus, FallingLetter, ShipState } from "../types";

const LETTER_SPEED = 100; // pixels per second
const SPAWN_INTERVAL = 1000; // ms between letter spawns
const MAX_ACTIVE_LETTERS = 1; // Only one letter on screen at a time
const MARGIN_LEFT = 50; // Safe margin from left edge
const MARGIN_RIGHT = 50; // Safe margin from right edge
const CANVAS_WIDTH = 800;
const SPACESHIP_Y = 600 - 40; // Position of the ship on canvas
const COLLISION_THRESHOLD = 30; // Distance to trigger collision

export function useGameStatus(onGameLoopTick?: (deltaTime: number, letters: FallingLetter[]) => void) {
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [shipState, setShipState] = useState<ShipState>("normal");
  const [shipExplosionTime, setShipExplosionTime] = useState(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const lettersRef = useRef<FallingLetter[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const playerXRef = useRef<number>(CANVAS_WIDTH / 2);
  const onGameLoopTickRef = useRef(onGameLoopTick);

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

    // Check for collisions with ship
    lettersRef.current.forEach(letter => {
      if (letter.state === 'normal') {
        const letterY = letter.y;
        const distanceFromShip = Math.abs(letterY - SPACESHIP_Y);
        const horizontalDistance = Math.abs(letter.x - playerXRef.current);

        if (distanceFromShip < COLLISION_THRESHOLD && horizontalDistance < 30) {
          // Collision detected
          letter.state = 'exploding';
          letter.stateStartTime = currentTime;
          setShipState('exploding');
          setShipExplosionTime(performance.now());

          // Clear letters and reset spawn timer after explosion animation
          setTimeout(() => {
            lettersRef.current = [];
            lastSpawnRef.current = performance.now();
            setShipState('normal');
          }, 300);
        }
      }
    });

    // Remove letters that went off screen
    lettersRef.current = lettersRef.current.filter(letter => letter.y < 600);

    // Call tick callback if provided
    if (onGameLoopTickRef.current) {
      onGameLoopTickRef.current(deltaTime, lettersRef.current);
    }

    // Continue loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

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

  const updatePlayerX = useCallback((x: number) => {
    playerXRef.current = x;
  }, []);

  const setGameLoopCallback = useCallback((callback: (deltaTime: number, letters: FallingLetter[]) => void) => {
    onGameLoopTickRef.current = callback;
  }, []);

  return {
    gameStatus,
    setGameStatus,
    startGame,
    quitGame,
    handleTypedLetter,
    shipState,
    shipExplosionTime,
    updatePlayerX,
    setGameLoopCallback,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
