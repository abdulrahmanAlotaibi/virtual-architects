"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import Sigil from "@/components/Sigil";
import { chooser, type Command } from "@/content/site";

// "Which command?" Native radio buttons give the arrow-key behaviour and work before
// hydration; every option also shows its command, so nothing is hidden without JS.
export default function CommandChooser({ commands }: { commands: Command[] }) {
  const [id, setId] = useState(commands[0].id);
  const c = commands.find((x) => x.id === id) ?? commands[0];

  return (
    <div className="chooser">
      <fieldset className="choices">
        <legend>{chooser.ask}</legend>
        {commands.map((x) => (
          <label key={x.id} className="choice" data-on={x.id === id || undefined}>
            <input type="radio" name="command" value={x.id} checked={x.id === id} onChange={() => setId(x.id)} />
            <span className="have">{x.have}</span>
            <code className="run">{x.run}</code>
          </label>
        ))}
      </fieldset>

      <div className="answer" aria-live="polite">
        <p className="eyebrow">{chooser.tryIt}</p>
        <div className="shell chat">
          <code id="chooser-example">{c.example}</code>
          <CopyButton text={c.example} target="chooser-example" />
        </div>
        <dl className="kv answer-kv">
          <dt>{chooser.get}</dt>
          <dd>{c.get}</dd>
          <dt>{chooser.who}</dt>
          <dd className="who">
            <Sigil tint={c.tint} size={14} />
            <span>{c.who}</span>
          </dd>
          <dt>{chooser.writes}</dt>
          <dd>{c.writes}</dd>
          <dt>{chooser.then}</dt>
          <dd>{c.then}</dd>
        </dl>
      </div>
    </div>
  );
}
