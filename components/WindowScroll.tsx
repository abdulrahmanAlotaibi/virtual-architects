"use client";

import { useEffect } from "react";

const WIDE = "(min-width: 1100px)";
const KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);

// On wide screens the page scrolls inside the app window, not the document. Until something
// in the window has focus, the browser sends scroll keys to the document, which cannot
// scroll; this hands the first such key, and focus, to the window.
export default function WindowScroll() {
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const onKey = (e: KeyboardEvent) => {
      if (!mq.matches || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || !KEYS.has(e.key)) return;
      const active = document.activeElement;
      if (active && active !== document.body && active !== document.documentElement) return;
      const win = document.getElementById("win-body");
      if (!win) return;
      e.preventDefault();
      win.focus({ preventScroll: true });
      const page = win.clientHeight * 0.85;
      if (e.key === "Home") win.scrollTo({ top: 0 });
      else if (e.key === "End") win.scrollTo({ top: win.scrollHeight });
      else {
        const by = e.key === "ArrowDown" ? 40 : e.key === "ArrowUp" ? -40 : e.key === "PageUp" || (e.key === " " && e.shiftKey) ? -page : page;
        win.scrollBy({ top: by });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
