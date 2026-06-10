import { useEffect, useRef } from "react";
import { useStore } from "../store";
import { agentsById } from "../data/agents";

function label(id: string): { name: string; color: string } {
  if (id === "you") return { name: "you", color: "var(--text-dim)" };
  const a = agentsById[id];
  return a
    ? { name: a.name.toLowerCase(), color: a.departmentColor }
    : { name: id, color: "var(--text-dim)" };
}

const ARROW: Record<string, string> = {
  command: "→",
  delegate: "→",
  reply: "",
  synthesis: "✓",
  note: "",
  chatter: "",
};

export function OfficeFeed() {
  const feed = useStore((s) => s.feed);
  const open = useStore((s) => s.feedOpen);
  const toggleFeed = useStore((s) => s.toggleFeed);
  const clearFeed = useStore((s) => s.clearFeed);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [feed]);

  return (
    <div className={`feed${open ? " open" : ""}`}>
      <div className="feed-head" onClick={() => toggleFeed()}>
        <span className="feed-title">OFFICE FEED</span>
        <span className="feed-sub">{feed.length} events</span>
        <div style={{ flex: 1 }} />
        <button
          className="feed-btn"
          onClick={(e) => {
            e.stopPropagation();
            clearFeed();
          }}
        >
          clear
        </button>
        <span className="feed-chevron">{open ? "▾" : "▴"}</span>
      </div>

      {open && (
        <div className="feed-log" ref={logRef}>
          {feed.length === 0 ? (
            <div className="feed-empty">
              No activity yet. Give an agent a task that needs the team — when they
              distribute work, the whole exchange shows up here.
            </div>
          ) : (
            feed.map((e) => {
              const from = label(e.fromId);
              const to = e.toId ? label(e.toId) : null;
              return (
                <div key={e.id} className={`feed-row ${e.kind}`}>
                  <span className="feed-from" style={{ color: from.color }}>
                    {from.name}
                  </span>
                  {to && (
                    <>
                      <span className="feed-arrow">{ARROW[e.kind]}</span>
                      <span className="feed-to" style={{ color: to.color }}>
                        {to.name}
                      </span>
                    </>
                  )}
                  <span className={`feed-text ${e.kind}`}>
                    {e.kind === "note" ? `· ${e.text}` : e.text}
                    {e.streaming && <span className="caret" />}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
