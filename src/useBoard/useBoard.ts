import { useRef } from "react";
import type { PlayerPosition } from "../types";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 40; // pixels

export function useBoard() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const renderBoard = (playerPosition: PlayerPosition) => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    // Create board grid
    const board = document.createElement("div");
    board.className = "typing-board";
    board.style.display = "grid";
    board.style.gridTemplateColumns = `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`;
    board.style.gap = "1px";
    board.style.backgroundColor = "#000";
    board.style.padding = "8px";
    board.style.borderRadius = "4px";
    board.style.width = "fit-content";

    // Create cells
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const cell = document.createElement("div");
        cell.className = "typing-cell";
        cell.setAttribute("data-row", String(row));
        cell.setAttribute("data-col", String(col));
        cell.style.width = `${CELL_SIZE}px`;
        cell.style.height = `${CELL_SIZE}px`;
        cell.style.backgroundColor = "#1a1a2e";
        cell.style.border = "1px solid #0f3460";
        cell.style.display = "flex";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "center";
        cell.style.fontSize = "12px";
        cell.style.fontFamily = "monospace";
        cell.style.color = "#00ff00";

        // Highlight player row (bottom)
        if (row === BOARD_HEIGHT - 1) {
          cell.style.backgroundColor = "#0f3460";
          
          // Render spaceship in player column
          if (col === playerPosition.x) {
            cell.innerHTML = "🚀";
            cell.style.fontSize = "24px";
          }
        }

        board.appendChild(cell);
      }
    }

    container.appendChild(board);
  };

  return {
    containerRef,
    renderBoard,
  };
}

export type UseBoardType = ReturnType<typeof useBoard>;
