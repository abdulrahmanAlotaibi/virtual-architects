import { useSyncExternalStore } from "react";

const RM = "(prefers-reduced-motion: reduce)";

/** The reduced-motion setting, kept live: turning it on mid-session stops the motion. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (fn) => {
      const mq = window.matchMedia(RM);
      mq.addEventListener("change", fn);
      return () => mq.removeEventListener("change", fn);
    },
    () => window.matchMedia(RM).matches,
    () => false,
  );
}
