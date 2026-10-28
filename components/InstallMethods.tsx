"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import CopyButton from "@/components/CopyButton";
import InstallIcon from "@/components/InstallIcon";
import type { InstallMethod } from "@/content/site";

// One card tab per way to install, with the tab keyboard pattern. `extra` holds panel content
// rendered on the server, keyed by method id (the zip method's download card).
export default function InstallMethods({ methods, extra }: { methods: InstallMethod[]; extra: Record<string, ReactNode> }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    const last = methods.length - 1;
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

  return (
    <div className="methods">
      <div className="tabs method-tabs" role="tablist" aria-label="Ways to install">
        {methods.map((m, i) => (
          <button
            key={m.id}
            ref={(el) => { refs.current[i] = el; }}
            id={`method-tab-${m.id}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`method-panel-${m.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKey}
          >
            <span className="tab-icon"><InstallIcon id={m.id} /></span>
            <span className="tab-text">
              <span className="tab-label">{m.label}</span>
              <span className="tab-hint">{m.hint}</span>
            </span>
          </button>
        ))}
      </div>
      {methods.map((m, i) => (
        <div
          key={m.id}
          className="method-panel"
          id={`method-panel-${m.id}`}
          role="tabpanel"
          aria-labelledby={`method-tab-${m.id}`}
          hidden={i !== active}
        >
          {extra[m.id]}
          {m.intro && <p>{m.intro}</p>}
          {m.blocks.map((b, j) => (
            <div key={j} className="method-block">
              {b.label && <h4>{b.label}</h4>}
              <div className={b.chat ? "shell chat" : b.plain ? "shell plain" : "shell"}>
                <code id={`method-code-${m.id}-${j}`}>{b.code}</code>
                <CopyButton text={b.code} target={`method-code-${m.id}-${j}`} />
              </div>
            </div>
          ))}
          {m.note && <p className="method-note">{m.note}</p>}
        </div>
      ))}
    </div>
  );
}
