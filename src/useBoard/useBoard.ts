import { useRef } from "react";

export function useBoard() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const renderBoard = () => {
    const container = containerRef.current;
    if (!container) return;

    // TODO: Implement board rendering
  };

  return {
    containerRef,
    renderBoard,
  };
}

export type UseBoardType = ReturnType<typeof useBoard>;
