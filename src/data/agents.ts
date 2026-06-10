import type { Agent, AgentConfig, Department, ModelSettings } from "../types";
import roster from "../../roster.json";

/**
 * Load every agent from the submodules under agents/<id>/.
 * Each agent contributes:
 *   - config.json        -> identity, department, avatar, ambient phrases
 *   - system-prompt.md   -> persona (raw text, used for chat)
 *   - model-settings.json-> provider / model / sampling
 *
 * Vite resolves these at build time via import.meta.glob.
 */
const configModules = import.meta.glob<AgentConfig>("../../agents/*/config.json", {
  eager: true,
  import: "default",
});

const promptModules = import.meta.glob<string>("../../agents/*/system-prompt.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const modelModules = import.meta.glob<ModelSettings>(
  "../../agents/*/model-settings.json",
  { eager: true, import: "default" },
);

/** Pull the agent id (folder name) out of a globbed path. */
function idFromPath(path: string): string {
  const match = path.match(/agents\/([^/]+)\//);
  return match ? match[1] : path;
}

function byId<T>(modules: Record<string, T>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [path, mod] of Object.entries(modules)) {
    out[idFromPath(path)] = mod;
  }
  return out;
}

const configsById = byId(configModules);
const promptsById = byId(promptModules);
const modelsById = byId(modelModules);

// Track how many desks each department has placed, for deskIndex layout.
const deskCounter: Record<string, number> = {};

/** Department display order + canonical colors come from roster.json. */
const departmentOrder: { name: string; color: string }[] = roster.departments;

const agents: Agent[] = roster.agents
  .map((entry): Agent | null => {
    const config = configsById[entry.id];
    if (!config) return null;
    const deskIndex = deskCounter[config.department] ?? 0;
    deskCounter[config.department] = deskIndex + 1;
    return {
      ...config,
      systemPrompt: promptsById[entry.id] ?? "",
      model: modelsById[entry.id],
      deskIndex,
    };
  })
  .filter((a): a is Agent => a !== null);

const agentsById: Record<string, Agent> = Object.fromEntries(
  agents.map((a) => [a.id, a]),
);

const departments: Department[] = departmentOrder.map((dept) => ({
  name: dept.name,
  color: dept.color,
  agents: agents.filter((a) => a.department === dept.name),
}));

export { agents, agentsById, departments };
