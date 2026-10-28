import type { Metadata } from "next";
import CommandChooser from "@/components/CommandChooser";
import CopyButton from "@/components/CopyButton";
import Sigil from "@/components/Sigil";
import SubPage from "@/components/SubPage";
import { chooser, commands } from "@/content/site";

const lede =
  "Nine slash commands, the same in Claude Code and Copilot Chat. Start with /arch-profile so the team knows your project, then bring whatever you have in hand. None of them commits or pushes.";

export const metadata: Metadata = {
  title: "Commands · Virtual Architects",
  description: lede,
  openGraph: { title: "Commands · Virtual Architects", description: lede, url: "/commands" },
};

export default function Commands() {
  return (
    <SubPage file="commands.md" current="/commands">
      <header className="page-hero" id="top">
        <div className="wrap">
          <a className="page-back" href="/">← Home</a>
          <p className="eyebrow">Commands</p>
          <h1>Start from what you have in hand</h1>
          <p className="lede">{lede}</p>
        </div>
      </header>

      <section className="band" aria-labelledby="pick-h">
        <div className="wrap">
          <h2 id="pick-h" className="sr-only">Pick a command</h2>
          <CommandChooser commands={commands} />
          <p className="cmd-note">Not sure which? <code>/arch-board</code> picks the architects and tells you why.</p>
        </div>
      </section>

      <section className="band alt" aria-labelledby="all-h">
        <div className="wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">Reference</p>
              <h2 id="all-h">Every command, side by side</h2>
            </div>
          </div>
          <ol className="cmd-list">
            {commands.map((c) => (
              <li className="cmd-card" id={c.id} key={c.id}>
                <div className="cmd-card-head">
                  <Sigil tint={c.tint} />
                  <code>{c.run}</code>
                </div>
                <p className="cmd-have">{c.have}</p>
                <dl>
                  <div><dt>{chooser.get}</dt><dd>{c.get}</dd></div>
                  <div><dt>{chooser.who}</dt><dd>{c.who}</dd></div>
                  <div><dt>{chooser.writes}</dt><dd>{c.writes}</dd></div>
                  <div><dt>{chooser.then}</dt><dd>{c.then}</dd></div>
                </dl>
                <div className="shell chat">
                  <code id={`cmd-ex-${c.id}`}>{c.example}</code>
                  <CopyButton text={c.example} target={`cmd-ex-${c.id}`} />
                </div>
              </li>
            ))}
          </ol>
          <p className="cmd-note">
            One more, for maintainers: <code>/arch-sync</code> regenerates the Copilot copies after you edit an architect, and{" "}
            <code>/arch-sync hook</code> makes every commit do it.
          </p>
        </div>
      </section>
    </SubPage>
  );
}
