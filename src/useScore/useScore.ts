import { useState, useEffect } from "react";
import type { ScoreManager } from "../types";

export function useScore(gameStatusManager: any): ScoreManager {
  const [timeValue, setTimeValue] = useState(0);

  useEffect(() => {
    if (gameStatusManager.gameStatus !== 'started') return;
    
    const interval = setInterval(() => {
      setTimeValue(prev => prev + 100);
    }, 100);

    return () => clearInterval(interval);
  }, [gameStatusManager.gameStatus]);

   return {
     timeValue,
     totalKeystrokes: 0, // TODO: Track keystrokes from keyboard input
     score: gameStatusManager.score,
     correct: gameStatusManager.correct,
     missed: gameStatusManager.missed,
     deaths: gameStatusManager.deaths,
     lettersCompleted: gameStatusManager.lettersCompleted,
     wordsCompleted: gameStatusManager.wordsCompleted,
     sentencesCompleted: gameStatusManager.sentencesCompleted,
     paragraphsCompleted: gameStatusManager.paragraphsCompleted,
     currentCount: gameStatusManager.getCurrentCount(),
   };
 }

export type UseScoreType = ReturnType<typeof useScore>;
