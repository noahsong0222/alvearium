import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AgentStatus, ChatMessage, FeedEvent } from "./types";
import { agentsById } from "./data/agents";
import { streamChat } from "./lib/ollama";
import { home, meetingSlot, type Vec } from "./office/layout";
import {
  delegationSystem,
  parseDelegations,
  delegationPrompt,
  synthesisPrompt,
} from "./lib/orchestrator";

let seq = 0;
const newId = () => `${Date.now()}-${seq++}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PersistedState {
  chats: Record<string, ChatMessage[]>;
}

interface AppState extends PersistedState {
  selectedAgentId: string | null;
  statuses: Record<string, AgentStatus>;
  ollamaUp: boolean;
  bubbles: Record<string, string | null>;
  positions: Record<string, Vec>;
  feed: FeedEvent[];
  feedOpen: boolean;
  busy: boolean;

  selectAgent: (id: string | null) => void;
  setStatus: (id: string, status: AgentStatus) => void;
  setOllamaUp: (up: boolean) => void;
  setBubble: (id: string, text: string | null) => void;
  moveTo: (id: string, pos: Vec) => void;
  goHome: (id: string) => void;
  toggleFeed: (open?: boolean) => void;
  clearFeed: () => void;
  clearChat: (id: string) => void;
  sendMessage: (id: string, text: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      const pushFeed = (e: Omit<FeedEvent, "id" | "timestamp">): string => {
        const id = newId();
        set((s) => ({
          feed: [...s.feed, { ...e, id, timestamp: Date.now() }],
        }));
        return id;
      };
      const patchFeed = (id: string, updater: (e: FeedEvent) => FeedEvent) =>
        set((s) => ({ feed: s.feed.map((e) => (e.id === id ? updater(e) : e)) }));

      /** Stream a model reply straight into a feed event; returns full text. */
      const streamToFeed = async (
        agentId: string,
        userText: string,
        feedId: string,
        systemExtra?: string,
      ): Promise<string> => {
        const agent = agentsById[agentId];
        const history: ChatMessage[] = [
          { id: newId(), role: "user", content: userText, timestamp: Date.now() },
        ];
        try {
          let first = true;
          const full = await streamChat(
            agent,
            history,
            (chunk) => {
              if (first) {
                first = false;
                get().setStatus(agentId, "chatting");
              }
              patchFeed(feedId, (e) => ({ ...e, text: e.text + chunk }));
            },
            undefined,
            systemExtra,
          );
          patchFeed(feedId, (e) => ({ ...e, streaming: false }));
          return full;
        } catch {
          patchFeed(feedId, (e) => ({
            ...e,
            streaming: false,
            text: e.text || "(couldn't reach ollama)",
          }));
          return "";
        }
      };

      return {
        chats: {},
        selectedAgentId: null,
        statuses: {},
        ollamaUp: false,
        bubbles: {},
        positions: { ...home },
        feed: [],
        feedOpen: false,
        busy: false,

        selectAgent: (id) => set({ selectedAgentId: id }),
        setStatus: (id, status) =>
          set((s) => ({ statuses: { ...s.statuses, [id]: status } })),
        setOllamaUp: (up) => set({ ollamaUp: up }),
        setBubble: (id, text) =>
          set((s) => ({ bubbles: { ...s.bubbles, [id]: text } })),
        moveTo: (id, pos) =>
          set((s) => ({ positions: { ...s.positions, [id]: pos } })),
        goHome: (id) =>
          set((s) => ({ positions: { ...s.positions, [id]: home[id] } })),
        toggleFeed: (open) =>
          set((s) => ({ feedOpen: open ?? !s.feedOpen })),
        clearFeed: () => set({ feed: [] }),

        clearChat: (id) =>
          set((s) => {
            const chats = { ...s.chats };
            delete chats[id];
            return { chats };
          }),

        sendMessage: async (id, text) => {
          const manager = agentsById[id];
          if (!manager || get().busy) return;
          set({ busy: true });

          const userMsg: ChatMessage = {
            id: newId(),
            role: "user",
            content: text,
            timestamp: Date.now(),
          };
          const replyId = newId();
          const replyMsg: ChatMessage = {
            id: replyId,
            role: "assistant",
            content: "",
            timestamp: Date.now(),
            streaming: true,
          };

          const history = [...(get().chats[id] ?? []), userMsg];
          set((s) => ({
            chats: { ...s.chats, [id]: [...history, replyMsg] },
            statuses: { ...s.statuses, [id]: "thinking" },
          }));

          pushFeed({
            fromId: "you",
            toId: id,
            kind: "command",
            text,
          });

          const patchReply = (u: (m: ChatMessage) => ChatMessage) =>
            set((s) => ({
              chats: {
                ...s.chats,
                [id]: (s.chats[id] ?? []).map((m) =>
                  m.id === replyId ? u(m) : m,
                ),
              },
            }));

          // 1) Manager's own reply (roster-aware, can contain @delegations).
          let managerText = "";
          try {
            let first = true;
            managerText = await streamChat(
              manager,
              history,
              (chunk) => {
                if (first) {
                  first = false;
                  get().setStatus(id, "chatting");
                }
                patchReply((m) => ({ ...m, content: m.content + chunk }));
              },
              undefined,
              delegationSystem(id),
            );
            patchReply((m) => ({ ...m, streaming: false }));
          } catch {
            patchReply((m) => ({
              ...m,
              streaming: false,
              content:
                m.content ||
                "_(couldn't reach ollama — is it running on localhost:11434?)_",
            }));
            get().setStatus(id, "idle");
            set({ busy: false });
            return;
          }

          // 2) Did the manager delegate?
          const delegations = parseDelegations(managerText, id).slice(0, 4);
          if (delegations.length === 0) {
            get().setStatus(id, "idle");
            set({ busy: false });
            return;
          }

          get().toggleFeed(true);
          pushFeed({
            fromId: id,
            kind: "note",
            text: `distributing work to ${delegations.length} ${
              delegations.length === 1 ? "teammate" : "teammates"
            }`,
          });

          // 3) Each delegate walks over, works, and replies into the feed.
          const replies: { name: string; handle: string; text: string }[] = [];
          for (let i = 0; i < delegations.length; i++) {
            const { handle, task } = delegations[i];
            const d = agentsById[handle];
            get().setStatus(handle, "working");
            get().setBubble(handle, task.length > 40 ? task.slice(0, 38) + "…" : task);
            get().moveTo(handle, meetingSlot(id, i));
            await sleep(650);

            pushFeed({ fromId: id, toId: handle, kind: "delegate", text: task });

            const fid = pushFeed({
              fromId: handle,
              kind: "reply",
              text: "",
              streaming: true,
            });
            const replyText = await streamToFeed(
              handle,
              delegationPrompt(manager.name, manager.role, task, text),
              fid,
            );
            replies.push({ name: d.name, handle, text: replyText });

            get().setBubble(handle, null);
            get().setStatus(handle, "idle");
            get().goHome(handle);
            await sleep(250);
          }

          // 4) Manager synthesizes the team's work.
          get().setStatus(id, "thinking");
          const sid = pushFeed({
            fromId: id,
            kind: "synthesis",
            text: "",
            streaming: true,
          });
          const finalText = await streamToFeed(
            id,
            synthesisPrompt(text, replies),
            sid,
            delegationSystem(id),
          );
          if (finalText) {
            set((s) => ({
              chats: {
                ...s.chats,
                [id]: [
                  ...(s.chats[id] ?? []),
                  {
                    id: newId(),
                    role: "assistant",
                    content: finalText,
                    timestamp: Date.now(),
                  },
                ],
              },
            }));
          }
          get().setStatus(id, "idle");
          set({ busy: false });
        },
      };
    },
    {
      name: "alvearium-chats",
      storage: createJSONStorage(() => localStorage),
      partialize: (s): PersistedState => ({ chats: s.chats }),
    },
  ),
);
