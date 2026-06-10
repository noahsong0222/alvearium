import { departments } from "../data/agents";

export interface Vec {
  x: number;
  y: number;
}

export interface ZoneRect {
  name: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const COLS = 4; // department rooms per row
const ZW = 392;
const ZH = 452;
const GX = 18;
const GY = 18;
const PAD = 20;
const DESK_COLS = 2;
const HEADER = 58;
const ROW_H = 92;

export const ROOM = {
  width: PAD * 2 + COLS * ZW + (COLS - 1) * GX,
  height:
    PAD * 2 +
    Math.ceil(departments.length / COLS) * ZH +
    (Math.ceil(departments.length / COLS) - 1) * GY,
};

export const zoneRects: ZoneRect[] = departments.map((d, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    name: d.name,
    color: d.color,
    x: PAD + col * (ZW + GX),
    y: PAD + row * (ZH + GY),
    w: ZW,
    h: ZH,
  };
});

/** Home (seated) position for each agent, centered on their desk. */
export const home: Record<string, Vec> = {};
/** The desk rectangle for rendering the table under each agent. */
export const deskRects: Record<string, ZoneRect> = {};

departments.forEach((dept, di) => {
  const z = zoneRects[di];
  const cellW = (z.w - 24) / DESK_COLS;
  dept.agents.forEach((a, ai) => {
    const col = ai % DESK_COLS;
    const row = Math.floor(ai / DESK_COLS);
    const dx = z.x + 12 + col * cellW;
    const dy = z.y + HEADER + row * ROW_H;
    deskRects[a.id] = { name: a.id, color: z.color, x: dx, y: dy, w: cellW - 10, h: ROW_H - 14 };
    home[a.id] = { x: dx + (cellW - 10) / 2, y: dy + 30 };
  });
});

/** A meeting slot near a manager for the Nth delegate (small arc in front). */
export function meetingSlot(managerId: string, index: number): Vec {
  const h = home[managerId];
  const offsets: Vec[] = [
    { x: -46, y: 38 },
    { x: 46, y: 38 },
    { x: -46, y: 74 },
    { x: 46, y: 74 },
  ];
  const o = offsets[index % offsets.length];
  return { x: h.x + o.x, y: h.y + o.y };
}

/** A spot next to a target agent, for ambient "walk over and chat". */
export function besideSlot(targetId: string): Vec {
  const h = home[targetId];
  return { x: h.x - 40, y: h.y + 6 };
}
