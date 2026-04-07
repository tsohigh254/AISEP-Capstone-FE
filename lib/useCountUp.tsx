"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export function useCountUp(end: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<any>(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const run = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / Math.max(duration, 1), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(run);
      }
    };

    let timeoutId: any;
    if (delay > 0) {
      timeoutId = setTimeout(() => {
        animationFrame = requestAnimationFrame(run);
      }, delay);
    } else {
      animationFrame = requestAnimationFrame(run);
    }

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [end, duration, delay]);

  return { count, ref };
}

export function AnimatedNumber({
  value,
  duration = 1200,
  delay = 0,
  format,
  className,
}: {
  value: number;
  duration?: number;
  delay?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const { count, ref } = useCountUp(value, duration, delay);
  return (
    <span ref={ref} className={className}>
      {format ? format(count) : count}
    </span>
  );
}
