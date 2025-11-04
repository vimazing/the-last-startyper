import { useRef, useEffect } from "react";
import type { PlayerPosition, ShipState, GameMode } from "../types";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SPACESHIP_Y = CANVAS_HEIGHT - 40;

// Helper function to break text into two lines at a good breaking point
const breakTextIntoLines = (text: string): [string, string] => {
  const midpoint = Math.ceil(text.length / 2);
  
  // Try to find a space near the midpoint to break naturally
  let breakPoint = midpoint;
  for (let i = midpoint; i >= midpoint - 10 && i >= 0; i--) {
    if (text[i] === ' ') {
      breakPoint = i;
      break;
    }
  }
  
  // Keep the space at the end of line1 for typing
  const line1 = text.substring(0, breakPoint + 1); // Include the space
  const line2 = text.substring(breakPoint + 1).trim(); // Start after the space
  
  return [line1, line2];
};

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

  const renderBoard = (playerPosition: PlayerPosition, letters: any = [], shipState: ShipState = "normal", shipExplosionTime?: number, gameMode: GameMode = 'letters') => {
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
    const isSentenceMode = gameMode === 'sentences' || gameMode === 'paragraphs';
    const fontSize = isSentenceMode ? 20 : 32;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    
    letters.forEach((letter: any) => {
      // For sentences/paragraphs, always center horizontally
      const letterX = isSentenceMode ? CANVAS_WIDTH / 2 : letter.x;
      
      if (letter.state === 'wrong') {
        // Red glow flash
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff0000";
        ctx.fillStyle = "#ff4444";
        
        const displayText = letter.fullText || letter.letter;
        
        if (isSentenceMode && (gameMode === 'sentences' || gameMode === 'paragraphs')) {
          // For sentences: break into two lines with Star Wars effect
          const [line1, line2] = breakTextIntoLines(displayText);
          
          ctx.save();
          
          // Star Wars perspective effect
          const perspectiveFactor = 0.8;
          const vanishingPointX = CANVAS_WIDTH / 2;
          
          // Inverted: line2 on top, line1 on bottom
          const line2Y = letter.y - fontSize * 1.5;
          const line1Y = letter.y + fontSize;
          
          // Draw line2 on top with perspective
          const line2FontSize = fontSize * perspectiveFactor;
          ctx.font = `bold ${line2FontSize}px monospace`;
          const line2CenterX = letterX + (vanishingPointX - letterX) * 0.2;
          const line2Width = ctx.measureText(line2).width;
          ctx.fillText(line2, line2CenterX - line2Width / 2, line2Y);
          
          // Draw line1 on bottom (full size)
          ctx.font = `bold ${fontSize}px monospace`;
          const line1Width = ctx.measureText(line1).width;
          ctx.fillText(line1, letterX - line1Width / 2, line1Y);
          
          ctx.restore();
        } else {
          // Single line for letters/words
          const textWidth = ctx.measureText(displayText).width;
          ctx.fillText(displayText, letterX - textWidth / 2, letter.y);
        }
        
        ctx.shadowBlur = 0;
      } else if (letter.state === 'exploding') {
        // Explosion effect
        const elapsed = performance.now() - (letter.stateStartTime || 0);
        const progress = Math.min(elapsed / 300, 1);
        const scale = 1 + progress * 2;
        const opacity = 1 - progress;
        
        ctx.save();
        ctx.translate(letterX, letter.y);
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
         
         if (isSentenceMode && (gameMode === 'sentences' || gameMode === 'paragraphs')) {
           // For sentences: break into two lines during explosion with perspective
           const [line1, line2] = breakTextIntoLines(displayText);
           
           // Star Wars perspective for explosion
           const perspectiveFactor = 0.8;
           
           // Draw line2 on top with smaller font
           ctx.save();
           ctx.font = `bold ${fontSize * perspectiveFactor}px monospace`;
           const line2Width = ctx.measureText(line2).width;
           ctx.fillText(line2, -line2Width / 2, -fontSize * 1.5);
           ctx.restore();
           
           // Draw line1 on bottom (normal size)
           const line1Width = ctx.measureText(line1).width;
           ctx.fillText(line1, -line1Width / 2, fontSize);
         } else {
           // Single line for letters/words
           const textWidth = ctx.measureText(displayText).width;
           ctx.fillText(displayText, -textWidth / 2, 0);
         }
        
        ctx.restore();
       } else {
         // Normal state - show full text with progress indication
         const fullText = letter.fullText || letter.letter;
         const charIndex = letter.charIndex ?? 0;
         
          if (isSentenceMode && (gameMode === 'sentences' || gameMode === 'paragraphs')) {
            // For sentences/paragraphs: break into two lines with Star Wars effect
            const [line1, line2] = breakTextIntoLines(fullText);
            const line1Length = line1.length;
            
            // Check if we're in a line transition animation
            const isTransitioning = letter.lineTransition && letter.lineTransitionTime;
            const transitionProgress = isTransitioning 
              ? Math.min((performance.now() - letter.lineTransitionTime) / 500, 1) // 500ms animation
              : 0;
            
            // Star Wars perspective effect
            const perspectiveFactor = isTransitioning 
              ? 0.8 + (0.2 * transitionProgress)  // Grow from 0.8 to 1.0
              : 0.8;
            const vanishingPointX = CANVAS_WIDTH / 2;
            
            // Positions with animation
            const line2Y = letter.y - fontSize * (isTransitioning ? 1.5 - transitionProgress * 0.5 : 1.5);
            const line1Y = letter.y + fontSize;
            
            // If transitioning, line1 explodes independently
            if (isTransitioning && transitionProgress < 0.6) {
              // Draw exploding line1
              const explosionProgress = transitionProgress / 0.6; // Complete in 60% of transition
              const explosionScale = 1 + explosionProgress * 2;
              const explosionOpacity = 1 - explosionProgress;
              
              ctx.save();
              ctx.translate(letterX, line1Y);
              ctx.scale(explosionScale, explosionScale);
              ctx.globalAlpha = explosionOpacity;
              ctx.fillStyle = "#ffff00";
              const line1Width = ctx.measureText(line1).width;
              ctx.fillText(line1, -line1Width / 2, 0);
              ctx.restore();
            }
            
            // Save context for transformations
            ctx.save();
            
            // Render line 2 (with growing effect during transition)
            const line2FontSize = fontSize * perspectiveFactor;
            ctx.font = `bold ${line2FontSize}px monospace`;
            
            const line2Width = ctx.measureText(line2).width;
            // Apply perspective - top line moves toward vanishing point (less during transition)
            const perspectiveAmount = isTransitioning ? 0.2 * (1 - transitionProgress) : 0.2;
            const line2CenterX = letterX + (vanishingPointX - letterX) * perspectiveAmount;
            let line2X = line2CenterX - line2Width / 2;
            
            // Add slight transparency for depth (but make it more opaque during transition)
            const topOpacity = isTransitioning ? 0.85 + 0.15 * transitionProgress : 0.85;
            
            for (let i = 0; i < line2.length; i++) {
              const charIdx = line1Length + i; // line1 already includes the space
              const char = line2[i];
              if (charIdx < charIndex) {
                ctx.fillStyle = `rgba(0, 255, 0, ${topOpacity})`; // Green - completed
              } else if (charIdx === charIndex) {
                ctx.fillStyle = `rgba(255, 255, 0, ${topOpacity})`; // Yellow - current
              } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${topOpacity})`; // White - remaining
              }
              ctx.fillText(char, line2X, line2Y);
              line2X += ctx.measureText(char).width;
            }
            
            // Render line 1 only if not transitioning or in early phase of transition
            if (!isTransitioning || transitionProgress > 0.6) {
              // After transition, don't render line1 anymore
              if (!isTransitioning) {
                ctx.font = `bold ${fontSize}px monospace`;
                const line1Width = ctx.measureText(line1).width;
                let line1X = letterX - line1Width / 2;
                
                for (let i = 0; i < line1.length; i++) {
                  const char = line1[i];
                  if (i < charIndex) {
                    ctx.fillStyle = "#00ff00"; // Green - completed
                  } else if (i === charIndex) {
                    ctx.fillStyle = "#ffff00"; // Yellow - current
                  } else {
                    ctx.fillStyle = "#ffffff"; // White - remaining
                  }
                  ctx.fillText(char, line1X, line1Y);
                  line1X += ctx.measureText(char).width;
                }
              }
            }
            
            ctx.restore();
         } else {
           // For letters/words: single line as before
           const totalWidth = ctx.measureText(fullText).width;
           const startX = letterX - totalWidth / 2;
           let currentX = startX;
           
           // Draw completed characters in green
           if (charIndex > 0) {
             ctx.fillStyle = "#00ff00";
             const completedText = fullText.substring(0, charIndex);
             ctx.fillText(completedText, currentX, letter.y);
             currentX += ctx.measureText(completedText).width;
           }
           
           // Draw current character in yellow
           ctx.fillStyle = "#ffff00";
           ctx.fillText(fullText[charIndex], currentX, letter.y);
           currentX += ctx.measureText(fullText[charIndex]).width;
           
           // Draw remaining characters in white
           if (charIndex + 1 < fullText.length) {
             ctx.fillStyle = "#ffffff";
             ctx.fillText(fullText.substring(charIndex + 1), currentX, letter.y);
           }
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
