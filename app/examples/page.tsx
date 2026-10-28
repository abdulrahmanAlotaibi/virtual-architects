import type { CSSProperties } from "react";
import type { Metadata } from "next";
import ExampleTabs from "@/components/ExampleTabs";
import Sigil from "@/components/Sigil";
import SubPage from "@/components/SubPage";
import { examples, examplesCopy, lanes } from "@/content/examples";
import type { Block, Cell, Example, Lane, RouteNode, Step } from "@/content/examples";

export const metadata: Metadata = {
  title: "Worked examples · Virtual Architects",
  description: examplesCopy.lede,
  openGraph: { title: "Worked examples · Virtual Architects", description: examplesCopy.lede, url: "/examples" },
};

export default function Examples() {
  return (
    <SubPage file="examples.md" current="/examples">
        <header className="page-hero" id="top">
          <div className="wrap">
            <a className="page-back" href="/#workflow">← The workflow</a>
            <p className="eyebrow">{examplesCopy.eyebrow}</p>
            <h1>{examplesCopy.title[0]}<span className="hl">{examplesCopy.title[1]}</span>{examplesCopy.title[2]}</h1>
            <p className="lede">{examplesCopy.lede}</p>
            <ul className="ex-cast" aria-label="Who appears">
              {(Object.keys(lanes) as Lane[]).map((l) => (
                <li key={l}><Sigil tint={lanes[l].tint} size={12} />{lanes[l].name}</li>
              ))}
            </ul>
          </div>
        </header>

        <section className="band ex-band" aria-label="Examples">
          <div className="wrap">
            <ExampleTabs panels={examples.map((e) => ({ id: e.id, label: e.tab, hint: e.hint, content: <Run e={e} /> }))} />
            <p className="ex-disclaimer"><strong>Simulated.</strong> {examplesCopy.disclaimer}</p>
          </div>
        </section>
    </SubPage>
  );
}

function tintVars(lane: Lane): CSSProperties {
  const n = lanes[lane].tint;
  return { "--t": `var(--tint-${n})`, "--t-ink": `var(--tint-${n}-ink)` } as CSSProperties;
}

