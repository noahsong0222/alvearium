import { useEffect } from "react";
import { agents } from "../data/agents";
import { useStore } from "../store";
import type { AgentStatus } from "../types";

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Makes the office feel alive even before anyone chats:
 * agents drift between idle/working/thinking and occasionally float a
 * short work-related thought bubble. Never disturbs an agent that's
 * actively in a conversation.
 */
export function useAmbient() {
  const setStatus = useStore((s) => s.setStatus);
  const setThought = useStore((s) => s.setThought);

  useEffect(() => {
    // Drift statuses.
    const statusTimer = setInterval(() => {
      const agent = pick(agents);
      const current = useStore.getState().statuses[agent.id] ?? agent.defaultStatus;
      if (current === "chatting" || current === "thinking") return;
      const next = pick<AgentStatus>([
        "idle",
        "idle",
        "working",
        "working",
        "thinking",
        "away",
      ]);
      setStatus(agent.id, next);
      if (next === "thinking") {
        // Briefly "think", then settle.
        setTimeout(() => {
          const s = useStore.getState().statuses[agent.id];
          if (s === "thinking") setStatus(agent.id, "working");
        }, 2200);
      }
    }, 1400);

    // Float thought bubbles.
    const thoughtTimer = setInterval(() => {
      const agent = pick(agents);
      if (useStore.getState().selectedAgentId === agent.id) return;
      const current = useStore.getState().statuses[agent.id] ?? agent.defaultStatus;
      if (current === "away") return;
      const phrase = pick(agent.ambientPhrases);
      setThought(agent.id, phrase);
      setTimeout(() => {
        if (useStore.getState().thought[agent.id] === phrase) {
          setThought(agent.id, null);
        }
      }, 3200);
    }, 2600);

    return () => {
      clearInterval(statusTimer);
      clearInterval(thoughtTimer);
    };
  }, [setStatus, setThought]);
}
