import { useState } from "react";
import type { GameStatus } from "../types";

export function useGameStatus() {
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");

  const startGame = () => {
    setGameStatus("started");
  };

  const quitGame = () => {
    setGameStatus("waiting");
  };

  return {
    gameStatus,
    setGameStatus,
    startGame,
    quitGame,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
