import { useRef } from "react";

const CANVAS_WIDTH = 800;
const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const START_PIXEL_X = CANVAS_WIDTH / 2; // Start at center (400px)
const MOVEMENT_DURATION_MS = 100; // Time to reach target regardless of distance

export function useCursor() {
  const pixelXRef = useRef<number>(START_PIXEL_X);
  const targetXRef = useRef<number>(START_PIXEL_X);
  const startXRef = useRef<number>(START_PIXEL_X);
  const movementStartTimeRef = useRef<number>(0);

  const moveLeft = (count: number = 1) => {
    const newX = Math.max(MARGIN_LEFT, pixelXRef.current - (count * 80));
    pixelXRef.current = newX;
    targetXRef.current = newX;
  };

  const moveRight = (count: number = 1) => {
    const newX = Math.min(CANVAS_WIDTH - MARGIN_RIGHT, pixelXRef.current + (count * 80));
    pixelXRef.current = newX;
    targetXRef.current = newX;
  };

  const moveUp = () => {
    // No vertical movement in typing game
  };

  const moveDown = () => {
    // No vertical movement in typing game
  };

  const moveToStart = () => {
    const newX = MARGIN_LEFT;
    pixelXRef.current = newX;
    targetXRef.current = newX;
  };

  const moveToEnd = () => {
    const newX = CANVAS_WIDTH - MARGIN_RIGHT;
    pixelXRef.current = newX;
    targetXRef.current = newX;
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

  const setTargetX = (pixelX: number) => {
    if (targetXRef.current !== pixelX) {
      startXRef.current = pixelXRef.current;
      targetXRef.current = pixelX;
      movementStartTimeRef.current = performance.now();
    }
  };

  const moveTowardTarget = (_deltaTime: number) => {
    const targetPixelX = targetXRef.current;
    const startPixelX = startXRef.current;
    const currentPixelX = pixelXRef.current;
    
    if (currentPixelX === targetPixelX) {
      return;
    }

    const elapsedTime = performance.now() - movementStartTimeRef.current;
    const progress = Math.min(elapsedTime / MOVEMENT_DURATION_MS, 1);
    
    const newX = startPixelX + (targetPixelX - startPixelX) * progress;
    pixelXRef.current = newX;

    if (progress >= 1) {
      pixelXRef.current = targetPixelX;
    }
  };

  return {
    position: () => ({ x: pixelXRef.current }),
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
    setTargetX,
    moveTowardTarget,
  };
}

export type UseCursorType = ReturnType<typeof useCursor>;
