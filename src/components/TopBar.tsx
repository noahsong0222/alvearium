import { useStore } from "../store";
import { agents } from "../data/agents";
import { HoneycombLogo } from "./HoneycombLogo";

export function TopBar() {
  const ollamaUp = useStore((s) => s.ollamaUp);

  return (
    <header className="topbar">
      <div className="brand">
        <HoneycombLogo />
        <div>
          <h1>ALVEARIUM</h1>
          <div className="tag">{agents.length} agents · the AI office</div>
        </div>
      </div>

      <div className="topbar-spacer" />

      <div className="ollama-pill" title="Local Ollama server status">
        <span className={`dot ${ollamaUp ? "up" : "down"}`} />
        {ollamaUp ? "ollama online" : "ollama offline"}
      </div>
    </header>
  );
}
