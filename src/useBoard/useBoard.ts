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

  const renderBoard = (playerPosition: PlayerPosition, letters: any = []) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw spaceship at player position (already in pixels)
    const spaceshipX = playerPosition.x;
    const spaceshipY = SPACESHIP_Y;

    // Main body (sleek metallic hull)
    ctx.fillStyle = "#4a90e2";
    ctx.beginPath();
    ctx.moveTo(spaceshipX, spaceshipY - 20); // nose
    ctx.lineTo(spaceshipX - 12, spaceshipY + 8);
    ctx.lineTo(spaceshipX + 12, spaceshipY + 8);
    ctx.closePath();
    ctx.fill();

    // Body highlight (lighter blue for 3D effect)
    ctx.fillStyle = "#7bb3ff";
    ctx.beginPath();
    ctx.moveTo(spaceshipX, spaceshipY - 20);
    ctx.lineTo(spaceshipX - 6, spaceshipY + 8);
    ctx.lineTo(spaceshipX + 6, spaceshipY + 8);
    ctx.closePath();
    ctx.fill();

    // Cockpit (glowing cyan)
    const gradient = ctx.createRadialGradient(spaceshipX, spaceshipY - 8, 2, spaceshipX, spaceshipY - 8, 6);
    gradient.addColorStop(0, "#00ffff");
    gradient.addColorStop(0.5, "#0088ff");
    gradient.addColorStop(1, "#004488");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(spaceshipX, spaceshipY - 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Wings (left)
    ctx.fillStyle = "#2a5a8a";
    ctx.beginPath();
    ctx.moveTo(spaceshipX - 12, spaceshipY);
    ctx.lineTo(spaceshipX - 22, spaceshipY + 8);
    ctx.lineTo(spaceshipX - 12, spaceshipY + 8);
    ctx.closePath();
    ctx.fill();

    // Wings (right)
    ctx.beginPath();
    ctx.moveTo(spaceshipX + 12, spaceshipY);
    ctx.lineTo(spaceshipX + 22, spaceshipY + 8);
    ctx.lineTo(spaceshipX + 12, spaceshipY + 8);
    ctx.closePath();
    ctx.fill();

    // Wing tips (glowing)
    ctx.fillStyle = "#ff3366";
    ctx.beginPath();
    ctx.arc(spaceshipX - 22, spaceshipY + 8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(spaceshipX + 22, spaceshipY + 8, 2, 0, Math.PI * 2);
    ctx.fill();

    // Engine exhaust (animated glow)
    const engineGradient = ctx.createRadialGradient(spaceshipX, spaceshipY + 10, 0, spaceshipX, spaceshipY + 10, 10);
    engineGradient.addColorStop(0, "rgba(255, 255, 0, 0.8)");
    engineGradient.addColorStop(0.3, "rgba(255, 150, 0, 0.6)");
    engineGradient.addColorStop(0.6, "rgba(255, 50, 50, 0.3)");
    engineGradient.addColorStop(1, "rgba(255, 0, 0, 0)");
    ctx.fillStyle = engineGradient;
    ctx.beginPath();
    ctx.arc(spaceshipX, spaceshipY + 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Exhaust flames (triple)
    ctx.fillStyle = "#ff9900";
    // Center flame
    ctx.beginPath();
    ctx.moveTo(spaceshipX - 2, spaceshipY + 10);
    ctx.lineTo(spaceshipX, spaceshipY + 22);
    ctx.lineTo(spaceshipX + 2, spaceshipY + 10);
    ctx.closePath();
    ctx.fill();
    
    // Left flame
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.moveTo(spaceshipX - 8, spaceshipY + 10);
    ctx.lineTo(spaceshipX - 6, spaceshipY + 18);
    ctx.lineTo(spaceshipX - 4, spaceshipY + 10);
    ctx.closePath();
    ctx.fill();
    
    // Right flame
    ctx.beginPath();
    ctx.moveTo(spaceshipX + 4, spaceshipY + 10);
    ctx.lineTo(spaceshipX + 6, spaceshipY + 18);
    ctx.lineTo(spaceshipX + 8, spaceshipY + 10);
    ctx.closePath();
    ctx.fill();

    // Draw falling letters
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    letters.forEach((letter: any) => {
      ctx.fillText(letter.letter, letter.x, letter.y);
    });
  };

  return {
    containerRef,
    renderBoard,
  };
}

export type UseBoardType = ReturnType<typeof useBoard>;
