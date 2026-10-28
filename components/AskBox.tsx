"use client";

import { useEffect, useState } from "react";
import CopyButton from "@/components/CopyButton";
import Mark from "@/components/Mark";
import { useReducedMotion } from "./motion";

type Chip = { id: string; label: string; example: string; tint: number };

// The hero's command box. It types example commands one after another; a chip below it
// pins that command's example in the box, ready to copy. Reduced motion shows the first
// line and never types.
export default function AskBox({ title, hint, lines, chips }: { title: string; hint: string; lines: string[]; chips: Chip[] }) {
  const [text, setText] = useState(lines[0]);
  const [pinned, setPinned] = useState<string | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || pinned || lines.length < 2) return;
    let i = 0;
    let pos = lines[0].length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      const line = lines[i];
      if (deleting) {
        pos = Math.max(0, pos - 3);
        setText(line.slice(0, pos));
        if (pos === 0) {
          deleting = false;
          i = (i + 1) % lines.length;
        }
        timer = setTimeout(step, 18);
      } else {
        const next = lines[i];
        pos++;
        setText(next.slice(0, pos));
        if (pos >= next.length) {
          deleting = true;
          timer = setTimeout(step, 2200);
        } else timer = setTimeout(step, 38 + Math.random() * 40);
      }
    };
    timer = setTimeout(step, 2600);
    return () => {
      clearTimeout(timer);
      setText(lines[0]);
    };
  }, [lines, reduced, pinned]);

  const pin = (c: Chip) => {
    if (pinned === c.id) {
      setPinned(null);
      return;
    }
    setPinned(c.id);
    setText(c.example);
  };

  const shown = pinned ? chips.find((c) => c.id === pinned)!.example : text;
  return (
    <div className="askbox">
      <div className="ask-head">
        <Mark size={28} />
        <h2 className="ask-title">{title}</h2>
      </div>
      <div className="ask-field">
        {/* Screen readers get the whole list; the typing line is decoration until a chip pins it. */}
        <ul className="sr-only" aria-label="Example commands">
          {lines.map((l) => <li key={l}>{l}</li>)}
        </ul>
        <p className="ask-line" aria-hidden={pinned ? undefined : true} aria-live={pinned ? "polite" : undefined} id="ask-line">
          <span className="prompt" aria-hidden="true">❯</span>
          <span>{shown}</span>
          {!pinned && <span className="caret" aria-hidden="true" />}
        </p>
        <div className="ask-foot">
          <span className="ask-tool">Claude Code</span>
          <span className="ask-tool">Copilot Chat</span>
          <span className="grow" />
          <CopyButton text={shown} target="ask-line" />
        </div>
      </div>
      <p className="ask-hint">{hint}</p>
      <div className="ask-chips" role="group" aria-label="Example commands to pin">
        {chips.map((c) => (
          <button key={c.id} type="button" className="ask-chip" aria-pressed={pinned === c.id} onClick={() => pin(c)}>
            <span className="sigil" aria-hidden="true" style={{ background: `var(--tint-${c.tint})`, width: 10, height: 10 }} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
