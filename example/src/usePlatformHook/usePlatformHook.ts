import { useEffect } from "react";
import type { GameManager } from "../../../src";

export const usePlatformHook = (gameManager: GameManager) => {
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      // start game
      if (ev.code === "Space") {
        ev.preventDefault(); // Prevent button activation
        if (["waiting", "game-over", "game-won"].includes(gameManager.gameStatus)) {
          gameManager.clearKeyLog();
          gameManager.renderBoard();
          if (gameManager.gameStatus === "game-over" || gameManager.gameStatus === "game-won") {
            gameManager.quitGame();
            setTimeout(() => gameManager.startGame(), 0);
          } else {
            gameManager.startGame();
          }
          return;
        }
      }

      // ignore other keys while waiting
      if (gameManager.gameStatus === "waiting") return;

      // quit
      if (ev.key === "Escape") {
        ev.preventDefault();
        gameManager.quitGame();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameManager.gameStatus]);
};
