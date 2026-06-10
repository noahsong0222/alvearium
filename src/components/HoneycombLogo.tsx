interface Props {
  size?: number;
}

/** Small honeycomb hex mark for the top bar. */
export function HoneycombLogo({ size = 28 }: Props) {
  const hex = (cx: number, cy: number, r: number) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    });
    return pts.join(" ");
  };

  const r = 7;
  const dx = r * Math.cos(Math.PI / 6) * 2; // horizontal spacing
  const cx = 24;
  const cy = 24;

  const cells = [
    [cx, cy],
    [cx - dx, cy],
    [cx + dx, cy],
    [cx - dx / 2, cy - r * 1.5],
    [cx + dx / 2, cy - r * 1.5],
    [cx - dx / 2, cy + r * 1.5],
    [cx + dx / 2, cy + r * 1.5],
  ];

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="hc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b69bff" />
          <stop offset="1" stopColor="#6d5cff" />
        </linearGradient>
      </defs>
      {cells.map(([x, y], i) => (
        <polygon
          key={i}
          points={hex(x, y, r)}
          fill={i === 0 ? "url(#hc)" : "none"}
          stroke="url(#hc)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          opacity={i === 0 ? 1 : 0.85}
        />
      ))}
    </svg>
  );
}