function Run({ e }: { e: Example }) {
  const decisions = e.steps.filter((s) => s.decision).length;
  const commands = new Set(e.steps.map((s) => s.command.split(" ")[0])).size;
  const created = e.steps.reduce((n, s) => n + s.writes.filter((w) => w.change === "new").length, 0);
  return (
    <div className="ex-run">
      <div className="ex-intro">
        <p className="eyebrow">{e.code} · simulated run</p>
        <h2>{e.title}</h2>
        <p className="lede">{e.summary}</p>
        <ul className="ex-stats">
          <li><strong>{e.steps.length}</strong> steps</li>
          <li><strong>{commands}</strong> commands</li>
          <li><strong>{decisions}</strong> decisions for you</li>
          <li><strong>{created}</strong> new documents</li>
        </ul>
      </div>

      <div className="ex-input">
        <article className="ex-doc" aria-label={`${e.code} requirements`}>
          <div className="ex-doc-top"><strong>{e.code}</strong><span>{e.brsd.file}</span></div>
          <div className="ex-doc-body">
            <h3 className="ex-mini">Business requirements</h3>
            <ul className="ex-reqs">{e.brsd.reqs.map(([id, t]) => <li key={id}><span>{id}</span><span>{t}</span></li>)}</ul>
            <h3 className="ex-mini">Non-functional</h3>
            <ul className="ex-reqs">{e.brsd.nfr.map(([id, t]) => <li key={id}><span>{id}</span><span>{t}</span></li>)}</ul>
          </div>
        </article>
        <details className="ex-file ex-profile">
          <summary>{e.profile.name}<span className="ex-toggle" aria-hidden="true" /></summary>
          <pre className="ex-yaml">{e.profile.lines.join("\n")}</pre>
          <p className="ex-file-note">{e.profile.note}</p>
        </details>
      </div>

      <div>
        <h3 className="ex-mini">The route it took</h3>
        <p className="ex-note">{e.routeNote}</p>
        <ol className="ex-route" aria-label={`Route of ${e.code}`}>
          {e.route.map((n, i) => <li key={i}><RouteBox n={n} id={e.id} /></li>)}
        </ol>
        <p className="ex-legend"><span>Stacked boxes run in parallel</span><span>Dashed boxes are your decisions</span><span>Each box jumps to its step</span></p>
      </div>

      <div className="ex-body">
        <nav className="ex-rail" aria-label={`${e.code} steps`}>
          <ol>
            {e.steps.map((s, i) => (
              <li key={i} style={tintVars(s.lane)}>
                <a href={`#${e.id}-${i + 1}`}>
                  <span className="n">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s.rail}<code>{s.command.split(" ")[0]}</code></span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <ol className="ex-steps">
          {e.steps.map((s, i) => <StepView key={i} s={s} n={i + 1} id={`${e.id}-${i + 1}`} />)}
        </ol>
      </div>

      <div>
        <h3 className="ex-mini">Command coverage</h3>
        <p className="ex-note">All eight architect commands, each used when its trigger appeared. None of them committed anything.</p>
        <div className="ex-table ex-coverage">
          <table>
            <thead><tr><th>Command</th><th>Step</th><th>Triggered by</th><th>Left behind</th></tr></thead>
            <tbody>{e.coverage.map((r) => <tr key={r[0]}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RouteBox({ n, id }: { n: RouteNode; id: string }) {
  if ("parallel" in n) {
    return <div className="ex-par">{n.parallel.map((p, i) => <RouteBox key={i} n={p} id={id} />)}</div>;
  }
  const body = (
    <>
      <span className="cmd">{n.lane === "you" ? `You decide: ${n.cmd.toLowerCase()}` : n.cmd}</span>
      <span className="out">{n.out}</span>
    </>
  );
  const cls = `ex-node${n.lane === "you" ? " gate" : ""}`;
  return n.step
    ? <a className={cls} style={tintVars(n.lane)} href={`#${id}-${n.step}`}>{body}</a>
    : <div className={cls} style={tintVars(n.lane)}>{body}</div>;
}

function StepView({ s, n, id }: { s: Step; n: number; id: string }) {
  return (
    <li className="ex-step" id={id} style={tintVars(s.lane)}>
      <div className="ex-step-head">
        <span className="ex-num">{String(n).padStart(2, "0")}</span>
        <div>
          <p className="ex-lane">{lanes[s.lane].name}</p>
          <h3>{s.title}</h3>
          <p className="ex-why">{s.why}</p>
        </div>
      </div>
      <div className="ex-step-body">
        <div className="ex-cmd">
          <p><span className="prompt" aria-hidden="true">&gt;</span>{s.command}</p>
          <p className="routed">→ {s.routed}</p>
        </div>
        <div className="ex-io">
          <div>
            <h4 className="ex-mini">Reads</h4>
            <ul>{s.reads.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
          <div>
            <h4 className="ex-mini">Writes</h4>
            <ul>{s.writes.map((w) => <li key={w.path} className={w.change}><span className="sr-only">{w.change === "new" ? "New: " : "Changed: "}</span>{w.path}</li>)}</ul>
          </div>
        </div>
        {s.blocks.map((b, i) => <BlockView key={i} b={b} />)}
        {s.decision && (
          <div className="ex-decision">
            <span className="tag">You decide</span>
            <p><strong>{s.decision.verdict}.</strong> {s.decision.text}</p>
          </div>
        )}
      </div>
    </li>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case "pair":
      return <div className="ex-pair">{b.blocks.map((x, i) => <BlockView key={i} b={x} />)}</div>;
    case "note":
      return <p className="ex-note">{b.text}</p>;
    case "file":
      return (
        <figure className="ex-file">
          <figcaption>{b.name}</figcaption>
          <pre>{b.text}</pre>
        </figure>
      );
    case "voices":
      return (
        <div className="ex-voices">
          {b.voices.map((v) => (
            <div className="ex-voice" key={v.lane} style={tintVars(v.lane)}>
              <strong>{lanes[v.lane].name}</strong>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      );
    case "states":
      return (
        <div>
          <h4 className="ex-mini">{b.label}</h4>
          <ol className="ex-states">{b.states.map((st, i) => <li key={st} className={i === b.states.length - 1 ? "ok" : undefined}>{st}</li>)}</ol>
          <p className="ex-note">{b.note}</p>
        </div>
      );
    case "table":
      return (
        <div className="ex-table">
          <table>
            {b.caption && <caption>{b.caption}</caption>}
            <thead><tr>{b.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className={b.pick === i ? "pick" : undefined}>
                  {r.map((c, j) => <td key={j} className={b.numeric?.includes(j) ? "num" : undefined}><CellView c={c} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function CellView({ c }: { c: Cell }) {
  if (typeof c === "string") return <>{c}</>;
  if ("owner" in c) return <span className="ex-owner" style={tintVars(c.owner)}>{lanes[c.owner].name}</span>;
  return <span className={`ex-tag ${c.tone}`}>{c.tag}</span>;
}
