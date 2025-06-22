// src/Components/Toolbar.tsx
import { useStore } from "../store";
import { useEffect, useState } from "react";
import "./Toolbar.css";

export default function Toolbar() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const saveLevel = useStore((s) => s.saveLevel);
  const loadLevel = useStore((s) => s.loadLevel);
  const clearAll = useStore((s) => s.clearAll);
  const [visible, setVisible] = useState(false);

  // Animation when toolbar mounts
  useEffect(() => {
    // Small delay to trigger entrance animation
    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 16,
        zIndex: 10,
        padding: "12px 0",
        transform: `translateY(${visible ? 0 : '50px'})`,
        opacity: visible ? 1 : 0,
        transition: "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.5s ease"
      }}
    >
      <button
        onClick={() => setMode(mode === "play" ? "edit" : "play")}
        style={{
          backgroundColor: mode === "play" ? "#ff5252" : "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "10px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        }}
        className="toolbar-button"
      >
        {mode === "play" ? "Stop" : "Play"}
      </button>
      <button
        onClick={saveLevel}
        style={{
          backgroundColor: "#2196f3",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "10px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        }}
        className="toolbar-button"
      >
        Save
      </button>
      <button
        onClick={loadLevel}
        style={{
          backgroundColor: "#ff9800",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "10px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        }}
        className="toolbar-button"
      >
        Load
      </button>
      <button
        onClick={clearAll}
        style={{
          backgroundColor: "#D22B2B",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "10px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
        }}
        className="toolbar-button"
      >
        Clear
      </button>
    </div>
  );
}