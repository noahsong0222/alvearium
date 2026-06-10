export type AgentStatus =
  | "idle"
  | "thinking"
  | "working"
  | "chatting"
  | "away";

export interface ModelOptions {
  temperature: number;
  top_p: number;
  num_ctx: number;
}

export interface ModelSettings {
  provider: string;
  host: string;
  model: string;
  options: ModelOptions;
  fallback?: {
    provider: string;
    model: string;
    note?: string;
  };
}

/** Raw shape of each agent's config.json (in agents/<id>/config.json). */
export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  department: string;
  departmentColor: string;
  avatar: string;
  personalityTag: string;
  defaultStatus: AgentStatus;
  ambientPhrases: string[];
  systemPromptFile: string;
  modelSettingsFile: string;
}

/** Fully-resolved agent used throughout the app. */
export interface Agent extends AgentConfig {
  systemPrompt: string;
  model: ModelSettings;
  /** Position of the agent's desk within its department zone grid. */
  deskIndex: number;
}

export interface Department {
  name: string;
  color: string;
  agents: Agent[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  /** True while the assistant message is still streaming in. */
  streaming?: boolean;
}

/** One line in the live office feed (the org-wide activity log). */
export interface FeedEvent {
  id: string;
  /** Agent id of who is speaking/acting (or "you" for the operator). */
  fromId: string;
  /** Optional target agent id (for "X delegated to Y"). */
  toId?: string;
  kind: "command" | "delegate" | "reply" | "synthesis" | "chatter" | "note";
  text: string;
  timestamp: number;
  streaming?: boolean;
}
