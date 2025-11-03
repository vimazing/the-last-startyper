import { useState } from "react";
import type { PlayerPosition } from "../types";

const BOARD_WIDTH = 10; // 10 columns
const START_POSITION = 4; // Start at center (column 4-5)

export function useCursor() {
  const [position, setPosition] = useState<PlayerPosition>({ x: START_POSITION });

  const moveLeft = (count: number = 1) => {
    setPosition(p => ({ x: Math.max(0, p.x - count) }));
  };

  const moveRight = (count: number = 1) => {
    setPosition(p => ({ x: Math.min(BOARD_WIDTH - 1, p.x + count) }));
  };

  // Typing game: hjkl only moves left/right, not up/down
  const moveUp = () => {
    // No vertical movement in typing game
  };

  const moveDown = () => {
    // No vertical movement in typing game
  };

  const moveToStart = () => {
    setPosition({ x: 0 });
  };

  const moveToEnd = () => {
    setPosition({ x: BOARD_WIDTH - 1 });
  };

  const moveToTop = () => {
    // No vertical movement in typing game
  };

  const moveToBottom = () => {
    // No vertical movement in typing game
  };

  const repeatLastMotion = () => {
    // TODO: Implement repeat for typing game
  };

  return {
    position: () => position,
    mode: () => 'normal' as const,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    moveToStart,
    moveToEnd,
    moveToTop,
    moveToBottom,
    repeatLastMotion,
  };
}

export type UseCursorType = ReturnType<typeof useCursor>;
