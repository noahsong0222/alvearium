import { motion, AnimatePresence } from "framer-motion";
import type { Agent, AgentStatus } from "../types";
import { useStore } from "../store";
import { Avatar } from "./Avatar";

const STATUS_VAR: Record<AgentStatus, string> = {
  idle: "var(--status-idle)",
  thinking: "var(--status-thinking)",
  working: "var(--status-working)",
  chatting: "var(--status-chatting)",
  away: "var(--status-away)",
};

const ACTIVE: AgentStatus[] = ["thinking", "working", "chatting"];

interface Props {
  agent: Agent;
  index: number;
}

export function Desk({ agent, index }: Props) {
  const status = useStore((s) => s.statuses[agent.id] ?? agent.defaultStatus);
  const thought = useStore((s) => s.thought[agent.id] ?? null);
  const selectAgent = useStore((s) => s.selectAgent);

  const active = ACTIVE.includes(status);
  const dotColor = STATUS_VAR[status];

  return (
    <motion.button
      className={`desk${active ? " active-glow" : ""}`}
      style={{ ["--dept" as string]: agent.departmentColor }}
      onClick={() => selectAgent(agent.id)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.015, duration: 0.2 }}
      title={`${agent.name} — ${agent.role}`}
    >
      <AnimatePresence>
        {thought && (
          <motion.div
            className="thought"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
          >
            {thought}
          </motion.div>
        )}
      </AnimatePresence>

      <Avatar seed={agent.id} size={46} />

      <div className="desk-meta">
        <div className="desk-name">{agent.name}</div>
        <div className="desk-role">{agent.role}</div>
        <div className="desk-status">
          <motion.span
            className="sq"
            style={{ background: dotColor }}
            animate={active ? { opacity: [1, 0.25, 1] } : { opacity: 1 }}
            transition={{ duration: 1.3, repeat: Infinity }}
          />
          {status}
        </div>
      </div>
    </motion.button>
  );
}
