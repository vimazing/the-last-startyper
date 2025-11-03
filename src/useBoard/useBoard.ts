import { useRef, useEffect } from "react";
import type { PlayerPosition } from "../types";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SPACESHIP_Y = CANVAS_HEIGHT - 40;

export function useBoard() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Setup canvas on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.border = "1px solid #0f3460";
    canvas.style.backgroundColor = "#000";
    canvas.style.display = "block";

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(canvas);
    canvasRef.current = canvas;
  }, []);

  const renderBoard = (playerPosition: PlayerPosition) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw spaceship at player position
    const spaceshipX = (playerPosition.x / 10) * CANVAS_WIDTH + CANVAS_WIDTH / 20;
    const spaceshipY = SPACESHIP_Y;

    // Spaceship body (triangle pointing up)
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.moveTo(spaceshipX, spaceshipY - 15); // top point
    ctx.lineTo(spaceshipX - 10, spaceshipY + 10); // left bottom
    ctx.lineTo(spaceshipX + 10, spaceshipY + 10); // right bottom
    ctx.closePath();
    ctx.fill();

    // Spaceship window (circle in center)
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(spaceshipX, spaceshipY - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Spaceship flames (small triangles at bottom)
    ctx.fillStyle = "#ff6600";
    // Left flame
    ctx.beginPath();
    ctx.moveTo(spaceshipX - 5, spaceshipY + 10);
    ctx.lineTo(spaceshipX - 3, spaceshipY + 20);
    ctx.lineTo(spaceshipX - 8, spaceshipY + 15);
    ctx.closePath();
    ctx.fill();

    // Right flame
    ctx.beginPath();
    ctx.moveTo(spaceshipX + 5, spaceshipY + 10);
    ctx.lineTo(spaceshipX + 3, spaceshipY + 20);
    ctx.lineTo(spaceshipX + 8, spaceshipY + 15);
    ctx.closePath();
    ctx.fill();
  };

  return {
    containerRef,
    renderBoard,
  };
}

export type UseBoardType = ReturnType<typeof useBoard>;
