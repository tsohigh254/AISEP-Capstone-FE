"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Animated count-up hook. Starts when element enters viewport.
 * @param end   Target number
 * @param duration  Animation duration in ms
 * @param delay Stagger delay in ms (for top-to-bottom cascading)
 */
export function useCountUp(end: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<any>(null);
  const started = useRef(false);

  const animate = useCallback(() => {
    if (started.current) return;
    started.current = true;

    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setCount(Math.round(eased * end));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (delay > 0) {
      setTimeout(run, delay);
    } else {
      run();
    }
  }, [end, duration, delay]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) animate();
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return { count, ref };
}

/**
 * Inline animated number component for dynamic values.
 * Renders a <span> that counts up when it enters the viewport.
 */
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
