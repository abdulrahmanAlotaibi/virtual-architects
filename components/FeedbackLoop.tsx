"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { LoopStation } from "@/content/site";
import { useReducedMotion } from "./motion";

const STEP_MS = 3800;
const R = 38; // the ring's radius, in the 100 x 100 viewBox; small enough that side labels fit on a phone
const pad = (v: number) => String(v).padStart(2, "0");

// Where a station sits on the ring, as percentages of the square. Station 0 is at the top.
function place(i: number, n: number) {
  const a = (-90 + (360 / n) * i) * (Math.PI / 180);
  return { left: `${50 + R * Math.cos(a)}%`, top: `${50 + R * Math.sin(a)}%` };
}

type Controls = { change: string; prev: string; next: string; pause: string; play: string };

// The feedback loop as a ring: a pulse walks clockwise from step to step, each step passed
// this lap fills its stretch of the ring in its own color, and the window in the middle names the step, counts the changes, and holds the controls.
// Pointing at a step, or focusing it, holds the loop there; the pause button stops it for
// good. Reduced motion never walks; the steps and the arrows still work.
export default function FeedbackLoop({ label, stations, hint, gives, decide, controls }: {
  label: string; stations: LoopStation[]; hint: string; gives: string; decide: string; controls: Controls;
}) {
  const n = stations.length;
  // Counts up forever, so the pulse always turns forward, never back across the top, and
  // each full lap is one more change.
  const [turn, setTurn] = useState(0);
  const [held, setHeld] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const active = ((turn % n) + n) % n;
  const lap = Math.max(1, Math.floor(turn / n) + 1);
  const s = stations[active];

  useEffect(() => {
    if (reduced || held || paused) return;
    const t = setInterval(() => setTurn((v) => v + 1), STEP_MS);
    return () => clearInterval(t);
  }, [reduced, held, paused]);

  // Move to station i by the shortest forward turn.
  const go = (i: number) => setTurn((v) => v + ((i - (v % n) + n) % n));

  return (
    <figure
      className="loop"
      style={{ "--loop-tint": `var(--tint-${s.tint})`, "--loop-ink": `var(--tint-${s.tint}-ink)` } as CSSProperties}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false); }}
    >
      <p className="eyebrow">{label}</p>
      <div className="loop-ring">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          {/* A sunken groove: dark outer edge, light inner edge, like a classic progress well. */}
          <circle className="loop-track" cx="50" cy="50" r={R} />
          <circle className="loop-edge-lo" cx="50" cy="50" r={R + 3.6} />
          <circle className="loop-edge-hi" cx="50" cy="50" r={R - 3.6} />
          {stations.map((st, k) => (
            <circle
              key={st.id}
              className="loop-done"
              data-on={k < active || undefined}
              cx="50" cy="50" r={R} pathLength={100} transform="rotate(-90 50 50)"
              style={{ stroke: `var(--tint-${st.tint})`, strokeDasharray: `${100 / n} 100`, strokeDashoffset: -(100 * k) / n }}
            />
          ))}
          {/* Cuts the filled arc into blocks. */}
          <circle className="loop-ticks" cx="50" cy="50" r={R} pathLength={100} transform="rotate(-90 50 50)" />
          <g className="loop-arm" style={{ transform: `rotate(${turn * (360 / n)}deg)` }}>
            <rect className="loop-pulse" x="47.6" y={50 - R - 2.4} width="4.8" height="4.8" />
          </g>
        </svg>

        <div className="loop-center">
          <div className="loop-titlebar">
            <span aria-hidden="true">{controls.change} {pad(lap)} · {active + 1}/{n}</span>
            <span className="loop-ctrl">
              <button type="button" aria-label={controls.prev} onClick={() => setTurn((v) => v - 1)}>
                <svg viewBox="0 0 8 8" aria-hidden="true"><path d="M6 1v6L2 4z" /></svg>
              </button>
              {!reduced && (
                <button type="button" aria-label={paused ? controls.play : controls.pause} aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
                  <svg viewBox="0 0 8 8" aria-hidden="true">{paused ? <path d="M2 1v6l5-3z" /> : <path d="M1.5 1h2v6h-2zM4.5 1h2v6h-2z" />}</svg>
                </button>
              )}
              <button type="button" aria-label={controls.next} onClick={() => setTurn((v) => v + 1)}>
                <svg viewBox="0 0 8 8" aria-hidden="true"><path d="M2 1v6l4-3z" /></svg>
              </button>
            </span>
          </div>
          <div className="loop-pane" aria-hidden="true">
            <span className="loop-name" key={s.id}>{s.label}</span>
            <span className="loop-who">{s.who}</span>
            {s.command && <code className="loop-cmd">{s.command}</code>}
          </div>
        </div>

        <ol className="loop-stations">
          {stations.map((st, i) => (
            <li
              key={st.id}
              data-state={i === active ? "now" : i < active ? "done" : "next"}
              style={{ ...place(i, n), "--st-tint": `var(--tint-${st.tint})` } as CSSProperties}
            >
              <button type="button" aria-pressed={i === active} onClick={() => go(i)} onPointerEnter={() => go(i)} onFocus={() => go(i)}>
                <span className="loop-num" aria-hidden="true">{i + 1}</span>
                {st.label}
                <span className="sr-only">: {st.text} {gives}: {st.artifacts.join(", ")}.{st.decides && ` ${decide}: ${st.decides}.`}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <figcaption aria-hidden="true">
        <p className="loop-text" key={s.id}>{s.text}</p>
        <div className="loop-gives">
          <span>{gives}:</span>
          <ul className="loop-tags" key={s.id}>
            {s.artifacts.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
        {s.decides && <p className="loop-decides">{decide}: {s.decides}</p>}
      </figcaption>
      <p className="loop-hint">{hint}</p>
    </figure>
  );
}
