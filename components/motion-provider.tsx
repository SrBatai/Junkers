"use client";

import { MotionConfig } from "motion/react";

/** Every Motion animation on the site honours prefers-reduced-motion. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
