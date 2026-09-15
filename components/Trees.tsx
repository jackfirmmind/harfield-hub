/**
 * Quiet tree silhouettes down the page margins.
 * Pure SVG, no images, no network. Desktop only, very low opacity.
 */
const Tree = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 0v-120" stroke="currentColor" strokeWidth="5" fill="none" />
    <path d="M0 -40c-26-6-44-24-50-48 22 2 40 14 50 30" fill="currentColor" />
    <path d="M0 -40c26-6 44-24 50-48-22 2-40 14-50 30" fill="currentColor" />
    <path d="M0 -70c-22-6-36-22-42-44 20 3 34 15 42 30" fill="currentColor" />
    <path d="M0 -70c22-6 36-22 42-44-20 3-34 15-42 30" fill="currentColor" />
    <path d="M0 -100c-15-6-24-18-28-34 14 3 23 13 28 24" fill="currentColor" />
    <path d="M0 -100c15-6 24-18 28-34-14 3-23 13-28 24" fill="currentColor" />
  </g>
);

const Canopy = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M0 0v-${r * 1.6}`} stroke="currentColor" strokeWidth={r / 9} fill="none" />
    <ellipse cx="0" cy={-r * 1.9} rx={r} ry={r * 0.82} fill="currentColor" />
    <ellipse cx={-r * 0.62} cy={-r * 1.45} rx={r * 0.6} ry={r * 0.5} fill="currentColor" />
    <ellipse cx={r * 0.62} cy={-r * 1.5} rx={r * 0.55} ry={r * 0.46} fill="currentColor" />
  </g>
);

export default function Trees() {
  return (
    <>
      <div className="trees trees-l" aria-hidden="true">
        <svg viewBox="0 0 190 900" preserveAspectRatio="xMinYMid slice">
          <Canopy x={38} y={210} r={44} />
          <Tree x={112} y={330} s={0.9} />
          <Canopy x={30} y={560} r={34} />
          <Tree x={96} y={700} s={1.15} />
          <Canopy x={140} y={880} r={40} />
        </svg>
      </div>
      <div className="trees trees-r" aria-hidden="true">
        <svg viewBox="0 0 190 900" preserveAspectRatio="xMinYMid slice">
          <Canopy x={44} y={160} r={38} />
          <Tree x={120} y={300} s={1.05} />
          <Canopy x={26} y={520} r={46} />
          <Tree x={104} y={690} s={0.85} />
          <Canopy x={148} y={860} r={32} />
        </svg>
      </div>
    </>
  );
}
