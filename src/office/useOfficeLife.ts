import { useEffect } from "react";
import { agents } from "../data/agents";
import { useStore } from "../store";
import { besideSlot } from "./layout";
import type { AgentStatus } from "../types";

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/**
 * Ambient office life: idle agents occasionally get up, walk over to a
 * colleague, exchange a line, then head back to their desk. Skips anyone
 * who's busy with a real delegation so it never fights the orchestrator.
 */
export function useOfficeLife() {
  const setStatus = useStore((s) => s.setStatus);
  const setBubble = useStore((s) => s.setBubble);
  const moveTo = useStore((s) => s.moveTo);
  const goHome = useStore((s) => s.goHome);

  useEffect(() => {
    // Gentle status drift so monitors/dots feel alive.
    const drift = setInterval(() => {
      if (useStore.getState().busy) return;
      const a = pick(agents);
      const cur = useStore.getState().statuses[a.id] ?? a.defaultStatus;
      if (cur === "chatting" || cur === "working") return;
      setStatus(a.id, pick<AgentStatus>(["idle", "idle", "working", "thinking", "away"]));
    }, 1600);

    // Walk over and chat.
    const mingle = setInterval(() => {
      const st = useStore.getState();
      if (st.busy) return;
      const a = pick(agents);
      const b = pick(agents);
      if (a.id === b.id) return;
      const aStatus = st.statuses[a.id] ?? a.defaultStatus;
      if (aStatus === "chatting" || aStatus === "away") return;
      if (st.bubbles[a.id] || st.bubbles[b.id]) return;

      // a walks to b
      setStatus(a.id, "chatting");
      moveTo(a.id, besideSlot(b.id));
      setBubble(a.id, pick(a.ambientPhrases));
      setTimeout(() => setBubble(b.id, pick(b.ambientPhrases)), 1300);

      setTimeout(() => {
        setBubble(a.id, null);
        setBubble(b.id, null);
        goHome(a.id);
        setStatus(a.id, "idle");
      }, 3600);
    }, 3200);

    return () => {
      clearInterval(drift);
      clearInterval(mingle);
    };
  }, [setStatus, setBubble, moveTo, goHome]);
}
