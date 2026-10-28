import GitHubGlyph from "@/components/GitHubGlyph";
import Mark from "@/components/Mark";
import { formatBytes, kitManifest } from "@/content/kit";
import { commands, site, sources } from "@/content/site";

// The footer on every page. `base` turns the home page's "#kit" into "/#kit" elsewhere.
export default function SiteFooter({ base = "" }: { base?: string }) {
  const zip = kitManifest.zip;
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-close">
          <Mark size={56} />
          <div>
            <p className="foot-title">Five architects advise. <span>You decide.</span></p>
            <p className="foot-sub">Free, open source and plain text. Install it in one command and ask your first question today.</p>
          </div>
          <div className="foot-cta">
            <a className="btn primary" href={`${base}#kit`}>Get the kit</a>
            {site.repoUrl && (
              <a className="btn" href={site.repoUrl} target="_blank" rel="noreferrer">
                <GitHubGlyph />
                <span>Star on GitHub</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>

        <div className="foot-cols">
          <nav aria-labelledby="foot-start">
            <h3 id="foot-start">Start</h3>
            <ul>
              <li><a href={`${base}#kit`}>Install it</a></li>
              <li><a href="/commands#profile">Write your profile with <code>/arch-profile</code></a></li>
              <li><a href="/examples">Two worked examples</a></li>
              <li><a href="/faq">Questions and answers</a></li>
              <li><a href={zip.href} download="virtual-architects-kit.zip">Download the .zip ({formatBytes(zip.bytes)})</a></li>
            </ul>
          </nav>
          <nav aria-labelledby="foot-cmds">
            <h3 id="foot-cmds">Commands</h3>
            <ul className="foot-cmds">
              {commands.map((c) => <li key={c.id}><a href={`/commands#${c.id}`}><code>{c.run.split(" ")[0]}</code></a></li>)}
            </ul>
          </nav>
          <nav aria-labelledby="foot-read">
            <h3 id="foot-read">Further reading</h3>
            <ul>
              {sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noreferrer">{s.label}<span className="ext" aria-hidden="true"> ↗</span><span className="sr-only"> (opens in a new tab)</span></a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="foot-line">
          <p>
            <strong>{site.name}</strong>
            {site.license && (
              <> · Open source under the {site.repoUrl ? <a href={`${site.repoUrl}/blob/main/LICENSE`}>{site.license} license</a> : <>{site.license} license</>}</>
            )}
            {" · "}Made by {site.creator.name}
          </p>
          <p><a href={`${base}#top`}>Back to the top ↑</a></p>
        </div>
      </div>
    </footer>
  );
}
