import { agents } from "../data/agents";
import { ROOM, zoneRects, deskRects } from "../office/layout";
import { AgentToken } from "./AgentToken";

export function OfficeRoom() {
  return (
    <div className="room-scroll">
      <div className="room" style={{ width: ROOM.width, height: ROOM.height }}>
        {zoneRects.map((z) => (
          <div
            key={z.name}
            className="room-zone"
            style={{
              left: z.x,
              top: z.y,
              width: z.w,
              height: z.h,
              ["--dept" as string]: z.color,
            }}
          >
            <div className="room-zone-head">
              <span className="sq" />
              <span className="name">{z.name}</span>
            </div>
          </div>
        ))}

        {agents.map((a) => {
          const d = deskRects[a.id];
          return (
            <div
              key={`desk-${a.id}`}
              className="desk-mark"
              style={{ left: d.x, top: d.y, width: d.w, height: d.h }}
            >
              <div className="desk-mark-screen" />
            </div>
          );
        })}

        {agents.map((a) => (
          <AgentToken key={a.id} agent={a} />
        ))}
      </div>
    </div>
  );
}
