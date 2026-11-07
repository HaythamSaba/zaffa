"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";
// The slim `m` entry; the full `motion` component would bundle every feature.
import * as m from "motion/react-m";

/** domAnimation is fetched after hydration, keeping it out of the initial bundle. */
const loadFeatures = () => import("./motion-features").then((mod) => mod.default);

const OFFSET_PX = 12;
const DURATION_S = 0.5;
const STAGGER_S = 0.06;
const MAX_STAGGER_STEPS = 5;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type Props = {
  children: ReactNode;
  /** Render as a list item so card grids keep valid <ul>/<ol> markup. */
  as?: "div" | "li";
  /** Position in a group; adds a small, capped stagger. */
  index?: number;
  className?: string;
};

/**
 * Fades content up 12px the first time it scrolls into view.
 * Only opacity and transform change, so there is no layout shift.
 * With prefers-reduced-motion, MotionConfig drops the movement.
 */
export function Reveal({ children, as = "div", index = 0, className }: Props) {
  const Element = as === "li" ? m.li : m.div;
  const delay = Math.min(index, MAX_STAGGER_STEPS) * STAGGER_S;

  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <Element
          data-reveal=""
          className={className}
          initial={{ opacity: 0, y: OFFSET_PX }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: DURATION_S, ease: EASE_OUT_EXPO, delay }}
        >
          {children}
        </Element>
      </MotionConfig>
    </LazyMotion>
  );
}
