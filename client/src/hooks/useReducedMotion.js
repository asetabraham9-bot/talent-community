import { useReducedMotion as useFramerReducedMotion } from "framer-motion";

/**
 * Returns true when the user has requested reduced motion.
 * Use this to conditionally apply animations.
 */
export function useReducedMotion() {
  return useFramerReducedMotion() ?? false;
}
