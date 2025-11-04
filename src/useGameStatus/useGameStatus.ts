import { useState, useRef } from "react";
import type { GameStatus, FallingLetter, ShipState, GameMode } from "../types";
import { getRandomWord } from "../wordLists";

const LETTER_SPEEDS: Record<GameMode, number> = {
  letters: 100,
  words: 50,
  sentences: 25,
  paragraphs: 50,
};
const SPAWN_INTERVAL = 1000; // ms between letter spawns
const MAX_ACTIVE_LETTERS = 1; // Only one letter on screen at a time
const MARGIN_LEFT = 50; // Safe margin from left edge
const MARGIN_RIGHT = 50; // Safe margin from right edge
const CANVAS_WIDTH = 800;
const SPACESHIP_Y = 600 - 40; // Position of the ship on canvas
const COLLISION_THRESHOLD = 30; // Distance to trigger collision

export function useGameStatus(onGameLoopTick?: (deltaTime: number, letters: FallingLetter[]) => void, gameMode: GameMode = 'letters') {
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");
  const [shipState, setShipState] = useState<ShipState>("normal");
  const [shipExplosionTime, setShipExplosionTime] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [missed, setMissed] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const lettersRef = useRef<FallingLetter[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const playerXRef = useRef<number>(CANVAS_WIDTH / 2);
  const onGameLoopTickRef = useRef(onGameLoopTick);
  const gameModeRef = useRef<GameMode>(gameMode);

  // Game loop
  const gameLoop = (currentTime: number) => {
    const deltaTime = currentTime - lastFrameTimeRef.current;
    lastFrameTimeRef.current = currentTime;

    // Spawn new letter/word if enough time has passed and no letters active
    if (currentTime - lastSpawnRef.current > SPAWN_INTERVAL && lettersRef.current.length < MAX_ACTIVE_LETTERS) {
      const fullText = getRandomWord(gameModeRef.current);
      const firstChar = fullText[0].toUpperCase();
      const spawnWidth = CANVAS_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
      const randomX = MARGIN_LEFT + Math.random() * spawnWidth;
      const randomY = Math.random() * 150; // Between 0-150 (top half of screen)
      const newLetter: FallingLetter = {
        id: `${currentTime}-${randomX}`,
        letter: firstChar,
        fullText: fullText.toUpperCase(),
        charIndex: 0,
        x: randomX,
        y: randomY,
        state: 'normal',
      };
      lettersRef.current.push(newLetter);
      lastSpawnRef.current = currentTime;
    }

    // Update letter positions
    const speed = LETTER_SPEEDS[gameModeRef.current];
    lettersRef.current.forEach(letter => {
      letter.y += (speed * deltaTime) / 1000;
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
          setDeaths(prev => prev + 1);

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
  };

  const startGame = () => {
    lastFrameTimeRef.current = performance.now();
    lastSpawnRef.current = performance.now();
    lettersRef.current = [];
    setScore(0);
    setCorrect(0);
    setMissed(0);
    setDeaths(0);
    setGameStatus("started");
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const quitGame = () => {
    setGameStatus("waiting");
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };

  const handleTypedLetter = (typedLetter: string) => {
    if (lettersRef.current.length === 0) return;
    
    const currentLetter = lettersRef.current[0];
    const expectedChar = currentLetter.letter;
    const isCorrect = typedLetter.toUpperCase() === expectedChar;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setCorrect(prev => prev + 1);

      const charIndex = (currentLetter.charIndex ?? 0) + 1;
      const fullText = currentLetter.fullText ?? currentLetter.letter;

      // Check if word is complete
      if (charIndex >= fullText.length) {
        // Word complete - explode and clear
        currentLetter.state = 'exploding';
        currentLetter.stateStartTime = performance.now();
        
        setTimeout(() => {
          lettersRef.current = [];
          lastSpawnRef.current = 0;
        }, 300);
      } else {
        // More characters to type - advance to next character
        currentLetter.charIndex = charIndex;
        currentLetter.letter = fullText[charIndex];
      }
    } else {
      currentLetter.state = 'wrong';
      currentLetter.stateStartTime = performance.now();
      setScore(prev => Math.max(0, prev - 1));
      setMissed(prev => prev + 1);
      
      setTimeout(() => {
        if (currentLetter.state === 'wrong') {
          currentLetter.state = 'normal';
        }
      }, 200);
    }
  };

  const updatePlayerX = (x: number) => {
    playerXRef.current = x;
  };

  const setGameLoopCallback = (callback: (deltaTime: number, letters: FallingLetter[]) => void) => {
    onGameLoopTickRef.current = callback;
  };

  const setGameMode = (mode: GameMode) => {
    gameModeRef.current = mode;
  };

  const addCorrect = () => {
    setScore(prev => prev + 1);
    setCorrect(prev => prev + 1);
  };

  const addMissed = () => {
    setScore(prev => Math.max(0, prev - 1));
    setMissed(prev => prev + 1);
  };

  const addDeath = () => {
    setDeaths(prev => prev + 1);
  };

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
    setGameMode,
    addCorrect,
    addMissed,
    addDeath,
    score,
    correct,
    missed,
    deaths,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
