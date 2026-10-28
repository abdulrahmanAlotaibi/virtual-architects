"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent } from "react";
import CopyButton from "@/components/CopyButton";
import { edges, nodes, scenarios, type Anchor, type FlowEdge, type FlowNode } from "@/content/workflow";
import { useReducedMotion } from "./motion";

const TRAVEL_MS = 750;
const END_EXTRA_MS = 1400;
const key = (e: Pick<FlowEdge, "from" | "to">) => `${e.from}>${e.to}`;
const byId: Record<string, FlowNode> = Object.fromEntries(nodes.map((n) => [n.id, n]));
const membersOf = (id: string) => byId[id].members ?? [id];
const drawn = nodes.filter((n) => !n.members);
const edgeKeys = new Set(edges.map(key));
const pad = (n: number) => String(n).padStart(2, "0");

// How long a step stays up while playing: long enough to read it.
const words = (s: string) => s.trim().split(/\s+/).length;
export const dwell = (n: FlowNode) => Math.min(10000, Math.max(4000, 2400 + words(n.text) * 260 + (n.command ? 800 : 0)));

// Where two wires meet, a pixel junction square is drawn, so a merge never looks like a crossing.
const inCount: Record<string, number> = {};
const outBottom: Record<string, number> = {};
for (const e of edges) {
  if (e.back) continue;
  inCount[e.to] = (inCount[e.to] ?? 0) + 1;
  if (e.a === "b") outBottom[e.from] = (outBottom[e.from] ?? 0) + 1;
}

type Pt = { x: number; y: number };
type Geom = { d: string; lx: number; ly: number; anchor: "start" | "end" | "middle"; rotate?: boolean; joins: Pt[] };
type EdgeState = "off" | "on" | "live";
const RANK: Record<EdgeState, number> = { off: 0, on: 1, live: 2 };

// Edges between two consecutive steps of a path (a step can be two nodes at once).
function edgesBetween(a: string, b: string): string[] {
  const out: string[] = [];
  for (const x of membersOf(a)) for (const y of membersOf(b)) if (edgeKeys.has(`${x}>${y}`)) out.push(`${x}>${y}`);
  return out;
}

