"use client";

import { useEffect, useRef } from "react";

import styles from "./FlyingParrot.module.css";

// Old fixed pass was a flat `15s linear` left-to-right slide at a constant
// height. Driving position from JS instead lets every pass randomize its
// speed, vertical launch height, and weave shape, so the bird doesn't fly
// the exact same line every time.
const MIN_DURATION_MS = 9000;
const MAX_DURATION_MS = 11500;
const MIN_TOP_PERCENT = 8;
const MAX_TOP_PERCENT = 30;
const MIN_WEAVE_AMPLITUDE = 14;
const MAX_WEAVE_AMPLITUDE = 38;
const MIN_WEAVE_CYCLES = 1.1;
const MAX_WEAVE_CYCLES = 2.6;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function FlyingParrot() {
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const flyer = flyerRef.current;
    if (!flyer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let cancelled = false;

    function runPass() {
      if (cancelled) return;

      const duration = randomBetween(MIN_DURATION_MS, MAX_DURATION_MS);
      const topPercent = randomBetween(MIN_TOP_PERCENT, MAX_TOP_PERCENT);
      const amplitude = randomBetween(MIN_WEAVE_AMPLITUDE, MAX_WEAVE_AMPLITUDE);
      const cycles = randomBetween(MIN_WEAVE_CYCLES, MAX_WEAVE_CYCLES);
      const phase = Math.random() * Math.PI * 2;
      const startTime = performance.now();

      flyer!.style.top = `${topPercent}%`;

      function tick(now: number) {
        if (cancelled) return;
        const progress = Math.min(1, (now - startTime) / duration);
        // Clears fully off-screen on both sides regardless of viewport width.
        const xPercent = 110 - progress * 130;
        const weave = Math.sin(progress * Math.PI * 2 * cycles + phase) * amplitude;

        flyer!.style.left = `${xPercent}%`;
        flyer!.style.transform = `translateY(${weave}px)`;

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          runPass();
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    runPass();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={styles.track} aria-hidden="true">
      <div className={styles.flyer} ref={flyerRef}>
        <div className={styles.bobber}>
          <div className={styles.stage}>
            <picture className={`${styles.frame} ${styles.frameUp}`}>
              <source srcSet="/images/flying-parrot-1.webp" type="image/webp" />
              <img src="/images/flying-parrot-1.png" alt="" width={78} height={98} />
            </picture>
            <picture className={`${styles.frame} ${styles.frameDown}`}>
              <source srcSet="/images/flying-parrot-2.webp" type="image/webp" />
              <img src="/images/flying-parrot-2.png" alt="" width={78} height={98} />
            </picture>
          </div>
        </div>
      </div>
    </div>
  );
}
