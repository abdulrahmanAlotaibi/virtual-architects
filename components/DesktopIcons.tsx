import type { ReactNode } from "react";
import { kitHref, kitManifest } from "@/content/kit";

// The desktop shortcuts beside the app window (1100px and wider). Each is a plain link,
// so they work without JavaScript; the pictograms are drawn here, line plus one color.
type Shortcut = { label: string; href: string; icon: keyof typeof ICONS; download?: string };

const line = { fill: "none", stroke: "var(--icon-line)", strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const paper = { fill: "var(--icon-paper)", stroke: "var(--icon-line)", strokeWidth: 2, strokeLinejoin: "round" } as const;
const tint = (n: number) => ({ fill: `var(--tint-${n})`, stroke: "var(--icon-line)", strokeWidth: 2, strokeLinejoin: "round" }) as const;

const ICONS = {
  home: (
    <>
      <path d="M7 19 20 8l13 11v14H7z" {...paper} />
      <path d="M4 20 20 6l16 14" {...line} />
      <rect x="16" y="23" width="8" height="10" rx="1" {...tint(5)} />
    </>
  ),
  team: (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 7 + i * 6.5;
        const y = i % 2 ? 13 : 18;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3.6" {...tint(i)} />
            <path d={`M${x - 4.5} ${y + 13} q0 -7 4.5 -7 q4.5 0 4.5 7`} {...paper} />
          </g>
        );
      })}
    </>
  ),
  workflow: (
    <>
      <path d="M12 12v8h16v8" {...line} />
      <rect x="5" y="5" width="14" height="9" rx="2.5" {...tint(0)} />
      <path d="M28 15l6 5-6 5-6-5z" {...tint(5)} />
      <rect x="21" y="27" width="14" height="9" rx="2.5" {...tint(4)} />
    </>
  ),
  commands: (
    <>
      <rect x="4" y="7" width="32" height="26" rx="3" {...paper} />
      <path d="M4 13h32" {...line} />
      <path d="m10 19 5 4-5 4" {...line} />
      <path d="M18 28h9" {...line} stroke="var(--tint-5)" strokeWidth={3} />
    </>
  ),
  zip: (
    <>
      <path d="M6 13 20 6l14 7v15l-14 7-14-7z" {...paper} />
      <path d="M6 13l14 7 14-7M20 20v15" {...line} />
      <path d="M6 13l14 7v15L6 28z" {...tint(5)} />
      <path d="M13 9.5l14 7v5" {...line} />
    </>
  ),
  install: (
    <>
      <path d="M9 4h15l8 8v24H9z" {...paper} />
      <path d="M24 4v8h8" {...line} />
      <path d="M14 18h12M14 23h12M14 28h7" {...line} />
      <rect x="20" y="25" width="13" height="9" rx="2" {...tint(1)} />
    </>
  ),
  examples: (
    <>
      <rect x="11" y="4" width="22" height="27" rx="2" {...paper} />
      <rect x="7" y="9" width="22" height="27" rx="2" {...paper} />
      <path d="M12 16h12M12 21h12M12 26h8" {...line} />
      <rect x="12" y="29" width="7" height="3" rx="1" {...tint(3)} strokeWidth={0} />
    </>
  ),
  repository: (
    <>
      <path d="M4 11a2 2 0 0 1 2-2h9l3 4h16a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" {...tint(0)} />
      <path d="M4 17h32" {...line} />
    </>
  ),
  faq: (
    <>
      <path d="M6 8h28a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H17l-7 6v-6H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" {...paper} />
      <path d="M16.5 15a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3" {...line} />
      <circle cx="20" cy="24.5" r="1.4" fill="var(--icon-line)" />
    </>
  ),
} satisfies Record<string, ReactNode>;

const LEFT: Shortcut[] = [
  { label: "Home", href: "#top", icon: "home" },
  { label: "The team", href: "#team", icon: "team" },
  { label: "Workflow", href: "#workflow", icon: "workflow" },
  { label: "Commands", href: "/commands", icon: "commands" },
];

const RIGHT: Shortcut[] = [
  { label: "kit.zip", href: kitManifest.zip.href, icon: "zip", download: "virtual-architects-kit.zip" },
  { label: "INSTALL.md", href: kitHref("INSTALL.md"), icon: "install", download: "INSTALL.md" },
  { label: "Examples", href: "/examples", icon: "examples" },
  { label: "Repository", href: "#repository", icon: "repository" },
  { label: "FAQ", href: "/faq", icon: "faq" },
];

// `base` prefixes the section links, so a page other than home can point back at "/#team".
export default function DesktopIcons({ side, base = "" }: { side: "left" | "right"; base?: string }) {
  const items = (side === "left" ? LEFT : RIGHT).map((s) => (s.href.startsWith("#") ? { ...s, href: base + s.href } : s));
  return (
    <nav className={`icons icons-${side}`} aria-label={side === "left" ? "Desktop shortcuts" : "Downloads and more shortcuts"}>
      <ul>
        {items.map((s) => (
          <li key={s.label}>
            <a className="dicon" href={s.href} download={s.download}>
              <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">{ICONS[s.icon]}</svg>
              <span>{s.label}</span>
              {s.download && <span className="sr-only"> (download)</span>}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
