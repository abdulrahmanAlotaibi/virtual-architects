// The site's mark: the board. Five seats around a table, one per architect in its tint, and
// the chair at the head is yours: the decision, a square in stamp red at the centre. Seats run
// clockwise from the top in Sigil order: enterprise, solution, cloud and infra, research, the
// board. Security's tint is the stamp red, so it sits with you at the centre.
const SEATS: [number, number, number][] = [
  [12, 3.6, 0],
  [19.99, 9.4, 1],
  [16.94, 18.8, 2],
  [7.06, 18.8, 4],
  [4.01, 9.4, 5],
];

export default function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg className="mark-svg" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {SEATS.map(([cx, cy, t]) => (
        <circle key={t} cx={cx} cy={cy} r="3.1" style={{ fill: `var(--tint-${t})` }} />
      ))}
      <rect x="8.4" y="8.4" width="7.2" height="7.2" rx="2" style={{ fill: "var(--stamp)" }} />
    </svg>
  );
}
