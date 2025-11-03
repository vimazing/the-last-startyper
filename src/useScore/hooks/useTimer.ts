import { useCallback, useEffect, useRef, useState } from "react";

export type UseTimerReturn = {
  timeValue: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
};

export type UseTimerOptions = {
  /**
   * Interval (in ms) between updates. Defaults to 100ms.
   */
  interval?: number;
};

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { interval = 100 } = options;
  const [timeValue, setTimeValue] = useState(0);

  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offsetRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const update = useCallback(() => {
    if (startTimeRef.current === null) {
      return;
    }

    const now = performance.now();
    setTimeValue(offsetRef.current + (now - startTimeRef.current));
  }, []);

  const startTimer = useCallback(() => {
    if (intervalIdRef.current !== null) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    update();
    intervalIdRef.current = setInterval(update, Math.max(16, interval));
  }, [interval, update]);

  const stopTimer = useCallback(() => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (startTimeRef.current !== null) {
      update();
      offsetRef.current += performance.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
  }, [update]);

  const resetTimer = useCallback(() => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    startTimeRef.current = null;
    offsetRef.current = 0;
    setTimeValue(0);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return {
    timeValue,
    startTimer,
    stopTimer,
    resetTimer,
  };
}
