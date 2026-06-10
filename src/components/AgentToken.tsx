import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Agent, AgentStatus } from "../types";
import { useStore } from "../store";
import { Avatar } from "./Avatar";
import { home } from "../office/layout";

const STATUS_VAR: Record<AgentStatus, string> = {
  idle: "var(--status-idle)",
  thinking: "var(--status-thinking)",
  working: "var(--status-working)",
  chatting: "var(--status-chatting)",
  away: "var(--status-away)",
};

const ACTIVE: AgentStatus[] = ["thinking", "working", "chatting"];
const SPEED = 240; // px per second when walking

export function AgentToken({ agent }: { agent: Agent }) {
  const pos = useStore((s) => s.positions[agent.id] ?? home[agent.id]);
  const status = useStore((s) => s.statuses[agent.id] ?? agent.defaultStatus);
  const bubble = useStore((s) => s.bubbles[agent.id] ?? null);
  const selectAgent = useStore((s) => s.selectAgent);

  const prev = useRef(pos);
  const dist = Math.hypot(pos.x - prev.current.x, pos.y - prev.current.y);
  const walking = dist > 2;
  const duration = Math.min(2.4, Math.max(0.35, dist / SPEED));
  prev.current = pos;

  const active = ACTIVE.includes(status);

  return (
    <motion.button
      className="token"
      style={{ ["--dept" as string]: agent.departmentColor }}
      initial={false}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ duration, ease: "linear" }}
      onClick={() => selectAgent(agent.id)}
      title={`${agent.name} — ${agent.role}`}
    >
      <AnimatePresence>
        {bubble && (
          <motion.div
            className="token-bubble"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={`token-av${active ? " on" : ""}`}
        animate={walking ? { y: [0, -2, 0] } : { y: 0 }}
        transition={walking ? { duration: 0.32, repeat: Infinity } : { duration: 0.2 }}
      >
        <Avatar seed={agent.id} size={34} />
        <span className="token-dot" style={{ background: STATUS_VAR[status] }} />
      </motion.div>
      <span className="token-name">{agent.name}</span>
    </motion.button>
  );
}
