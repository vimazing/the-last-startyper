import { useState, useEffect, useRef } from "react";
import { useGame, type GameMode } from "@vimazing/typing-chud";
import "@vimazing/typing-chud/game.css";
import { useKeyBindings } from "./useKeyBindings";
import { testScenarios, getScenario, getScenarioNames, type TestScenario } from "./testStateMachines";

function App() {
   const [scenarioId, setScenarioId] = useState<string>("progressive");
   const scenario = getScenario(scenarioId);
   const [gameMode, setGameMode] = useState<GameMode>(scenario.initialMode);
   const gameManager = useGame({ gameMode }, useKeyBindings);
   const { containerRef, gameStatus, scoreManager } = gameManager;
   const lastTransitionIndexRef = useRef<number>(-1);

   useEffect(() => {
     if (gameStatus !== "started") return;

     const currentTransitionIdx = scenario.transitions.findIndex((t) => t.fromMode === gameMode);
     console.log(`[DEBUG] gameMode=${gameMode}, currentTransitionIdx=${currentTransitionIdx}, lastTransitionIndex=${lastTransitionIndexRef.current}`);
     
     if (currentTransitionIdx === -1 || currentTransitionIdx <= lastTransitionIndexRef.current) {
       console.log(`[DEBUG] SKIPPING - already processed or no transition found`);
       return;
     }

     const currentTransition = scenario.transitions[currentTransitionIdx];
     const currentCount = scoreManager.currentCount;
     
     console.log(`[DEBUG] currentCount=${currentCount}, threshold=${currentTransition.threshold}, lettersCompleted=${scoreManager.lettersCompleted}, wordsCompleted=${scoreManager.wordsCompleted}, sentencesCompleted=${scoreManager.sentencesCompleted}`);
     
     if (currentCount >= currentTransition.threshold) {
       console.log(`[DEBUG] TRIGGERING TRANSITION: ${currentTransition.fromMode} -> ${currentTransition.targetMode}`);
       lastTransitionIndexRef.current = currentTransitionIdx;
       setGameMode(currentTransition.targetMode);
       gameManager.changeGameMode({ gameMode: currentTransition.targetMode });
     }
   }, [scoreManager.currentCount, gameMode, gameManager, scenario, gameStatus, scoreManager.lettersCompleted, scoreManager.wordsCompleted, scoreManager.sentencesCompleted]);

   useEffect(() => {
     lastTransitionIndexRef.current = -1;
   }, [scenarioId]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

   return (
     <div className="relative mx-auto my-4 w-fit space-y-4">
       <div className="space-y-2">
         <h1 className="text-2xl font-bold text-center">Typing Chud</h1>
         
         <div className="space-y-2">
           <div className="text-center">
             <label className="text-xs text-muted-foreground">Test Scenario:</label>
             <select
               value={scenarioId}
               onChange={(e) => {
                 setScenarioId(e.target.value);
                 const newScenario = getScenario(e.target.value);
                 setGameMode(newScenario.initialMode);
                 gameManager.changeGameMode({ gameMode: newScenario.initialMode });
               }}
               className="w-full px-2 py-1 rounded text-sm bg-muted text-foreground border border-muted-foreground"
             >
               {getScenarioNames().map(({ id, name }) => (
                 <option key={id} value={id}>
                   {name}
                 </option>
               ))}
             </select>
             <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
           </div>

           <div className="text-center">
             <div className="text-xs text-muted-foreground mb-2">Mode Selection:</div>
             <div className="flex gap-2 justify-center text-sm">
               {(['letters', 'words', 'sentences', 'paragraphs'] as const).map((mode) => (
                 <button
                   key={mode}
                   onClick={(e) => {
                     setGameMode(mode);
                     gameManager.changeGameMode({ gameMode: mode });
                     e.currentTarget.blur();
                   }}
                   className={`px-3 py-1 rounded capitalize font-medium transition ${gameMode === mode
                     ? 'bg-blue-600 text-white'
                     : 'bg-muted text-foreground hover:bg-blue-500 hover:text-white'
                     }`}
                 >
                   {mode}
                 </button>
               ))}
             </div>
           </div>
         </div>
       </div>

       <div className="grid grid-cols-8 gap-2 justify-center text-sm font-mono">
         <div className="px-3 py-1 bg-muted rounded">
           <div className="text-xs text-muted-foreground">Time</div>
           <div className="font-bold">{formatTime(scoreManager.timeValue)}</div>
         </div>
         <div className="px-3 py-1 bg-muted rounded">
           <div className="text-xs text-muted-foreground">Score</div>
           <div className="font-bold">{scoreManager.score}</div>
         </div>
         <div className="px-3 py-1 bg-green-900 rounded">
           <div className="text-xs text-green-200">Correct</div>
           <div className="font-bold text-green-100">{scoreManager.correct}</div>
         </div>
         <div className="px-3 py-1 bg-yellow-900 rounded">
           <div className="text-xs text-yellow-200">Missed</div>
           <div className="font-bold text-yellow-100">{scoreManager.missed}</div>
         </div>
         <div className="px-3 py-1 bg-red-900 rounded">
           <div className="text-xs text-red-200">Deaths</div>
           <div className="font-bold text-red-100">{scoreManager.deaths}</div>
         </div>
         <div className="px-3 py-1 bg-purple-900 rounded">
           <div className="text-xs text-purple-200">Current</div>
           <div className="font-bold text-purple-100">{scoreManager.currentCount}</div>
         </div>
         <div className="px-3 py-1 bg-cyan-900 rounded">
           <div className="text-xs text-cyan-200">Total</div>
           <div className="font-bold text-cyan-100">{scoreManager.lettersCompleted + scoreManager.wordsCompleted + scoreManager.sentencesCompleted + scoreManager.paragraphsCompleted}</div>
         </div>
         <div className="px-3 py-1 bg-muted rounded">
           <div className="text-xs text-muted-foreground">Keystrokes</div>
           <div className="font-bold">{scoreManager.totalKeystrokes}</div>
         </div>
       </div>

       <div className="grid grid-cols-4 gap-2 justify-center text-sm font-mono">
         <div className="px-3 py-1 bg-blue-900 rounded">
           <div className="text-xs text-blue-200">Letters</div>
           <div className="font-bold text-blue-100">{scoreManager.lettersCompleted}</div>
         </div>
         <div className="px-3 py-1 bg-blue-900 rounded">
           <div className="text-xs text-blue-200">Words</div>
           <div className="font-bold text-blue-100">{scoreManager.wordsCompleted}</div>
         </div>
         <div className="px-3 py-1 bg-blue-900 rounded">
           <div className="text-xs text-blue-200">Sentences</div>
           <div className="font-bold text-blue-100">{scoreManager.sentencesCompleted}</div>
         </div>
         <div className="px-3 py-1 bg-blue-900 rounded">
           <div className="text-xs text-blue-200">Paragraphs</div>
           <div className="font-bold text-blue-100">{scoreManager.paragraphsCompleted}</div>
         </div>
       </div>

      <div ref={containerRef} className="relative" />

      <div className="text-center text-sm text-muted-foreground">
        {gameStatus === "waiting" && <p>Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to start</p>}
        {gameStatus === "started" && <p>Type letters • Press <kbd className="px-2 py-1 bg-muted rounded">esc</kbd> to quit</p>}
        {gameStatus === "game-over" && <p>Game Over! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to restart</p>}
        {gameStatus === "game-won" && <p>You Won! Press <kbd className="px-2 py-1 bg-muted rounded">space</kbd> to restart</p>}
      </div>
    </div>
  );
}

export default App;
