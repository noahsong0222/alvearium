import { useStore } from "../store";
import { agents } from "../data/agents";
import { HoneycombLogo } from "./HoneycombLogo";

export function TopBar() {
  const ollamaUp = useStore((s) => s.ollamaUp);

  return (
    <header className="topbar">
      <div className="brand">
        <HoneycombLogo size={26} />
        <div>
          <h1>ALVEARIUM</h1>
          <div className="tag">{agents.length} agents // the ai office</div>
        </div>
      </div>

      <div className="topbar-spacer" />

      <div className="ollama-pill" title="Local Ollama server status">
        <span className={`sq ${ollamaUp ? "up" : "down"}`} />
        ollama: {ollamaUp ? "online" : "offline"}
      </div>
    </header>
  );
}
