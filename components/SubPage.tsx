import type { ReactNode } from "react";
import DesktopIcons from "@/components/DesktopIcons";
import GitHubGlyph from "@/components/GitHubGlyph";
import Mark from "@/components/Mark";
import NavMenu from "@/components/NavMenu";
import ProButton from "@/components/ProButton";
import SiteFooter from "@/components/SiteFooter";
import ThemeToggle from "@/components/ThemeToggle";
import WindowScroll from "@/components/WindowScroll";
import { navLinks, site } from "@/content/site";

// Section links point back at the home page from here.
const links = navLinks.map((l) => ({ ...l, href: l.href.startsWith("#") ? `/${l.href}` : l.href }));

// The desk, menubar and window every page other than home sits in. `file` is the window's
// title, `current` the nav link to mark as this page.
export default function SubPage({ file, current, children }: { file: string; current: string; children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <WindowScroll />
      <div className="desk">
      <header className="menubar">
        <a className="mark" href="/">
          <Mark />
          <span>{site.name}</span>
        </a>
        <nav className="menu-links" aria-label="Main">
          <ul className="links">
            {links.filter((l) => l.wide).map((l) => (
              <li key={l.href}><a href={l.href} aria-current={l.href === current ? "page" : undefined}>{l.label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="right">
          <NavMenu links={links} />
          <ThemeToggle />
          {site.repoUrl && (
            <a className="btn small ghost-gh" href={site.repoUrl} target="_blank" rel="noreferrer">
              <GitHubGlyph />
              <span className="gh-label">GitHub</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          <ProButton />
          <a className="btn small primary" href="/#kit">Get the kit</a>
        </div>
      </header>

      <DesktopIcons side="left" base="/" />

      <div className="win">
        <div className="win-bar" aria-hidden="true">
          <span className="win-title"><Mark size={14} />{file}</span>
          <span className="win-ctrl">
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 9h8" stroke="currentColor" strokeWidth="1.5" /></svg>
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="m2.5 2.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.5" /></svg>
          </span>
        </div>
        <div className="win-body" id="win-body" tabIndex={-1}>
          <main id="main" tabIndex={-1}>{children}</main>
          <SiteFooter base="/" />
        </div>
      </div>

      <DesktopIcons side="right" base="/" />
      </div>
    </>
  );
}
