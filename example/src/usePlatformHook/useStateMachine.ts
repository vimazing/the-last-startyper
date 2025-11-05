import { useEffect, useRef } from "react";
import type { GameMode, GameManager, GameOptions } from "@vimazing/the-last-startyper";
import type { TestScenario } from "./testStateMachines";
import { greatFallsParagraphs } from "./greatFallsContent";

interface UseStateMachineProps {
  gameManager: GameManager;
  gameMode: GameMode;
  scenario: TestScenario;
  onModeChange: (newMode: GameMode) => void;
}

const getGameOptionsForMode = (mode: GameMode): GameOptions => ({
  gameMode: mode,
  ...(mode === 'paragraphs' && { wordList: greatFallsParagraphs }),
});

export const useStateMachine = ({
  gameManager,
  gameMode,
  scenario,
  onModeChange,
}: UseStateMachineProps) => {
  const lastTransitionIndexRef = useRef<number>(-1);
  const triggeredScoreTransitionsRef = useRef<Set<number>>(new Set());
  const lastTriggeredModeRef = useRef<GameMode | null>(null);

  useEffect(() => {
    const gameStatus = gameManager.gameStatus;
    const scoreManager = gameManager.scoreManager;

    if (gameStatus !== "started") return;

    // Handle score-based transitions
    if (scenario.scoreTransitions) {
      const currentScore = scoreManager.score;
      const nextTransition = scenario.scoreTransitions.find(
        (t) => currentScore >= t.scoreThreshold && !triggeredScoreTransitionsRef.current.has(t.scoreThreshold)
      );

       if (nextTransition) {
         triggeredScoreTransitionsRef.current.add(nextTransition.scoreThreshold);
         onModeChange(nextTransition.targetMode);
         gameManager.changeGameMode(getGameOptionsForMode(nextTransition.targetMode));
       }
      return;
    }

    // Handle count-based transitions
    if (!scenario.transitions) return;

    // Skip if we already triggered a transition for this mode
    if (lastTriggeredModeRef.current === gameMode) {
      return;
    }

    const currentTransitionIdx = scenario.transitions.findIndex((t) => t.fromMode === gameMode);

    if (currentTransitionIdx === -1 || currentTransitionIdx <= lastTransitionIndexRef.current) {
      return;
    }

    const currentTransition = scenario.transitions[currentTransitionIdx];
    const currentCount = scoreManager.currentCount;

     if (currentCount >= currentTransition.threshold) {
       lastTransitionIndexRef.current = currentTransitionIdx;
       lastTriggeredModeRef.current = gameMode;
       onModeChange(currentTransition.targetMode);
       gameManager.changeGameMode(getGameOptionsForMode(currentTransition.targetMode));
     }
  }, [gameManager.scoreManager.currentCount, gameMode, gameManager, scenario, gameManager.gameStatus, gameManager.scoreManager.score]);

  useEffect(() => {
    lastTransitionIndexRef.current = -1;
    triggeredScoreTransitionsRef.current.clear();
    lastTriggeredModeRef.current = null;
  }, [scenario.id]);
};
