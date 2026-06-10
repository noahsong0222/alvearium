import type { Agent, ChatMessage } from "../types";

/**
 * Stream a chat completion from the local Ollama server.
 * Requests go through Vite's /ollama proxy (see vite.config.ts) to avoid CORS.
 *
 * onToken is called with each incremental chunk of text.
 * Returns the full text, or throws if Ollama is unreachable.
 */
export async function streamChat(
  agent: Agent,
  history: ChatMessage[],
  onToken: (chunk: string) => void,
  signal?: AbortSignal,
  systemExtra?: string,
): Promise<string> {
  const system = systemExtra
    ? `${agent.systemPrompt}\n\n${systemExtra}`
    : agent.systemPrompt;
  const messages = [
    { role: "system", content: system },
    ...history
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch("/ollama/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model: agent.model?.model ?? "qwen2.5:14b",
      messages,
      stream: true,
      options: agent.model?.options ?? { temperature: 0.7 },
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama responded ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Ollama streams newline-delimited JSON objects.
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line) continue;
      try {
        const json = JSON.parse(line);
        const chunk: string = json.message?.content ?? "";
        if (chunk) {
          full += chunk;
          onToken(chunk);
        }
      } catch {
        // Ignore partial/non-JSON lines.
      }
    }
  }

  return full;
}

/** Quick check whether the Ollama server is up. */
export async function pingOllama(): Promise<boolean> {
  try {
    const res = await fetch("/ollama/api/tags");
    return res.ok;
  } catch {
    return false;
  }
}
