import AskBox from "@/components/AskBox";
import DesktopIcons from "@/components/DesktopIcons";
import FeedbackLoop from "@/components/FeedbackLoop";
import GitHubGlyph from "@/components/GitHubGlyph";
import ProButton from "@/components/ProButton";
import KitSection from "@/components/KitSection";
import Mark from "@/components/Mark";
import NavMenu from "@/components/NavMenu";
import Pipeline from "@/components/Pipeline";
import SiteFooter from "@/components/SiteFooter";
import Sigil from "@/components/Sigil";
import ThemeToggle from "@/components/ThemeToggle";
import WindowScroll from "@/components/WindowScroll";
import { kitHref, kitManifest } from "@/content/kit";
import { abbreviations, architects, commands, creatorNote, csvlod, hero, heroCommands, loop, navLinks, site } from "@/content/site";

export default function Home() {
  const { creator } = site;
  const zip = kitManifest.zip;
  const chips = commands.map((c) => ({ id: c.id, label: c.run.split(" ")[0], example: c.example, tint: c.tint }));
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <WindowScroll />
      <div className="desk">
      <header className="menubar">
        <a className="mark" href="#top">
          <Mark />
          <span>{site.name}</span>
        </a>
        <nav className="menu-links" aria-label="Main">
          <ul className="links">
            {navLinks.filter((l) => l.wide).map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
          </ul>
        </nav>
        <div className="right">
          <NavMenu links={navLinks} />
          <ThemeToggle />
          {site.repoUrl && (
            <a className="btn small ghost-gh" href={site.repoUrl} target="_blank" rel="noreferrer">
              <GitHubGlyph />
              <span className="gh-label">GitHub</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          <ProButton />
          <a className="btn small primary" href="#kit">Get the kit</a>
        </div>
      </header>

      <DesktopIcons side="left" />

      <div className="win">
        <div className="win-bar" aria-hidden="true">
          <span className="win-title"><Mark size={14} />virtual-architects.md</span>
          <span className="win-ctrl">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 9h8" stroke="currentColor" strokeWidth="1.5" /></svg>
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="m2.5 2.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.5" /></svg>
          </span>
        </div>
        <div className="win-body" id="win-body" tabIndex={-1}>
      <main id="main" tabIndex={-1}>
      <header className="hero" id="top">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1>{hero.title[0]}<span className="hl">{hero.title[1]}</span>{hero.title[2]}</h1>
            <p className="hero-sub">{hero.sub}</p>
            <div className="actions">
              <a className="btn primary big" href={zip.href} download="virtual-architects-kit.zip">{hero.primary}</a>
              <a className="btn big" href="#workflow">{hero.secondary}</a>
            </div>
            <p className="proof">
              <a href="#kit">{hero.install} →</a>
            </p>
          </div>
          <FeedbackLoop label={loop.eyebrow} stations={loop.stations} hint={loop.hint} gives={loop.gives} decide={loop.decide} controls={loop.controls} />
        </div>
        <div className="wrap">
          <AskBox title={hero.ask} hint={hero.askHint} lines={heroCommands} chips={chips} />
        </div>
      </header>


      <section className="band alt" id="team" aria-labelledby="team-h">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">The team</p>
              <h2 id="team-h">Five architects, each good at one thing</h2>
              <p className="lede">
                Think of a small team you would hire: one for the business side, one for the design, one for the cloud, one for
                security, and one who reads everything first. They all learn your project from one short file you fill in once.
                Ask any of them a question, and you get a straight answer on their part and the name of who to ask about the rest.
              </p>
            </div>
            <a className="more" href={kitManifest.zip.href} download>Download the kit ↓</a>
          </div>
          <div className="grid3">
            {architects.map((a) => (
              <article className="card" key={a.id}>
                <div className="head">
                  <Sigil tint={a.tint} />
                  <h3>{a.name}</h3>
                </div>
                <code>{a.command}</code>
                <p>{a.thinks}</p>
                <div className="chips">{a.writes.map((w) => <span className="chip" key={w}><Expand text={w} /></span>)}</div>
                <p className="owns">Keeps true: {a.owns}</p>
                <a className="dl-link" href={kitHref(a.agent)} download={a.agent.split("/").pop()}>Download {a.agent.split("/").pop()} ↓</a>
              </article>
            ))}
            <article className="board">
              <div className="head" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Sigil tint={5} />
                <h3>The board</h3>
              </div>
              <code style={{ color: "var(--accent)", fontSize: 13 }}>/arch-board</code>
              <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 14 }}>
                For the questions that cross lanes. If there is a source, research reads it first. Then every architect it touches answers
                in parallel, and you get one recommendation with the disagreements left in.
              </p>
              <a className="dl-link" href={kitHref(".claude/commands/arch-board.md")} download="arch-board.md">Download arch-board.md ↓</a>
            </article>
          </div>
          <p className="cmd-note">
            <Expand text="ADRs" /> belong to no one lane. Every architect but research records the lasting decisions in its own lane
            as an <Expand text="ADR" />, in one shared log, and each stays a proposal until you accept it.
          </p>
        </div>
      </section>

      <section className="band" id="workflow" aria-labelledby="flow-h">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">The workflow</p>
              <h2 id="flow-h">How your business demand gets the best architecture</h2>
              <p className="lede">
                Every request takes the same path, so nothing important gets skipped. Research checks the facts first. Anything that
                costs money gets a business case. Then the design, the security review and the cloud plan, and every pull request is
                checked against the design. Small changes skip the steps they don&apos;t need. Press play, or pick a scenario.
              </p>
            </div>
            <div style={{ display: "grid", gap: 8, justifyItems: "end" }}>
              <a className="more" href="/examples">Two worked examples →</a>
              <a className="more" href="#workflow/vendor">Replay from the start ▶</a>
            </div>
          </div>
          <Pipeline />
        </div>
      </section>

      <KitSection />

      <section className="band" id="repository" aria-labelledby="repo-h">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">The repository</p>
              <h2 id="repo-h">Where do all these documents go?</h2>
              <p className="lede">
                Every change produces a brief, an outline, a design, a threat model, a decision. After fifty changes that is hundreds of
                files, and a design nobody can find is a design nobody follows. So the kit gives each kind of document one home,
                using Kotusev&apos;s CSVLOD model: is it about the business or about IT, and is it a rule, a structure or a change?
                The folders answer both, so a document lands in the same place today and is still findable next year.
              </p>
            </div>
            <a className="more" href="https://kotusev.com" target="_blank" rel="noreferrer">Read Kotusev ↗<span className="sr-only"> (opens in a new tab)</span></a>
          </div>
          <div className="matrix" role="table" aria-label="CSVLOD types">
            <div className="mrow" role="row">
              <div className="corner" role="columnheader" aria-label="Kind" />
              {csvlod.cols.map((c) => <div key={c} className="ax col" role="columnheader">{c}</div>)}
            </div>
            {csvlod.rows.map((row, r) => (
              <RowCells key={row} row={row} cells={csvlod.cells.slice(r * 2, r * 2 + 2)} />
            ))}
          </div>
          <div className="extras">
            <span><code>decisions/</code> the ADR log, across all six</span>
            <span><code>practice/</code> the playbook, templates and research</span>
            <span><code>project.yaml</code> the profile</span>
          </div>
        </div>
      </section>

      <section className="band alt" id="creator" aria-labelledby="creator-h">
        <div className="wrap creator">
          <div className="creator-note">
            <h2 id="creator-h">{creatorNote.title[0]}<span className="hl yellow">{creatorNote.title[1]}</span></h2>
            {creatorNote.paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
            <p className="signoff">{creatorNote.signoff} <span>{creator.name}, {creator.role.toLowerCase()}</span></p>
            <div className="actions">
              <a className="btn primary" href={zip.href} download="virtual-architects-kit.zip">{hero.primary}</a>
              {site.repoUrl ? (
                <a className="btn" href={site.repoUrl} target="_blank" rel="noreferrer">Contribute on GitHub<span className="sr-only"> (opens in a new tab)</span></a>
              ) : (
                <a className="btn" href="#workflow">{hero.secondary}</a>
              )}
            </div>
          </div>
        </div>
      </section>
      </main>

      <SiteFooter />
        </div>
      </div>

      <DesktopIcons side="right" />
      </div>
    </>
  );
}

function RowCells({ row, cells }: { row: string; cells: typeof csvlod.cells }) {
  return (
    <div className="mrow" role="row">
      <div className="ax" role="rowheader">{row}</div>
      {cells.map((c, i) => (
        <div className="cell" key={c.type} role="cell">
          <h3><span className="sigil" aria-hidden="true" style={{ width: 12, height: 12, background: `var(--ramp-${i === 0 ? 1 : 3})` }} />{c.type}</h3>
          <p>{c.q}</p>
          <code>{c.folder}</code>
          <pre className="tree">{c.sub.map((s, j) => `${j === c.sub.length - 1 ? "└─" : "├─"} ${s}/`).join("\n")}</pre>
          <div className="owner">Owner: {c.owner}</div>
        </div>
      ))}
    </div>
  );
}

// Wraps ADR, HLD, LLD and SAD in <abbr> so the short forms explain themselves.
function Expand({ text }: { text: string }) {
  const parts = text.split(/\b(ADRs?|HLD|LLD|SAD)\b/);
  return (
    <>
      {parts.map((p, i) => (abbreviations[p] ? <abbr key={i} title={abbreviations[p]}>{p}</abbr> : p))}
    </>
  );
}
