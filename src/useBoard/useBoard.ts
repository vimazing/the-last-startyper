import { useRef, useEffect } from "react";
import type { PlayerPosition, ShipState, GameMode, Laser } from "../types";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SPACESHIP_Y = CANVAS_HEIGHT - 40;

// Helper function to break text into multiple lines at good breaking points
const breakTextIntoLines = (text: string, numLines: number = 2): string[] => {
  if (numLines === 2) {
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
  }
  
  // For 3+ lines, divide text evenly
  const lines: string[] = [];
  const charsPerLine = Math.ceil(text.length / numLines);
  let startIdx = 0;
  
  for (let i = 0; i < numLines - 1; i++) {
    let endIdx = startIdx + charsPerLine;
    
    // Find nearest space to break at
    for (let j = endIdx; j >= endIdx - 10 && j >= startIdx; j--) {
      if (text[j] === ' ') {
        endIdx = j;
        break;
      }
    }
    
    lines.push(text.substring(startIdx, endIdx + 1)); // Include the space
    startIdx = endIdx + 1;
  }
  
  // Last line gets remaining text
  lines.push(text.substring(startIdx).trim());
  
  return lines;
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

  const renderBoard = (playerPosition: PlayerPosition, letters: any = [], shipState: ShipState = "normal", shipExplosionTime?: number, gameMode: GameMode = 'letters', lasers: Laser[] = []) => {
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

    // Draw lasers
    lasers.forEach((laser: Laser) => {
      const progress = (performance.now() - laser.startTime) / laser.duration;
      if (progress <= 1) {
        // Laser beam effect
        ctx.save();
        
        // Create gradient for laser beam
        const gradient = ctx.createLinearGradient(laser.startX, laser.startY, laser.endX, laser.endY);
        
        if (laser.hit) {
          // Green laser for hits (future feature)
          gradient.addColorStop(0, "rgba(0, 255, 0, 0.8)");
          gradient.addColorStop(0.5, "rgba(100, 255, 100, 1)");
          gradient.addColorStop(1, "rgba(0, 255, 0, 0.3)");
        } else {
          // Red laser for misses
          gradient.addColorStop(0, "rgba(255, 0, 0, 0.8)");
          gradient.addColorStop(0.5, "rgba(255, 100, 100, 1)");
          gradient.addColorStop(1, "rgba(255, 0, 0, 0.3)");
        }
        
        // Draw laser beam with fade effect
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3 * (1 - progress * 0.5); // Gets thinner as it fades
        ctx.globalAlpha = 1 - progress * 0.7; // Fades out
        
        ctx.beginPath();
        ctx.moveTo(laser.startX, laser.startY);
        ctx.lineTo(laser.endX, laser.endY);
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = laser.hit ? "#00ff00" : "#ff0000";
        ctx.stroke();
        
        // Draw impact burst at the end
        if (progress > 0.5) {
          const burstProgress = (progress - 0.5) * 2;
          const burstSize = 10 * burstProgress;
          ctx.fillStyle = laser.hit ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)";
          ctx.beginPath();
          ctx.arc(laser.endX, laser.endY, burstSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    });

    // Draw falling letters with state effects
    const isSentenceMode = gameMode === 'sentences' || gameMode === 'paragraphs';
    const fontSize = isSentenceMode ? 20 : 32;
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    
    letters.forEach((letter: any) => {
      // For sentences/paragraphs, always center horizontally
      const letterX = isSentenceMode ? CANVAS_WIDTH / 2 : letter.x;
      
      if (letter.state === 'exploding') {
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
         
         if (gameMode === 'paragraphs') {
          // For paragraphs: 4 lines (first typed at bottom, last typed at top)
          const lines = breakTextIntoLines(displayText, 4);
          const perspectiveFactors = [0.6, 0.7, 0.85, 1.0]; // Reversed: smallest at top, largest at bottom
          const lineSpacing = fontSize * 1.2;
          
          ctx.save();
          
          lines.forEach((line, lineIndex) => {
            // Calculate visual position: line 0 at bottom, line 3 at top
            const visualIndex = lines.length - 1 - lineIndex;
            const lineY = letter.y + (lineSpacing * (visualIndex - 1.5));
            const lineFontSize = fontSize * perspectiveFactors[visualIndex];
            const convergence = 0.3 * (1 - perspectiveFactors[visualIndex]);
            const lineCenterX = letterX + ((CANVAS_WIDTH / 2) - letterX) * convergence;
            
            ctx.font = `bold ${lineFontSize}px monospace`;
            const lineWidth = ctx.measureText(line).width;
            ctx.fillText(line, lineCenterX - lineWidth / 2, lineY);
          });
          
          ctx.restore();
        } else if (isSentenceMode && gameMode === 'sentences') {
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
         
          if (gameMode === 'paragraphs') {
            // Paragraphs: break into 4 lines with enhanced Star Wars effect
            const lines = breakTextIntoLines(fullText, 4);
            
            // Calculate character positions for line breaks
            let totalChars = 0;
            const lineStartIndices = [0];
            for (let i = 0; i < lines.length - 1; i++) {
              totalChars += lines[i].length;
              lineStartIndices.push(totalChars);
            }
            
            // Enhanced Star Wars perspective for 4 lines
            // First typed line (index 0) at bottom, last typed line (index 3) at top
            const perspectiveFactors = [0.6, 0.7, 0.85, 1.0]; // Reversed: smallest at top, largest at bottom
            const lineSpacing = fontSize * 1.2;
            
            ctx.save();
            
            // Render each line with perspective
            lines.forEach((line, lineIndex) => {
              // Calculate visual position: line 0 at bottom, line 3 at top
              const visualIndex = lines.length - 1 - lineIndex;
              const lineY = letter.y + (lineSpacing * (visualIndex - 1.5));
              const lineFontSize = fontSize * perspectiveFactors[visualIndex];
              const lineOpacity = 1.0 - (visualIndex * 0.1); // Decreasing opacity for lines at top
              
              // Convergence toward vanishing point (more for lines at top)
              const convergence = 0.3 * (1 - perspectiveFactors[visualIndex]);
              const lineCenterX = letterX + ((CANVAS_WIDTH / 2) - letterX) * convergence;
              
              ctx.font = `bold ${lineFontSize}px monospace`;
              const lineWidth = ctx.measureText(line).width;
              let lineX = lineCenterX - lineWidth / 2;
              
              // Render characters with color coding
              for (let i = 0; i < line.length; i++) {
                const globalCharIdx = lineStartIndices[lineIndex] + i;
                const char = line[i];
                
                if (globalCharIdx < charIndex) {
                  ctx.fillStyle = `rgba(0, 255, 0, ${lineOpacity})`; // Green - completed
                } else if (globalCharIdx === charIndex) {
                  ctx.fillStyle = `rgba(255, 255, 0, ${lineOpacity})`; // Yellow - current
                  // Store position for ship tracking
                  letter.currentCharX = lineX + ctx.measureText(char).width / 2;
                } else {
                  ctx.fillStyle = `rgba(255, 255, 255, ${lineOpacity})`; // White - remaining
                }
                
                ctx.fillText(char, lineX, lineY);
                lineX += ctx.measureText(char).width;
              }
            });
            
            ctx.restore();
          } else if (isSentenceMode && gameMode === 'sentences') {
            // For sentences: keep the existing 2-line system
            const [line1, line2] = breakTextIntoLines(fullText, 2);
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
                // Store position of current character for ship tracking
                letter.currentCharX = line2X + ctx.measureText(char).width / 2;
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
                    // Store position of current character for ship tracking
                    letter.currentCharX = line1X + ctx.measureText(char).width / 2;
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
           
           // For words mode, calculate position of current character
           const isWordMode = gameMode === 'words';
           
           // Draw completed characters in green
           if (charIndex > 0) {
             ctx.fillStyle = "#00ff00";
             const completedText = fullText.substring(0, charIndex);
             ctx.fillText(completedText, currentX, letter.y);
             currentX += ctx.measureText(completedText).width;
           }
           
           // Draw current character in yellow
           ctx.fillStyle = "#ffff00";
           const currentChar = fullText[charIndex];
           // Store position for ship tracking in words mode
           if (isWordMode) {
             letter.currentCharX = currentX + ctx.measureText(currentChar).width / 2;
           }
           ctx.fillText(currentChar, currentX, letter.y);
           currentX += ctx.measureText(currentChar).width;
           
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
