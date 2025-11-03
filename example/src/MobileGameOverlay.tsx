import type { GameStatus } from "@vimazing/vim-maze";
import type { UseScoreType } from "@vimazing/vim-maze";

type MobileGameOverlayProps = {
  gameStatus: GameStatus;
  scoreManager: UseScoreType;
};

export const MobileGameOverlay = ({ gameStatus, scoreManager }: MobileGameOverlayProps) => {
  // 🧠 Only show overlay when the game has ended
  if (['started', 'hasKey'].includes(gameStatus)) return null;
  // console.log('gameStatus:', gameStatus)

  return (
    <GameOverlayContainer>
      {gameStatus === "waiting" && <GameWaitingContent />}
      {gameStatus === "game-over" && <GameOverContent />}
      {gameStatus === "game-won" && <GameWonContent scoreManager={scoreManager} />}
    </GameOverlayContainer>
  );
};

export const GameWaitingContent = () => {
  return (
    <div
      className="text-[#c8d3f5] text-[1em] font-mono text-center select-none"
      style={{ textShadow: "2px 2px 4px rgba(27, 29, 43, 0.9)" }}
    >
      <div className="flex flex-col gap-3">
        <p className="text-[1.5rem]">Press here to play</p>
        <p>all the vim motions <br /> available on desktop</p>
      </div>
    </div>
  );
};

export const GameWonContent = ({ scoreManager }: { scoreManager: UseScoreType }) => {
  const finalScore = scoreManager.finalScore ?? 0;

  return (
    <div
      className="text-[#c8d3f5] text-[1em] grid gap-4 font-mono uppercase text-center select-none"
      style={{ textShadow: "2px 2px 4px rgba(27, 29, 43, 0.9)" }}
    >
      <p className="text-[#c3e88d]">Congratulations!</p>
      <p>Final Score:</p>
      <p className="text-[#82aaff] text-[2.5em]">{finalScore.toLocaleString()}</p>
      <p className="text-[#828bb8] text-[0.65em] normal-case">
        <span className="text-[#c099ff]">min</span>
        <span className="text-[#c8d3f5]">(</span>
        <span className="text-[#ff966c]">100000</span>
        <span className="text-[#c8d3f5]">, (</span>
        <span className="text-[#82aaff]">optimalTime</span>
        <span className="text-[#c8d3f5]"> / </span>
        <span className="text-[#82aaff]">actualTime</span>
        <span className="text-[#c8d3f5]">) * </span>
        <span className="text-[#ff966c]">100000</span>
        <span className="text-[#c8d3f5]">)</span>
      </p>
      <p className="text-[#828bb8]">Press to play again</p>
    </div>
  );
};

export const GameOverContent = () => {
  return (
    <div
      className="text-[#ff757f] text-[5em] font-mono uppercase text-center select-none"
      style={{ textShadow: "2px 2px 4px rgba(27, 29, 43, 0.9)" }}
    >
      Game Over
    </div>
  );
};

export const GameOverlayContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      className="
        absolute inset-0
        flex justify-center items-center
        z-40
        pointer-events-none
      "
      style={{
        backgroundColor: 'rgba(27, 29, 43, 0.75)',
        backdropFilter: 'blur(1px)'
      }}
    >
      {children}
    </div>
  );
};


