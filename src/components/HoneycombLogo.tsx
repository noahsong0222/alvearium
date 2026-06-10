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

  const color = "#d2d6dd";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" shapeRendering="crispEdges">
      {cells.map(([x, y], i) => (
        <polygon
          key={i}
          points={hex(x, y, r)}
          fill={i === 0 ? color : "none"}
          stroke={color}
          strokeWidth="1.4"
          strokeLinejoin="miter"
          opacity={i === 0 ? 1 : 0.7}
        />
      ))}
    </svg>
  );
}
