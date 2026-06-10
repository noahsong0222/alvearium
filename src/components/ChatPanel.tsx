import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStore } from "../store";
import { agentsById } from "../data/agents";
import type { Agent, ChatMessage } from "../types";
import { PreBlock } from "./CodeBlock";
import { Avatar } from "./Avatar";

function timeOf(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Message({ msg, agent }: { msg: ChatMessage; agent: Agent }) {
  const who = msg.role === "user" ? "you" : agent.name.toLowerCase();
  return (
    <div className={`msg ${msg.role}`}>
      <span className="who">{who} ~$</span>
      <div className="bubble">
        {msg.role === "assistant" ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: PreBlock }}>
            {msg.content}
          </ReactMarkdown>
        ) : (
          msg.content
        )}
        {msg.streaming && <span className="caret" />}
      </div>
      <span className="time">{timeOf(msg.timestamp)}</span>
    </div>
  );
}

export function ChatPanel() {
  const selectedId = useStore((s) => s.selectedAgentId);
  const selectAgent = useStore((s) => s.selectAgent);
  const sendMessage = useStore((s) => s.sendMessage);
  const clearChat = useStore((s) => s.clearChat);
  const messages = useStore((s) =>
    selectedId ? s.chats[selectedId] ?? [] : [],
  );

  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const agent = selectedId ? agentsById[selectedId] : null;

  const streaming = messages.some((m) => m.streaming);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  const submit = () => {
    const text = draft.trim();
    if (!text || !selectedId || streaming) return;
    setDraft("");
    void sendMessage(selectedId, text);
  };

  return (
    <AnimatePresence>
      {agent && (
        <>
          <motion.div
            className="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => selectAgent(null)}
          />
          <motion.aside
            className="chat-panel"
            style={{ ["--dept" as string]: agent.departmentColor }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.22 }}
          >
            <div className="chat-head">
              <Avatar seed={agent.id} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h-name">{agent.name}</div>
                <div className="h-role">{agent.role}</div>
                <span className="h-tag">{agent.personalityTag}</span>
              </div>
              <button
                className="icon-btn"
                title="Clear chat"
                onClick={() => selectedId && clearChat(selectedId)}
              >
                clr
              </button>
              <button
                className="icon-btn"
                title="Close"
                onClick={() => selectAgent(null)}
              >
                x
              </button>
            </div>

            <div className="chat-log" ref={logRef}>
              {messages.length === 0 ? (
                <div className="empty-chat">
                  message {agent.name.toLowerCase()} — responses stream live from
                  your local ollama model.
                </div>
              ) : (
                messages.map((m) => <Message key={m.id} msg={m} agent={agent} />)
              )}
            </div>

            <div className="chat-input">
              <span className="prompt">&gt;</span>
              <textarea
                value={draft}
                rows={1}
                placeholder={`message ${agent.name.toLowerCase()}…`}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
              />
              <button className="send-btn" onClick={submit} disabled={streaming}>
                {streaming ? "···" : "send"}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
