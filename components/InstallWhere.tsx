"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import CopyButton from "@/components/CopyButton";
import InstallIcon from "@/components/InstallIcon";

type Where = { id: string; label: string; text: string; code: string };

// "Where do I type it?" for install step 3: one tab per tool, with the tab keyboard pattern.
export default function InstallWhere({ items }: { items: Where[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    const last = items.length - 1;
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  const item = items[active];
  return (
    <div className="where">
      <div className="where-tabs" role="tablist" aria-label="Where to type it">
        {items.map((w, i) => (
          <button
            key={w.id}
            ref={(el) => { refs.current[i] = el; }}
            id={`where-tab-${w.id}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls="where-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKey}
          >
            <InstallIcon id={w.id} size={16} />
            <span>{w.label}</span>
          </button>
        ))}
      </div>
      <div className="where-panel" id="where-panel" role="tabpanel" aria-labelledby={`where-tab-${item.id}`}>
        <p>{item.text}</p>
        {item.code && (
          <div className="shell">
            <code id={`where-code-${item.id}`}>{item.code}</code>
            <CopyButton text={item.code} target={`where-code-${item.id}`} />
          </div>
        )}
      </div>
    </div>
  );
}
