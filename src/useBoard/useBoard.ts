import { useRef, useEffect } from "react";
import type { PlayerPosition, ShipState } from "../types";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SPACESHIP_Y = CANVAS_HEIGHT - 40;

export function useBoard() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shipStateRef = useRef<ShipState>("normal");
  const shipExplosionTimeRef = useRef<number>(0);

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

  const renderBoard = (playerPosition: PlayerPosition, letters: any = [], shipState: ShipState = "normal", shipExplosionTime?: number) => {
    if (shipExplosionTime !== undefined) {
      shipExplosionTimeRef.current = shipExplosionTime;
    }
    shipStateRef.current = shipState;
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

    if (shipStateRef.current === 'exploding') {
      // Explosion animation
      const elapsed = performance.now() - shipExplosionTimeRef.current;
      const progress = Math.min(elapsed / 300, 1);
      const scale = 1 + progress * 1.5;
      const opacity = 1 - progress;

      ctx.save();
      ctx.translate(spaceshipX, spaceshipY);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;

      // Explosion particles
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const distance = progress * 40;
        const px = Math.cos(angle) * distance;
        const py = Math.sin(angle) * distance;

        ctx.fillStyle = i % 3 === 0 ? "#ffff00" : i % 3 === 1 ? "#ff6600" : "#ff0000";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else {
      // Normal spaceship drawing
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
    }

    // Draw falling letters with state effects
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    letters.forEach((letter: any) => {
      if (letter.state === 'wrong') {
        // Red glow flash
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff0000";
        ctx.fillStyle = "#ff4444";
        
        // Draw full text or just current letter
        const displayText = letter.fullText || letter.letter;
        ctx.fillText(displayText, letter.x, letter.y);
        ctx.shadowBlur = 0;
      } else if (letter.state === 'exploding') {
        // Explosion effect
        const elapsed = performance.now() - (letter.stateStartTime || 0);
        const progress = Math.min(elapsed / 300, 1);
        const scale = 1 + progress * 2;
        const opacity = 1 - progress;
        
        ctx.save();
        ctx.translate(letter.x, letter.y);
        ctx.scale(scale, scale);
        ctx.globalAlpha = opacity;
        
        // Explosion particles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const distance = progress * 30;
          const px = Math.cos(angle) * distance;
          const py = Math.sin(angle) * distance;
          
          ctx.fillStyle = i % 2 === 0 ? "#ffff00" : "#ff6600";
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Full text fading
        ctx.fillStyle = "#ffffff";
        const displayText = letter.fullText || letter.letter;
        ctx.fillText(displayText, 0, 0);
        
        ctx.restore();
      } else {
        // Normal state - show full text with progress indication
        const fullText = letter.fullText || letter.letter;
        const charIndex = letter.charIndex ?? 0;
        
        // Draw completed characters in green
        if (charIndex > 0) {
          ctx.fillStyle = "#00ff00";
          ctx.fillText(fullText.substring(0, charIndex), letter.x, letter.y);
        }
        
        // Draw current character in yellow
        ctx.fillStyle = "#ffff00";
        ctx.fillText(fullText[charIndex], letter.x, letter.y);
        
        // Draw remaining characters in white
        if (charIndex + 1 < fullText.length) {
          ctx.fillStyle = "#ffffff";
          ctx.fillText(fullText.substring(charIndex + 1), letter.x, letter.y);
        }
      }
    });
  };

  return {
    containerRef,
    renderBoard,
  };
}

export type UseBoardType = ReturnType<typeof useBoard>;
