// Typed access to content/kit-manifest.json, which scripts/build-kit.py writes before
// every build. Never edit the manifest by hand.
import manifest from "./kit-manifest.json";

export type KitFile = { path: string; href: string; group: string; bytes: number; sha256: string; executable: boolean };
export type KitTemplate = {
  name: string;
  path: string;
  owner: string;
  use: string;
  savedTo: string;
  version: string | null;
  scoped: boolean;
  lines: number;
  preview: string;
  more: number;
};

export const kitManifest = manifest as {
  zip: { href: string; bytes: number; sha256: string };
  install: { sh: string; ps1: string };
  groups: { id: string; label: string }[];
  files: KitFile[];
  templates: KitTemplate[];
};

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
}

export function kitHref(path: string): string {
  const f = kitManifest.files.find((x) => x.path === path);
  if (!f) throw new Error(`Not in the kit: ${path}`);
  return f.href;
}
