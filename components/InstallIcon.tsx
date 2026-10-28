import type { ReactNode } from "react";

// Small pictograms for the install tabs, drawn in the same line style as the desktop icons.
// They take currentColor so they follow the tab, including the selected (green) state.
const line = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" } as const;

const ICONS: Record<string, ReactNode> = {
  command: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" {...line} />
      <path d="m7 10 3 2.5L7 15" {...line} />
      <path d="M12.5 15.5H17" {...line} />
    </>
  ),
  zip: (
    <>
      <path d="M5 3h10l4 4v14H5z" {...line} />
      <path d="M12 3v2m0 2v2m0 2v2" {...line} />
      <rect x="10" y="14" width="4" height="4" rx="1" {...line} />
    </>
  ),
  git: (
    <>
      <circle cx="6.5" cy="5.5" r="2.2" {...line} />
      <circle cx="6.5" cy="18.5" r="2.2" {...line} />
      <circle cx="17.5" cy="9" r="2.2" {...line} />
      <path d="M6.5 7.7v8.6" {...line} />
      <path d="M17.5 11.2c0 3-4 3-9.5 5.2" {...line} />
    </>
  ),
  claude: (
    <>
      <path d="M12 3v5m0 8v5M3 12h5m8 0h5M5.6 5.6l3.5 3.5m5.8 5.8 3.5 3.5m0-12.8-3.5 3.5m-5.8 5.8-3.5 3.5" {...line} />
    </>
  ),
  copilot: (
    <>
      <path d="M5 11c0-4 3-6 7-6s7 2 7 6v5c0 2-2 3-4 3H9c-2 0-4-1-4-3z" {...line} />
      <circle cx="9.5" cy="12.5" r="1.1" fill="currentColor" />
      <circle cx="14.5" cy="12.5" r="1.1" fill="currentColor" />
      <path d="M12 5V3" {...line} />
    </>
  ),
};

export default function InstallIcon({ id, size = 22 }: { id: string; size?: number }) {
  const icon = ICONS[id];
  if (!icon) return null;
  return (
    <svg className="install-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {icon}
    </svg>
  );
}
