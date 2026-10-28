# Virtual Architects

A one-page site that explains the virtual architecture team: five AI architects
(enterprise, solution, cloud and infra, security, research) that research, design and
review, and one person who decides. It shows the workflow as an animated pipeline with
four scenarios (a business requirement, a purchase, an idea and a research question), the slash commands, the project profile, Kotusev's CSVLOD folders and
the practice rules.

It is written for the person deciding whether a team should adopt it, with a hands-on
install path for the developer who sets it up. The look borrows the design language of a
desktop OS (a wallpaper, a menu bar, shortcut icons and one app window that scrolls on its
own), with Nunito, one orange accent and one color per architect. It uses no third-party
assets.

## Install the team

Pick one. Each adds the architects to your repository and never overwrites a file you
already have. The kit itself is [`kit/`](kit/), and [`kit/INSTALL.md`](kit/INSTALL.md) is
the full guide.

**One command**, at the root of your repository:

```bash
# macOS and Linux
curl -fsSL https://raw.githubusercontent.com/abdulrahmanAlotaibi/virtual-architects/main/public/install.sh | sh
# Windows PowerShell
irm https://raw.githubusercontent.com/abdulrahmanAlotaibi/virtual-architects/main/public/install.ps1 | iex
```

Run it again with `--update` (`-Update` on Windows) to refresh the kit's own files. It
never touches `docs/architecture/project.yaml` or the documents the architects wrote.

**Zip or Git**: download
[`virtual-architects-kit.zip`](public/downloads/virtual-architects-kit.zip) and run
`unzip -n virtual-architects-kit.zip -d .`, or clone this repository and run
`cp -Rn kit/. /path/to/your/repo/`.

Then fill in `docs/architecture/project.yaml` and ask your first question:
`/arch-board should we add a second payment provider?`

## Run the site

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in out/ (runs scripts/build-kit.py first)
```

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin when you build, so the share image
gets an absolute URL. Without it, the URL points at localhost. The installers download
from this repository's `public/` folder on GitHub; set `INSTALL_BASE_URL` to serve them
from somewhere else.

## Edit it

- **Words:** `content/site.ts` (team, commands, profile, practice) and
  `content/workflow.ts` (the pipeline's nodes, edges and scenarios).
- **Creator:** the note is `creatorNote` in `content/site.ts`, the name and photo path are
  `site.creator`. Save a square image as `public/creator.jpg` and rebuild. The page checks
  for it at build time; until it exists, an initials avatar from `site.creator.initials`
  stands in and no request is made for the photo.
- **Open source links:** set `site.repoUrl` and `site.license` in `content/site.ts`. While
  they are empty strings, the GitHub button and the license lines stay hidden.
- **Desktop shell:** at 1100px and wider the page sits in one window (`.win-body` is the
  scroll container) between two columns of shortcuts (`components/DesktopIcons.tsx`).
  Below that the window is the page and the document scrolls. Sticky panels use
  `top: var(--sticky-top)`, which is right in both cases.
- **Workflow pipeline:** `components/Pipeline.tsx` draws `content/workflow.ts`. A node with
  `members` is a parallel step (its members light up together), an edge with `back: true`
  is a dashed loop, and each scenario's `answers` label the decisions it takes. Steps have
  deep links: `#workflow/<scenario>` plays a scenario, `#workflow/<scenario>/<step>` opens
  one step. With focus in the diagram, the arrow keys step, Home and End jump, P plays or
  pauses and 1 to 4 pick a scenario. Below 960px the step text is pinned above the
  diagram, and below 600px the path is drawn as a vertical list.
- **Navigation:** section links live in `navLinks` in `content/site.ts`. The wide nav shows
  the ones marked `wide`; the phone menu (`components/NavMenu.tsx`) shows all of them.
- **Look:** `app/globals.css`. Every color and font size is a token at the top, with a
  dark theme: the wallpaper (`--wall*`), the window and panels (`--window`, `--panel`,
  `--panel-2`, `--border`, `--text`, `--muted`), the orange accent (`--orange`, its pressed
  edge `--orange-edge`, `--orange-text` for text) and one color per architect (`--tint-0`
  to `--tint-6`, each with a `-ink` shade for text). Buttons (`.btn`, `.btn.primary`) have
  a 3D bottom edge; `.hl` highlights a phrase in a heading.
- **The kit:** `kit/` is the downloadable team, laid out exactly as it lands in a repo.
  Edit the files there, never the copies in `public/kit/`. `scripts/build-kit.py` runs
  before every build (or on its own with `npm run kit`): it fails if a kit file or the
  site's source contains an em dash, writes `public/downloads/virtual-architects-kit.zip`, copies each
  file to `public/kit/`, and writes `content/kit-manifest.json` for the page. After you
  edit an agent, regenerate the Copilot copies in `kit/.github/` by running the kit's
  `sync-copilot.sh` inside a scratch git repo that holds a copy of `kit/`.
- **Share image:** `app/opengraph-image.png` is drawn by `scripts/og-image.py`;
  `app/icon.svg` is the favicon.

## License

[MIT](LICENSE). The kit carries its own copy at `kit/docs/architecture/LICENSE`, so the
license travels with the files into every repository that installs them.
