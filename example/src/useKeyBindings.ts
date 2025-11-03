import { useEffect } from "react";
import type { GameManager } from "../../src";

export const useKeyBindings = (gameManager: GameManager) => {
  const { gameStatus, renderBoard, startGame, quitGame, clearKeyLog } = gameManager;

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      // start game
      if (ev.code === "Space") {
        if (["waiting", "game-over", "game-won"].includes(gameStatus)) {
          clearKeyLog();
          renderBoard();
          if (gameStatus === "game-over" || gameStatus === "game-won") {
            quitGame();
            setTimeout(() => startGame(), 0);
          } else {
            startGame();
          }
          return;
        }
      }

      // ignore other keys while waiting
      if (gameStatus === "waiting") return;

      // quit
      if (ev.key === "q" || ev.key === "Q") {
        quitGame();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameStatus]);
};

