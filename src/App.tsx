import { useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { OfficeRoom } from "./components/OfficeRoom";
import { OfficeFeed } from "./components/OfficeFeed";
import { ChatPanel } from "./components/ChatPanel";
import { useOfficeLife } from "./office/useOfficeLife";
import { useStore } from "./store";
import { pingOllama } from "./lib/ollama";

export function App() {
  useOfficeLife();
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
      <OfficeRoom />
      <OfficeFeed />
      <ChatPanel />
    </div>
  );
}
