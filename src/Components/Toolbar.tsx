import { useStore } from "../store";
import { useEffect, useState, useRef } from "react";
import "./Toolbar.css";
import { Pencil, PencilLine /*Rocket*/ } from "lucide-react";

export default function Toolbar() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const drawingMode = useStore((s) => s.drawingMode);
  const setDrawingMode = useStore((s) => s.setDrawingMode);
  const saveLevel = useStore((s) => s.saveLevel);
  const loadLevel = useStore((s) => s.loadLevel);
  const clearAll = useStore((s) => s.clearAll);
  const [visible, setVisible] = useState(false);
  const hasBeenShown = useRef(false);

  // hide toolbar at first
  const handleMouseMove = (e: Event) => {
    const shouldBeVisible = e as MouseEvent;

    if (shouldBeVisible) {
      hasBeenShown.current = true;
      setVisible(true);
    } else if (!hasBeenShown.current) {
      setVisible(false);
    }
  };

  /* hook mouse movement inside workspace */
  useEffect(() => {
    const wrapper = document.querySelector(".editor-wrapper");
    if (!wrapper) return;
    wrapper.addEventListener("mousemove", handleMouseMove);
    return () => wrapper.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Hover Hint */}
      <div
        className="hover-hint"
        style={{
          opacity: visible ? 0 : 1,
        }}
      >
        HOVER HERE
      </div>

      {/* Top toolbar */}
      <div
        className="toolbar-container-top-left"
        style={{
          transform: `translateY(${visible ? 0 : "-16px"})`,
          opacity: visible ? 1 : 0,
        }}
      >
        <button
          onClick={() => setDrawingMode("pencil")}
          style={{
            backgroundColor: drawingMode === "pencil" ? "#c0c0c0" : "#f5f5f5",
            color: "#333",
            border: drawingMode === "pencil" ? "2px solid #333" : "none",
            borderRadius: "50px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
            transform: drawingMode === "pencil" ? "scale(1.1)" : "scale(1)",
          }}
          className="toolbar-button pencil-button"
          title="Pencil Tool (Default)"
        >
          <Pencil style={{ width: "20px", height: "20px" }} />
        </button>
        <button
          onClick={() => setDrawingMode("line")}
          style={{
            backgroundColor: drawingMode === "line" ? "#c0c0c0" : "#f5f5f5",
            color: "#333",
            border: drawingMode === "line" ? "2px solid #333" : "none",
            borderRadius: "50px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
            transform: drawingMode === "line" ? "scale(1.1)" : "scale(1)",
          }}
          className="toolbar-button line-button"
          title="Line Tool (Straight Lines)"
        >
          <PencilLine style={{ width: "20px", height: "20px" }} />
        </button>

        {/* my theory on this funtionality fell through gg
         <button
          onClick={() => setDrawingMode("rocket")}
          style={{
            backgroundColor: drawingMode === "rocket" ? "#c0c0c0" : "#f5f5f5",
            color: "#333",
            border: drawingMode === "rocket" ? "2px solid #333" : "none",
            borderRadius: "50px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
            transform: drawingMode === "rocket" ? "scale(1.1)" : "scale(1)",
          }}
          className="toolbar-button blue-pencil-button"
          title="Rocket Tool (Speed Boost Tracks)"
        >
          <Rocket style={{ width: "20px", height: "20px" }}/>
        </button> */}
      </div>

      {/* Bottom toolbar */}
      <div
        className="toolbar-container"
        style={{
          transform: `translateY(${visible ? 0 : "16px"})`,
          opacity: visible ? 1 : 0,
        }}
      >
        <button
          onClick={() => setMode(mode === "play" ? "edit" : "play")}
          style={{
            backgroundColor: "#f5f5f5",
            color: "#333",
            border: "none",
            padding: "10px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
          }}
          className={`toolbar-button ${
            mode === "play" ? "stop-button" : "play-button"
          }`}
        >
          {mode === "play" ? "Stop" : "Play"}
        </button>
        <button
          onClick={saveLevel}
          style={{
            backgroundColor: "#f5f5f5",
            color: "#333",
            border: "none",
            padding: "10px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
          }}
          className="toolbar-button save-button"
        >
          Save
        </button>
        <button
          onClick={loadLevel}
          style={{
            backgroundColor: "#f5f5f5",
            color: "#333",
            border: "none",
            padding: "10px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
          }}
          className="toolbar-button load-button"
        >
          Load
        </button>
        <button
          onClick={clearAll}
          style={{
            backgroundColor: "#f5f5f5",
            color: "#333",
            border: "none",
            padding: "10px 24px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
          }}
          className="toolbar-button clear-button"
        >
          Clear
        </button>
      </div>
    </>
  );
}
