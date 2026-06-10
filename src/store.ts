import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AgentStatus, ChatMessage } from "./types";
import { agentsById } from "./data/agents";
import { streamChat } from "./lib/ollama";

let msgSeq = 0;
const newId = () => `${Date.now()}-${msgSeq++}`;

interface PersistedState {
  chats: Record<string, ChatMessage[]>;
}

interface AppState extends PersistedState {
  selectedAgentId: string | null;
  statuses: Record<string, AgentStatus>;
  ollamaUp: boolean;
  thought: Record<string, string | null>;

  selectAgent: (id: string | null) => void;
  setStatus: (id: string, status: AgentStatus) => void;
  setThought: (id: string, text: string | null) => void;
  setOllamaUp: (up: boolean) => void;
  clearChat: (id: string) => void;
  sendMessage: (id: string, text: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      chats: {},
      selectedAgentId: null,
      statuses: {},
      ollamaUp: false,
      thought: {},

      selectAgent: (id) => set({ selectedAgentId: id }),

      setStatus: (id, status) =>
        set((s) => ({ statuses: { ...s.statuses, [id]: status } })),

      setThought: (id, text) =>
        set((s) => ({ thought: { ...s.thought, [id]: text } })),

      setOllamaUp: (up) => set({ ollamaUp: up }),

      clearChat: (id) =>
        set((s) => {
          const chats = { ...s.chats };
          delete chats[id];
          return { chats };
        }),

      sendMessage: async (id, text) => {
        const agent = agentsById[id];
        if (!agent) return;

        const userMsg: ChatMessage = {
          id: newId(),
          role: "user",
          content: text,
          timestamp: Date.now(),
        };
        const assistantId = newId();
        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: Date.now(),
          streaming: true,
        };

        const history = [...(get().chats[id] ?? []), userMsg];
        set((s) => ({
          chats: { ...s.chats, [id]: [...history, assistantMsg] },
          statuses: { ...s.statuses, [id]: "thinking" },
        }));

        const patch = (updater: (m: ChatMessage) => ChatMessage) =>
          set((s) => ({
            chats: {
              ...s.chats,
              [id]: (s.chats[id] ?? []).map((m) =>
                m.id === assistantId ? updater(m) : m,
              ),
            },
          }));

        try {
          let first = true;
          await streamChat(agent, history, (chunk) => {
            if (first) {
              first = false;
              get().setStatus(id, "chatting");
            }
            patch((m) => ({ ...m, content: m.content + chunk }));
          });
          patch((m) => ({ ...m, streaming: false }));
        } catch {
          patch((m) => ({
            ...m,
            streaming: false,
            content:
              m.content ||
              "_(Couldn't reach Ollama. Make sure it's running on localhost:11434 and the model is pulled.)_",
          }));
        } finally {
          get().setStatus(id, "idle");
        }
      },
    }),
    {
      name: "alvearium-chats",
      storage: createJSONStorage(() => localStorage),
      partialize: (s): PersistedState => ({ chats: s.chats }),
    },
  ),
);
