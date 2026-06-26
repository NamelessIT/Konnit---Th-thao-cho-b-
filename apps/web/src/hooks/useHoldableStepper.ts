import { useRef, useEffect, useCallback } from "react";
import { throttle } from "@/lib/shop/timing";

interface UseHoldableStepperOptions {
  min?: number;
  max?: number;
  step?: number;
  delay?: number; // initial delay before continuous stepping starts (ms)
  interval?: number; // interval for continuous stepping (ms)
  throttleMs?: number; // throttle time to rate limit updates (ms)
}

export function useHoldableStepper(
  currentValue: number,
  onValueChange: (newValue: number) => void,
  options?: UseHoldableStepperOptions,
) {
  const {
    min = 1,
    max = Infinity,
    step = 1,
    delay = 1000, // 1 second delay
    interval = 100, // tick every 100ms
    throttleMs = 150, // rate limit state updates to every 150ms
  } = options || {};

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentValueRef = useRef(currentValue);

  // Keep currentValueRef updated to avoid stale closure issues
  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const doUpdate = useCallback(
    (delta: number) => {
      const nextVal = currentValueRef.current + delta;
      const clampedVal = Math.min(max, Math.max(min, nextVal));
      if (clampedVal !== currentValueRef.current) {
        onValueChange(clampedVal);
      }
    },
    [min, max, onValueChange],
  );

  // Apply throttle to rate limit continuous updates
  const throttledUpdate = useCallback(
    throttle((delta: number) => {
      doUpdate(delta);
    }, throttleMs),
    [doUpdate, throttleMs],
  );

  const startHold = useCallback(
    (delta: number) => {
      clearTimers();
      // Perform initial step immediately
      throttledUpdate(delta);

      // Wait 1 second (delay) before starting continuous updates
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          throttledUpdate(delta);
        }, interval);
      }, delay);
    },
    [clearTimers, throttledUpdate, delay, interval],
  );

  const stopHold = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    startHold,
    stopHold,
  };
}

