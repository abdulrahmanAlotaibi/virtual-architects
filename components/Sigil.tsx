// A small rounded tile in an architect's color. Tints: 0 enterprise, 1 solution,
// 2 cloud and infra, 3 security, 4 research, 5 the board, 6 you (see --tint-* in globals.css).
export default function Sigil({ tint, size }: { tint: number; size?: number }) {
  return (
    <span
      className="sigil"
      aria-hidden="true"
      style={{ background: `var(--tint-${tint % 7})`, ...(size ? { width: size, height: size } : null) }}
    />
  );
}
