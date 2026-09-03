import { CanvasView } from "./canvas/CanvasView";
import { ContextPanel } from "./components/ContextPanel";
import { TopBar } from "./components/TopBar";
import { Toolbar } from "./components/Toolbar";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

export default function App() {
  useKeyboardShortcuts();

  return (
    <div className="gb-app">
      <TopBar />
      <div className="gb-workspace">
        <Toolbar />
        <CanvasView />
        <ContextPanel />
      </div>
    </div>
  );
}
