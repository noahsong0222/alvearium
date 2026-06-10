import { agents, agentsById } from "../data/agents";

export interface Delegation {
  handle: string;
  task: string;
}

/** A line listing of the whole team, used to make agents roster-aware. */
function rosterLines(excludeId: string): string {
  return agents
    .filter((a) => a.id !== excludeId)
    .map((a) => `- @${a.id} — ${a.name}, ${a.role} (${a.department})`)
    .join("\n");
}

/**
 * Extra system context that makes an agent able to delegate. Appended to the
 * agent's own persona so they keep their voice but gain a team + a protocol.
 */
export function delegationSystem(managerId: string): string {
  return `## Your team at Alvearium
You don't work alone. These teammates report into the org and you can hand work to any of them:

${rosterLines(managerId)}

## Delegating work
When a request genuinely needs other specialists, break it into concrete subtasks and assign each to the right person. Assign by writing lines in EXACTLY this format, one per line:

@handle: the specific, concrete task for them

Rules:
- Use the exact @handle from the list (e.g. @marcel, @camille).
- One teammate per line. Assign to the right specialist for each piece.
- Give a one-line plan first, then the @handle: assignment lines.
- Do NOT answer on their behalf — they will respond themselves.
- Only delegate when it actually needs other people. For a simple question, just answer directly with no @handle lines.
- Assign at most 4 people. Keep each task tight and actionable.`;
}

/** Parse "@handle: task" assignment lines out of an agent's reply. */
export function parseDelegations(text: string, managerId: string): Delegation[] {
  const out: Delegation[] = [];
  const seen = new Set<string>();
  const re = /(?:^|\n)\s*@([a-z]+)\s*[:\-–]\s*(.+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const handle = m[1].toLowerCase();
    const task = m[2].trim().replace(/\s+$/, "");
    if (handle === managerId) continue;
    if (!agentsById[handle]) continue;
    if (seen.has(handle)) continue;
    seen.add(handle);
    out.push({ handle, task });
  }
  return out;
}

/** The message a delegated agent receives from their manager. */
export function delegationPrompt(
  managerName: string,
  managerRole: string,
  task: string,
  original: string,
): string {
  return `${managerName} (${managerRole}) just delegated this to you:

"${task}"

(The original request was: "${original}")

Handle it in your own voice — give your answer or how you'll do it. Be concrete and tight. You are doing this piece yourself; don't re-delegate.`;
}

/** The synthesis message the manager gets back after the team has replied. */
export function synthesisPrompt(
  original: string,
  replies: { name: string; handle: string; text: string }[],
): string {
  const block = replies
    .map((r) => `@${r.handle} (${r.name}):\n${r.text}`)
    .join("\n\n");
  return `Your team has responded to the work you delegated for: "${original}"

${block}

Now close the loop: give a short final answer that pulls this together and confirms who owns what. Stay in your voice. Do not add new @handle assignments.`;
}
