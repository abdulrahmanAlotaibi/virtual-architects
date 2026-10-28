"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";
const ORDER: Theme[] = ["light", "dark", "system"];

// Light by default (the page ships with data-theme="light"). Cycles light, dark, system; the
// choice is remembered in this browser only. A script in the layout's <head> applies a saved
// choice before first paint; this reads it back.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = document.documentElement.getAttribute("data-theme");
    setTheme(t === "dark" || t === "light" ? t : "system");
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const title = `Theme: ${theme}`;
  const label = `Theme: ${theme}. Switch to ${next === "system" ? "the system theme" : next}`;
  return (
    <button className="icon-btn" type="button" title={title} aria-label={label} onClick={() => apply(next)}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2" y="2" width="5" height="5" fill="currentColor" />
        <rect x="9" y="2" width="5" height="5" fill="currentColor" opacity={theme === "dark" ? 1 : 0.35} />
        <rect x="2" y="9" width="5" height="5" fill="currentColor" opacity={theme === "light" ? 1 : 0.35} />
        <rect x="9" y="9" width="5" height="5" fill="currentColor" />
      </svg>
    </button>
  );
}