// The workflow as a live diagram: pick a scenario, and pixel packets walk its path while the
// panel explains each step. On phones the same path is a vertical list.
export default function Pipeline() {
  const [sIdx, setSIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hold, setHold] = useState(false);
  const [peek, setPeek] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [geom, setGeom] = useState<Record<string, Geom>>({});
  const [overflow, setOverflow] = useState(false);
  const [base, setBase] = useState("");
  const reduced = useReducedMotion();

  const flowRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const packetRefs = useRef<Record<string, SVGRectElement | null>>({});
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const scenario = scenarios[sIdx];
  const path = scenario.path;
  const atEnd = step >= path.length - 1;
  const current = byId[path[step]];
  const shown = peek ? byId[peek] : current;
  const answer = peek ? undefined : scenario.answers[current.id];
  const running = playing && !hold && !peek;
  const ms = dwell(current) + (atEnd ? END_EXTRA_MS : 0);

  const activeIds = useMemo(() => new Set(membersOf(path[step])), [path, step]);
  const stepOf = useMemo(() => {
    const m = new Map<string, number>();
    path.forEach((id, i) => membersOf(id).forEach((x) => m.set(x, i)));
    return m;
  }, [path]);
  const pathEdges = useMemo(() => new Set(path.slice(1).flatMap((to, i) => edgesBetween(path[i], to))), [path]);
  const liveEdges = useMemo(() => (step > 0 ? edgesBetween(path[step - 1], path[step]) : []), [path, step]);
  const liveKey = liveEdges.join(",");
  const stateOf = useCallback(
    (k: string): EdgeState => (liveEdges.includes(k) ? "live" : pathEdges.has(k) ? "on" : "off"),
    [liveEdges, pathEdges],
  );
  // Off edges paint first and the live path last, so the taken path is never cut by a grey wire.
  const sorted = useMemo(() => [...edges].sort((x, y) => RANK[stateOf(key(x))] - RANK[stateOf(key(y))]), [stateOf]);
  const offNodes = drawn.filter((n) => !stepOf.has(n.id));

  // Orthogonal wires with rounded elbows: each corner becomes a short quadratic curve.
  const poly = (pts: Pt[], radius = 8): string => {
    const p = pts.filter((q, i) => i === 0 || q.x !== pts[i - 1].x || q.y !== pts[i - 1].y);
    let d = `M${p[0].x},${p[0].y}`;
    for (let i = 1; i < p.length - 1; i++) {
      const a = p[i - 1], b = p[i], c = p[i + 1];
      const r1 = Math.min(radius, Math.hypot(b.x - a.x, b.y - a.y) / 2, Math.hypot(c.x - b.x, c.y - b.y) / 2);
      const u = (from: Pt, to: Pt, len: number) => {
        const L = Math.hypot(to.x - from.x, to.y - from.y) || 1;
        return { x: from.x + ((to.x - from.x) / L) * len, y: from.y + ((to.y - from.y) / L) * len };
      };
      const p1 = u(b, a, r1), p2 = u(b, c, r1);
      d += ` L${p1.x},${p1.y} Q${b.x},${b.y} ${p2.x},${p2.y}`;
    }
    const z = p[p.length - 1];
    return d + ` L${z.x},${z.y}`;
  };

  // Route every edge between the measured node boxes.
  const measure = useCallback(() => {
    const flow = flowRef.current;
    const box = flow?.getBoundingClientRect();
    if (!flow || !box || box.width === 0) return;
    const pt = (id: string, a: Anchor): Pt => {
      const r = nodeRefs.current[id]?.getBoundingClientRect();
      if (!r) return { x: 0, y: 0 };
      const x = r.left - box.left, y = r.top - box.top;
      return a === "t" ? { x: x + r.width / 2, y } : a === "b" ? { x: x + r.width / 2, y: y + r.height }
        : a === "l" ? { x, y: y + r.height / 2 } : { x: x + r.width, y: y + r.height / 2 };
    };
    const out: Record<string, Geom> = {};
    for (const e of edges) {
      const s = pt(e.from, e.a), t = pt(e.to, e.b);
      const joins: Pt[] = [];
      let g: Geom;
      if (e.back) {
        const x = Math.min(s.x, t.x) - 22;
        g = { d: poly([s, { x, y: s.y }, { x, y: t.y }, t]), lx: x - 5, ly: (s.y + t.y) / 2, anchor: "middle", rotate: true, joins };
      } else if (e.a === "b" && e.b === "t") {
        const lx = e.side === "l" ? s.x - 8 : s.x + 8;
        const anchor = e.side === "l" ? "end" : "start";
        if (Math.abs(s.x - t.x) < 2) {
          g = { d: poly([s, { x: s.x, y: t.y }]), lx, ly: s.y + 14, anchor, joins };
        } else {
          const mid = (s.y + t.y) / 2;
          if ((outBottom[e.from] ?? 0) > 1) joins.push({ x: s.x, y: mid });
          if ((inCount[e.to] ?? 0) > 1) joins.push({ x: t.x, y: mid });
          g = { d: poly([s, { x: s.x, y: mid }, { x: t.x, y: mid }, t]), lx: t.x + 8, ly: mid - 6, anchor: "start", joins };
        }
      } else if ((e.a === "r" || e.a === "l") && e.b === "t") {
        if ((inCount[e.to] ?? 0) > 1) joins.push({ x: t.x, y: s.y });
        g = { d: poly([s, { x: t.x, y: s.y }, t]), lx: e.a === "r" ? s.x + 8 : s.x - 8, ly: s.y - 7, anchor: e.a === "r" ? "start" : "end", joins };
      } else if (e.a === "b" && (e.b === "r" || e.b === "l")) {
        g = { d: poly([s, { x: s.x, y: t.y }, t]), lx: s.x + 8, ly: s.y + 14, anchor: "start", joins };
      } else {
        const mx = (s.x + t.x) / 2;
        const d = Math.abs(s.y - t.y) < 2 ? poly([s, { x: t.x, y: s.y }]) : poly([s, { x: mx, y: s.y }, { x: mx, y: t.y }, t]);
        g = { d, lx: s.x + 8, ly: s.y - 7, anchor: "start", joins };
      }
      out[key(e)] = g;
    }
    setGeom(out);
    const sc = scrollRef.current;
    if (sc) setOverflow(sc.scrollWidth > sc.clientWidth + 1);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (flowRef.current) ro.observe(flowRef.current);
    if (scrollRef.current) ro.observe(scrollRef.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  // Move a packet along each edge into the current step. A parallel step gets two.
  useEffect(() => {
    for (const [k, p] of Object.entries(packetRefs.current)) if (p && !liveEdges.includes(k)) p.style.opacity = "0";
    const live = liveEdges
      .map((k) => ({ p: packetRefs.current[k], el: pathRefs.current[k] }))
      .filter((x): x is { p: SVGRectElement; el: SVGPathElement } => !!x.p && !!x.el);
    if (!live.length) return;
    const place = (f: number) => {
      for (const { p, el } of live) {
        const q = el.getPointAtLength(el.getTotalLength() * f);
        p.setAttribute("x", String(q.x - 5));
        p.setAttribute("y", String(q.y - 5));
        p.style.opacity = "1";
      }
    };
    if (reduced) {
      place(1);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const f = Math.min(1, (now - t0) / TRAVEL_MS);
      place(1 - (1 - f) * (1 - f));
      if (f < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // liveKey stands for liveEdges.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveKey, geom, reduced]);

  // Autoplay: stay on each step for its reading time, then move on; at the end, go to the next scenario.
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      if (atEnd) {
        setSIdx((i) => (i + 1) % scenarios.length);
        setStep(0);
      } else setStep((s) => s + 1);
    }, ms);
    return () => clearTimeout(t);
  }, [running, atEnd, ms, step, sIdx]);

  // Reduced motion, even when switched on mid-session: no autoplay.
  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  // Start playing the first time the diagram scrolls into view.
  useEffect(() => {
    if (reduced || !rootRef.current) return;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !userPaused.current) setPlaying(true);
      if (!en.isIntersecting) setPlaying(false);
    }, { threshold: 0.25 });
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [reduced]);

  // Deep links: #workflow/<scenario> plays it, #workflow/<scenario>/<step> opens that step.
  useEffect(() => {
    setBase(window.location.href.split("#")[0]);
    const read = () => {
      const m = window.location.hash.match(/^#workflow\/([\w-]+)(?:\/(\d+))?$/);
      if (!m) return;
      const i = scenarios.findIndex((s) => s.id === m[1]);
      if (i < 0) return;
      setPeek(null);
      setSIdx(i);
      if (m[2]) {
        setStep(Math.max(0, Math.min(scenarios[i].path.length - 1, Number(m[2]) - 1)));
        userPaused.current = true;
        setPlaying(false);
      } else {
        setStep(0);
        userPaused.current = false;
        if (!reducedRef.current) setPlaying(true);
      }
      document.getElementById("workflow")?.scrollIntoView();
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const writeHash = (i: number, s: number) => {
    try {
      window.history.replaceState(null, "", `#workflow/${scenarios[i].id}/${s + 1}`);
    } catch {}
  };
  // Any manual move stops the show, so what you picked stays on screen.
  const takeOver = () => {
    userPaused.current = true;
    setPlaying(false);
  };
  const go = (s: number) => {
    const n = Math.max(0, Math.min(path.length - 1, s));
    takeOver();
    setPeek(null);
    setStep(n);
    writeHash(sIdx, n);
  };
  const pick = (i: number, s = 0) => {
    takeOver();
    setPeek(null);
    setSIdx(i);
    setStep(s);
    writeHash(i, s);
  };
  const peekAt = (id: string) => {
    takeOver();
    setPeek(id);
  };
  const toggle = () => {
    setPeek(null);
    if (playing) {
      takeOver();
      return;
    }
    userPaused.current = false;
    if (atEnd) setStep(0);
    setPlaying(true);
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = scenarios.length;
    const to = e.key === "ArrowRight" ? (sIdx + 1) % n : e.key === "ArrowLeft" ? (sIdx - 1 + n) % n
      : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    e.stopPropagation();
    pick(to);
    tabRefs.current[to]?.focus();
  };

  // Shortcuts while focus is inside the pipeline: arrows step, Home and End, P plays, a number picks a scenario.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, [role=tablist]")) return;
    const scrollable = t === scrollRef.current;
    let done = true;
    if (e.key === "ArrowRight" && !scrollable) go(step + 1);
    else if (e.key === "ArrowLeft" && !scrollable) go(step - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(path.length - 1);
    else if (e.key === "p" || e.key === "P") toggle();
    else if (/^[1-9]$/.test(e.key) && Number(e.key) <= scenarios.length) pick(Number(e.key) - 1);
    else done = false;
    if (done) e.preventDefault();
  };

  // Hold the show while a keyboard user is on the diagram or the tabs, so nothing moves under them.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t.closest(".flow-scroll, .timeline, [role=tablist]") && t.matches(":focus-visible")) setHold(true);
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as HTMLElement | null;
    if (!next || !next.closest(".flow-scroll, .timeline, [role=tablist]")) setHold(false);
  };

  const seeIn = peek ? scenarios.findIndex((s) => s.path.some((id) => membersOf(id).includes(peek))) : -1;
  const seeStep = seeIn >= 0 ? scenarios[seeIn].path.findIndex((id) => membersOf(id).includes(peek!)) : 0;
  const nextScenario = scenarios[(sIdx + 1) % scenarios.length];
  const link = `${base}#workflow/${scenario.id}/${step + 1}`;
  const nodeState = (id: string) => {
    const st = stepOf.get(id);
    if (st === undefined) return "off";
    return activeIds.has(id) ? "active" : st < step ? "done" : "";
  };

  return (
    <div ref={rootRef} className="pipe-root" onKeyDown={onKey} onFocus={onFocus} onBlur={onBlur}>
      <div className="tabs" role="tablist" aria-label="Scenario" onKeyDown={onTabKey}>
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => { tabRefs.current[i] = el; }}
            id={`scn-tab-${s.id}`}
            role="tab"
            type="button"
            aria-selected={i === sIdx}
            aria-controls="scenario-panel"
            tabIndex={i === sIdx ? 0 : -1}
            onClick={() => pick(i)}
          >
            <span className="tab-num" aria-hidden="true">{i + 1}</span>
            <span className="tab-text">
              <span className="tab-label">{s.label}</span>
              <span className="tab-hint">{s.hint}</span>
            </span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id="scenario-panel" aria-labelledby={`scn-tab-${scenario.id}`}>
        <p className="scenario-note">{scenario.note}</p>

        <div className="pipeline">
          <div
            className="flow-scroll"
            ref={scrollRef}
            role="region"
            aria-label="Workflow diagram"
            tabIndex={overflow ? 0 : undefined}
            data-overflow={overflow || undefined}
          >
            <div className="flow" ref={flowRef}>
              <svg aria-hidden="true">
                <defs>
                  {(["off", "on", "live"] as const).map((s) => (
                    <marker key={s} id={`arrow-${s}`} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth={s === "off" ? 9 : 11} markerHeight={s === "off" ? 9 : 11} orient="auto-start-reverse">
                      <path d="M0,0.5 L10,5 L0,9.5 L2.6,5 z" className={`arrowhead ${s}`} />
                    </marker>
                  ))}
                </defs>
                {sorted.map((e) => {
                  const k = key(e);
                  const g = geom[k];
                  if (!g) return null;
                  const s = stateOf(k);
                  return (
                    <g key={k} className={`edge-g ${s}`}>
                      <path
                        ref={(el) => { pathRefs.current[k] = el; }}
                        d={g.d}
                        className={`edge ${s === "off" ? "" : s}${e.back ? " back" : ""}`}
                        markerEnd={`url(#arrow-${s})`}
                      />
                      {s === "live" && !e.back && <path d={g.d} className="edge-flow" />}
                      {g.joins.map((j) => <rect key={`${j.x},${j.y}`} className="join" x={j.x - 3} y={j.y - 3} width="6" height="6" />)}
                      {e.label && (
                        <text
                          x={g.lx}
                          y={g.ly}
                          textAnchor={g.anchor}
                          transform={g.rotate ? `rotate(-90 ${g.lx} ${g.ly})` : undefined}
                          className={`elabel${s !== "off" ? " taken" : ""}`}
                        >
                          {e.label}
                        </text>
                      )}
                    </g>
                  );
                })}
                {liveEdges.map((k) => (
                  <rect key={k} ref={(el) => { packetRefs.current[k] = el; }} width="10" height="10" className="packet" style={{ opacity: 0 }} />
                ))}
              </svg>
              {drawn.map((n) => {
                const st = stepOf.get(n.id);
                const on = st !== undefined;
                const state = nodeState(n.id);
                const ans = on && st <= step ? scenario.answers[n.id] : undefined;
                return (
                  <button
                    key={n.id}
                    type="button"
                    ref={(el) => { nodeRefs.current[n.id] = el; }}
                    className={`node ${n.kind} ${state}${n.optional ? " optional" : ""}${peek === n.id ? " peek" : ""}`}
                    style={{ gridColumn: n.col, gridRow: n.row }}
                    onClick={() => (on ? go(st) : peekAt(n.id))}
                    aria-current={state === "active" ? "step" : undefined}
                    aria-disabled={on ? undefined : true}
                  >
                    {on ? (
                      <span className="step"><span className="sr-only">Step </span>{pad(st + 1)}</span>
                    ) : (
                      <span className="sr-only">Not on this path: </span>
                    )}
                    <span className="nlabel">{n.label}</span>
                    {ans && <span className={`ans${n.kind === "you" ? " you" : ""}`}><span className="sr-only">, answer: </span>{ans.a}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <ol className="timeline" aria-label="Steps on this path">
            {path.map((id, i) => {
              const n = byId[id];
              const ans = i <= step ? scenario.answers[id] : undefined;
              const state = i === step ? "active" : i < step ? "done" : "";
              return (
                <li key={id} className={`tl ${n.kind} ${state}`}>
                  <button type="button" onClick={() => go(i)} aria-current={i === step ? "step" : undefined}>
                    <span className="tl-mark" aria-hidden="true" />
                    <span className="step"><span className="sr-only">Step </span>{pad(i + 1)}</span>
                    <span className="tl-label">
                      {n.label}
                      {n.members && <span className="tag">in parallel</span>}
                    </span>
                    {ans && <span className={`ans${n.kind === "you" ? " you" : ""}`}><span className="sr-only">, answer: </span>{ans.a}</span>}
                  </button>
                </li>
              );
            })}
          </ol>
          {offNodes.length > 0 && (
            <p className="skipped">
              <span>Not on this path:</span>
              {offNodes.map((n) => (
                <button key={n.id} type="button" className="linkish" onClick={() => peekAt(n.id)}>{n.label}</button>
              ))}
            </p>
          )}

          <div className="narration" role="region" aria-label="Step details" data-expanded={expanded || undefined}>
            <header>
              <span>{peek ? "NOT ON THIS PATH" : scenario.label.toUpperCase()}</span>
              <span>{peek ? "" : `STEP ${step + 1} / ${path.length}`}</span>
            </header>
            <div className="scrub" aria-hidden="true">
              {path.map((id, i) => {
                const you = byId[id].kind === "you";
                return (
                  <button
                    key={id}
                    type="button"
                    tabIndex={-1}
                    title={`Step ${i + 1}: ${byId[id].label}`}
                    className={`${i === step && !peek ? "now" : i < step ? "done" : ""}${you ? " you" : ""}`}
                    onClick={() => go(i)}
                  />
                );
              })}
            </div>
            <div className="timer">
              {running && <i key={`${sIdx}-${step}`} style={{ "--dwell": `${ms}ms` } as CSSProperties} />}
            </div>
            <div
              className="body"
              aria-live={running ? "off" : "polite"}
              onPointerEnter={(e) => e.pointerType === "mouse" && setHold(true)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setHold(false)}
            >
              <h3>{shown.title}</h3>
              {answer && (
                <p className="answer-line">
                  <span className={`ans${current.kind === "you" ? " you" : ""}`}>{answer.a}</span>
                  {answer.why && <span>{answer.why}</span>}
                </p>
              )}
              <p className="ntext">{shown.text}</p>
              {shown.checks && (
                <ul className="nchecks">
                  {shown.checks.map((c) => <li key={c}>{c}</li>)}
                </ul>
              )}
              <dl className="kv">
                <dt>Who</dt>
                <dd className={shown.who === "You" ? "who-you" : undefined}>{shown.who}</dd>
                {shown.command && (<><dt>Command</dt><dd><code>{shown.command}</code></dd></>)}
                {shown.output && (<><dt>Writes</dt><dd><code>{shown.output}</code></dd></>)}
                {shown.type && (<><dt>Kotusev</dt><dd>{shown.type}</dd></>)}
              </dl>
              {peek && (
                <p className="peek-actions">
                  {seeIn >= 0 && (
                    <button type="button" className="linkish" onClick={() => pick(seeIn, seeStep)}>
                      See it in {scenarios[seeIn].label} →
                    </button>
                  )}
                  <button type="button" className="linkish" onClick={() => setPeek(null)}>Back to step {step + 1}</button>
                </p>
              )}
              {atEnd && running && (
                <p className="endline">
                  Done. Next up: {nextScenario.label}.{" "}
                  <button type="button" className="linkish" onClick={takeOver}>Stay here</button>
                </p>
              )}
            </div>
            <div className="controls">
              <button className="btn small" type="button" onClick={() => go(step - 1)} disabled={step === 0 && !peek}>Back</button>
              <button className="btn small primary" type="button" onClick={toggle} aria-pressed={playing}>
                {playing ? "Pause" : atEnd ? "Replay" : "Play"}
              </button>
              <button className="btn small" type="button" onClick={() => (atEnd ? pick((sIdx + 1) % scenarios.length) : go(step + 1))}>
                {atEnd ? "Next scenario" : "Next"}
              </button>
              <span className="grow" />
              <button className="btn small only-narrow" type="button" aria-expanded={expanded} onClick={() => setExpanded((x) => !x)}>
                {expanded ? "Less" : "Details"}
              </button>
              <CopyButton text={link} label="Link" className="wide-only" />
            </div>
          </div>
        </div>
        <p className="keys">Keys in the diagram: ← and → step, Home and End, P plays or pauses, 1 to {scenarios.length} pick a scenario.</p>
      </div>
    </div>
  );
}
