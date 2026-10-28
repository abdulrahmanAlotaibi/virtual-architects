"use client";

import { useEffect, useRef } from "react";
import type { NavLink } from "@/content/site";

// The section links for narrow screens. A native <details> menu, so it opens without
// JavaScript; with it, Esc, a link click or a click outside closes it.
export default function NavMenu({ links }: { links: NavLink[] }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const close = (focus: boolean) => {
      if (!d.open) return;
      d.open = false;
      if (focus) d.querySelector("summary")?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && d.open) {
        e.preventDefault();
        close(true);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (d.open && !d.contains(e.target as Node)) close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <details className="menu" ref={ref}>
      <summary className="icon-btn" aria-label="Menu" title="Menu">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="2" y="3" width="12" height="2" fill="currentColor" />
          <rect x="2" y="7" width="12" height="2" fill="currentColor" />
          <rect x="2" y="11" width="12" height="2" fill="currentColor" />
        </svg>
      </summary>
      <div className="menu-panel">
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => ref.current && (ref.current.open = false)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
