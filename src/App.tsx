import { useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { OfficeFloor } from "./components/OfficeFloor";
import { ChatPanel } from "./components/ChatPanel";
import { useAmbient } from "./hooks/useAmbient";
import { useStore } from "./store";
import { pingOllama } from "./lib/ollama";

export function App() {
  useAmbient();
  const setOllamaUp = useStore((s) => s.setOllamaUp);

  useEffect(() => {
    let alive = true;
    const check = () => pingOllama().then((up) => alive && setOllamaUp(up));
    check();
    const t = setInterval(check, 8000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [setOllamaUp]);

  return (
    <div className="app">
      <TopBar />
      <OfficeFloor />
      <ChatPanel />
    </div>
  );
}
