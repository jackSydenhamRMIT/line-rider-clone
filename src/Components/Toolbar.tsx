// src/Toolbar.tsx
import { useStore } from "../store";

export default function Toolbar() {
  const mode      = useStore((s) => s.mode);
  const setMode   = useStore((s) => s.setMode);
  const saveLevel = useStore((s) => s.saveLevel);
  const loadLevel = useStore((s) => s.loadLevel);

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        display: "flex",
        gap: 8,
        zIndex: 10,
      }}
    >
      <button onClick={() => setMode(mode === "play" ? "edit" : "play")}>
        {mode === "play" ? "Stop" : "Play"}
      </button>
      <button onClick={saveLevel}>Save</button>
      <button onClick={loadLevel}>Load</button>
    </div>
  );
}
