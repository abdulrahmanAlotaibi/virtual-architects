import CopyButton from "@/components/CopyButton";
import InstallMethods from "@/components/InstallMethods";
import InstallWhere from "@/components/InstallWhere";
import { formatBytes, kitHref, kitManifest, type KitFile } from "@/content/kit";
import { kit } from "@/content/site";

type Dir = { name: string; path: string; dirs: Dir[]; files: KitFile[] };

function buildTree(files: KitFile[]): Dir {
  const root: Dir = { name: "", path: "", dirs: [], files: [] };
  for (const f of files) {
    const parts = f.path.split("/");
    let dir = root;
    for (const part of parts.slice(0, -1)) {
      let next = dir.dirs.find((d) => d.name === part);
      if (!next) {
        next = { name: part, path: dir.path ? `${dir.path}/${part}` : part, dirs: [], files: [] };
        dir.dirs.push(next);
      }
      dir = next;
    }
    dir.files.push(f);
  }
  return root;
}

function count(d: Dir): number {
  return d.files.length + d.dirs.reduce((n, x) => n + count(x), 0);
}

function DirNode({ dir }: { dir: Dir }) {
  return (
    <li>
      {/* Every folder starts closed: the tree is a map, not a listing, and it stays short next to the install steps. */}
      <details>
        <summary>
          <span className="dir">{dir.name}/</span>
          <span className="meta">{count(dir)} {count(dir) === 1 ? "file" : "files"}</span>
        </summary>
        <Entries dir={dir} />
      </details>
    </li>
  );
}

function Entries({ dir }: { dir: Dir }) {
  return (
    <ul>
      {dir.dirs.map((d) => <DirNode key={d.path} dir={d} />)}
      {dir.files.map((f) => {
        const name = f.path.split("/").pop()!;
        return (
          <li key={f.path} className="file">
            <a href={f.href} download={name} title={`Download ${f.path}`}>
              {name}
              {f.executable && <span className="x" title="Executable">*</span>}
            </a>
            <span className="meta">{formatBytes(f.bytes)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function DownloadGlyph() {
  // A pixel arrow into a tray.
  return (
    <svg className="dl-glyph" width="14" height="14" viewBox="0 0 7 7" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M3 0h1v3h1v1h-1v1h-1v-1h-1v-1h1zM0 5h1v1h5v-1h1v2h-7z" fill="currentColor" />
    </svg>
  );
}

export default function KitSection() {
  const { zip, files } = kitManifest;
  const tree = buildTree(files);
  const size = formatBytes(zip.bytes);
  return (
    <section className="band" id="kit" aria-labelledby="kit-h">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">{kit.eyebrow}</p>
            <h2 id="kit-h">{kit.title}</h2>
            <p className="lede">{kit.lede}</p>
          </div>
          <a className="more" href={kitHref("INSTALL.md")} download="INSTALL.md">INSTALL.md ↓</a>
        </div>

        <div className="kit">
          <div className="kit-main">
            <InstallMethods
              methods={kit.methods}
              extra={{
                zip: (
                  <>
                    <div className="dl-card">
                      <div className="dl-top">
                        <span className="dl-pix" aria-hidden="true">
                          {Array.from({ length: 16 }, (_, i) => <i key={i} />)}
                        </span>
                        <div>
                          <h3>virtual-architects-kit.zip</h3>
                          <p>{files.length} files · {size} · {kit.works.join(" and ")}</p>
                        </div>
                      </div>
                      <a className="btn primary big" href={zip.href} download="virtual-architects-kit.zip">
                        <DownloadGlyph />
                        Download the kit
                        <span className="sub">.zip, {size}</span>
                      </a>
                      <div className="dl-foot">
                        <span>SHA-256</span>
                        <code id="kit-sha" title={zip.sha256}>{zip.sha256}</code>
                        <CopyButton text={zip.sha256} target="kit-sha" />
                      </div>
                    </div>
                    <p className="one-arch">
                      Or take just one architect:{" "}
                      {kit.oneArchitect.map((a, i) => (
                        <span key={a.path}>
                          {i > 0 && <span aria-hidden="true"> · </span>}
                          <a href={kitHref(a.path)} download={a.path.split("/").pop()}>{a.label}</a>
                        </span>
                      ))}
                    </p>
                  </>
                ),
              }}
            />

            <h3 className="kit-h3">{kit.thenTitle}</h3>
            <ol className="steps">
              {kit.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h4>{s.title}</h4>
                    <div className={s.chat ? "shell chat" : "shell"}>
                      <code id={`step-code-${i}`}>{s.code}</code>
                      <CopyButton text={s.code} target={`step-code-${i}`} />
                    </div>
                    {s.note && <p>{s.note}</p>}
                    {i === kit.steps.length - 1 && <InstallWhere items={kit.where} />}
                  </div>
                </li>
              ))}
            </ol>

            <div className="before">
              <h3 className="kit-h3">{kit.beforeTitle}</h3>
              <ul>
                {kit.before.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          </div>

          <aside className="tree-card" aria-labelledby="kit-tree-h">
            <header>
              <h3 id="kit-tree-h">{kit.treeTitle}</h3>
              <span>{files.length} files</span>
            </header>
            <nav className="kit-tree" aria-label="Kit files">
              <Entries dir={tree} />
            </nav>
            <p className="tree-note">{kit.treeNote}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
