import { useState } from "react";
import type { Coord } from "../types";

export function useCursor() {
  const [position] = useState<Coord>({ row: 0, col: 0 });

  const moveLeft = (_count?: number) => {
    // TODO: Implement movement
  };

  const moveRight = (_count?: number) => {
    // TODO: Implement movement
  };

  const moveUp = (_count?: number) => {
    // TODO: Implement movement
  };

  const moveDown = (_count?: number) => {
    // TODO: Implement movement
  };

  const moveToStart = () => {
    // TODO: Implement anchor motion
  };

  const moveToEnd = () => {
    // TODO: Implement anchor motion
  };

  const moveToTop = () => {
    // TODO: Implement anchor motion
  };

  const moveToBottom = () => {
    // TODO: Implement anchor motion
  };

  const repeatLastMotion = () => {
    // TODO: Implement repeat
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
