import { motion, AnimatePresence } from "framer-motion";
import type { Agent, AgentStatus } from "../types";
import { useStore } from "../store";

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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      title={`${agent.name} — ${agent.role}`}
    >
      <AnimatePresence>
        {thought && (
          <motion.div
            className="thought"
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.9 }}
          >
            {thought}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="monitor">
        {active && (
          <motion.div
            className="scan"
            animate={{ opacity: [0, 1, 0], x: ["-60%", "60%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: 1 }}
          />
        )}
        {[28, 16, 22].map((w, i) => (
          <motion.div
            key={i}
            className="code-line"
            style={{ width: w }}
            animate={active ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.4 }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.25,
            }}
          />
        ))}
      </div>

      <div className="desk-body">
        <span className="avatar">{agent.avatar}</span>
        <div className="desk-meta">
          <div className="desk-name">{agent.name}</div>
          <div className="desk-role">{agent.role}</div>
        </div>
        <motion.span
          className="status-dot"
          style={{ background: dotColor }}
          animate={
            active
              ? { boxShadow: [`0 0 0 ${dotColor}`, `0 0 8px ${dotColor}`, `0 0 0 ${dotColor}`] }
              : {}
          }
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </div>
    </motion.button>
  );
}
