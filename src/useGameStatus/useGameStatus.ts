import { useState, useRef } from "react";
import type { GameStatus, FallingLetter, ShipState, GameMode, Laser } from "../types";
import { getRandomWord } from "../wordLists";

const LETTER_SPEEDS: Record<GameMode, number> = {
  letters: 100,
  words: 50,
  sentences: 25,
  paragraphs: 15, // Even slower for longer text
};
const SPAWN_INTERVAL = 1000; // ms between letter spawns
const MAX_ACTIVE_LETTERS = 1; // Only one letter on screen at a time
const MARGIN_LEFT = 50; // Safe margin from left edge
const MARGIN_RIGHT = 50; // Safe margin from right edge
const CANVAS_WIDTH = 800;
const SPACESHIP_Y = 600 - 40; // Position of the ship on canvas

export function useGameStatus(onGameLoopTick?: (deltaTime: number, letters: FallingLetter[], lasers: Laser[]) => void, gameMode: GameMode = 'letters') {
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
  const lasersRef = useRef<Laser[]>([]);
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
      
      // For sentences/paragraphs, spawn centered. For letters/words, spawn randomly
      const isCenteredMode = gameModeRef.current === 'sentences' || gameModeRef.current === 'paragraphs';
      const spawnWidth = CANVAS_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
      const spawnX = isCenteredMode ? CANVAS_WIDTH / 2 : (MARGIN_LEFT + Math.random() * spawnWidth);
      const randomY = Math.random() * 150; // Between 0-150 (top half of screen)
      
      const newLetter: FallingLetter = {
        id: `${currentTime}-${spawnX}`,
        letter: firstChar,
        fullText: fullText.toUpperCase(),
        charIndex: 0,
        x: spawnX,
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
        // Calculate the bottom of the text based on game mode
        let textBottom = letter.y;
        
        if (gameModeRef.current === 'letters') {
          // For letters, y is the center, so add half font size
          textBottom = letter.y + 16; // Half of 32px font
        } else if (gameModeRef.current === 'words') {
          // For words, y is the center, so add half font size
          textBottom = letter.y + 16; // Half of 32px font
        } else if (gameModeRef.current === 'sentences') {
          // For sentences, we have 2 lines with the bottom line at y + fontSize
          textBottom = letter.y + 20; // Bottom of lower line (fontSize = 20 for sentences)
        } else if (gameModeRef.current === 'paragraphs') {
          // For paragraphs, we have 4 lines
          // Line positions are at (1.5 - lineIndex) * lineSpacing from y
          // Bottom line (index 0) is at y + (1.5 * lineSpacing)
          const fontSize = 20;
          const lineSpacing = fontSize * 1.2;
          textBottom = letter.y + (1.5 * lineSpacing) + (fontSize / 2);
        }
        
        // Check if bottom of text reaches top of ship
        const distanceFromShip = SPACESHIP_Y - textBottom;
        const horizontalDistance = Math.abs(letter.x - playerXRef.current);

        // Death occurs when text bottom reaches ship top (distance <= 0)
        if (distanceFromShip <= 0 && (gameModeRef.current === 'letters' ? horizontalDistance < 30 : true)) {
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
    
    // Remove expired lasers
    lasersRef.current = lasersRef.current.filter(laser => 
      currentTime - laser.startTime < laser.duration
    );

    // Call tick callback if provided (now with lasers)
    if (onGameLoopTickRef.current) {
      onGameLoopTickRef.current(deltaTime, lettersRef.current, lasersRef.current);
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

      // Create a laser that hits the target (green laser)
      const targetX = currentLetter.currentCharX || currentLetter.x;
      const targetY = currentLetter.y;
      
      const hitLaser: Laser = {
        id: `laser-${performance.now()}`,
        startX: playerXRef.current,
        startY: SPACESHIP_Y - 20, // From ship's nose
        endX: targetX,
        endY: targetY,
        startTime: performance.now(),
        duration: 150, // Slightly faster for hits
        hit: true
      };
      
      lasersRef.current.push(hitLaser);

      const charIndex = (currentLetter.charIndex ?? 0) + 1;
      const fullText = currentLetter.fullText ?? currentLetter.letter;
      
      // Handle line transitions for sentences and paragraphs
      if (gameModeRef.current === 'paragraphs' && fullText.length > 20) {
        // Calculate line breaks for 4-line paragraphs
        const numLines = 4;
        const charsPerLine = Math.ceil(fullText.length / numLines);
        const lineBreakPoints: number[] = [];
        
        let startIdx = 0;
        for (let i = 0; i < numLines - 1; i++) {
          let endIdx = startIdx + charsPerLine;
          // Find nearest space to break at
          for (let j = endIdx; j >= endIdx - 10 && j >= startIdx; j--) {
            if (fullText[j] === ' ') {
              endIdx = j;
              break;
            }
          }
          lineBreakPoints.push(endIdx);
          startIdx = endIdx + 1;
        }
        
        // Check if we just completed a line
        const currentLineIndex = currentLetter.currentLineIndex ?? 0;
        if (currentLineIndex < lineBreakPoints.length && charIndex === lineBreakPoints[currentLineIndex] + 1) {
          // Trigger line transition animation
          currentLetter.lineTransition = true;
          currentLetter.lineTransitionTime = performance.now();
          currentLetter.currentLineIndex = currentLineIndex + 1;
          if (!currentLetter.completedLines) {
            currentLetter.completedLines = [];
          }
          currentLetter.completedLines.push(currentLineIndex);
          // Continue to next character
          currentLetter.charIndex = charIndex;
          currentLetter.letter = fullText[charIndex];
          return;
        }
      } else if (gameModeRef.current === 'sentences' && fullText.length > 20) {
        // Original sentence logic (2 lines)
        const midpoint = Math.ceil(fullText.length / 2);
        let breakPoint = midpoint;
        for (let i = midpoint; i >= midpoint - 10 && i >= 0; i--) {
          if (fullText[i] === ' ') {
            breakPoint = i;
            break;
          }
        }
        
        // If we just completed the first line (typed the space at position breakPoint)
        if (charIndex === breakPoint + 1) {
          // Trigger line transition animation
          currentLetter.lineTransition = true;
          currentLetter.lineTransitionTime = performance.now();
          // Continue to next character (first char of line 2)
          currentLetter.charIndex = charIndex;
          currentLetter.letter = fullText[charIndex];
          return;
        }
      }

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
      // Don't change the letter's visual state - only show red laser
      setScore(prev => Math.max(0, prev - 1));
      setMissed(prev => prev + 1);
      
      // Create a laser that misses (shoots left or right)
      const missDirection = Math.random() > 0.5 ? 1 : -1; // Random left or right
      const missOffset = 30 + Math.random() * 50; // 30-80 pixels off target
      
      const targetX = currentLetter.currentCharX || currentLetter.x;
      const targetY = currentLetter.y;
      
      const newLaser: Laser = {
        id: `laser-${performance.now()}`,
        startX: playerXRef.current,
        startY: SPACESHIP_Y - 20, // From ship's nose
        endX: targetX + (missOffset * missDirection),
        endY: targetY,
        startTime: performance.now(),
        duration: 200, // 200ms visibility
        hit: false
      };
      
      lasersRef.current.push(newLaser);
    }
  };

  const updatePlayerX = (x: number) => {
    playerXRef.current = x;
  };

  const setGameLoopCallback = (callback: (deltaTime: number, letters: FallingLetter[], lasers: Laser[]) => void) => {
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
