# Alvearium

A multi-agent AI office visualizer. Twenty-seven specialist agents work side by
side across seven departments — you can watch them, click one to chat, assign
tasks, and see them respond in real time, each powered by a local Ollama model.

This is the combined project repository. **Every agent is its own GitHub repo,
included here as a git submodule** under `agents/`. Each was built and tuned
independently, then assembled into this single parent repo.

## Cloning

Because the agents are submodules, clone recursively:

```bash
git clone --recursive https://github.com/noahsong0222/alvearium.git
# already cloned without --recursive?
git submodule update --init --recursive
```

## Structure

```
alvearium/
  roster.json        # index of all 27 agents (id, name, role, department, color)
  agents/            # one git submodule per agent
    noah/            # system-prompt.md, config.json, model-settings.json, README.md
    vincent/
    ...
  (app/ — the React + Vite visualizer, added next)
```

Each agent folder contains:

| File | Purpose |
|------|---------|
| `system-prompt.md` | The agent's persona and role-specific reasoning |
| `config.json` | Identity, department, color, avatar, ambient behavior |
| `model-settings.json` | LLM provider, model, sampling params, fallback |
| `README.md` | The agent's role and personality |

## The roster

**Management** — Noah (CEO), Vincent (COO), Victoire (Chief of Staff), Lucifer
(Devil's Advocate / Red Team), Amaury (Innovation Lead)

**Engineering** — Marcel (Senior Dev), Victor (Backend), Laurent (Frontend), Andre
(DevOps), Raphael (Security), Alexander (ML / AI)

**Design** — Camille (UI + Design Systems), Vivienne (Product / UX), Valerie (Brand)

**Trading Floor** — Lucien (Quant), Hugo (Trader), Yves (Risk), Valentino
(Portfolio Manager), Séraphine (Macro Strategist)

**Research** — Armand (Web Researcher), Thierry (Data Analyst), René (Market
Researcher), Pierre (Research Scientist)

**People & Culture** — Rosalie (Organizational Psychologist), Céline (HR Lead)

**Meta / Intelligence** — Gautier (Memory Keeper), Aurélien (Forecaster)

## Backend

Agents run on a local [Ollama](https://ollama.com) model (`qwen2.5:14b` by default,
at `localhost:11434`), with an optional Claude API fallback when the local host is
unreachable.

## Status

- [x] All 27 agent repos built, tuned, and assembled as submodules
- [ ] Alvearium app — the office floor visualizer (React + Vite + TypeScript)
