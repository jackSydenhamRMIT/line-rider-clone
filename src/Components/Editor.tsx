import DrawOverlay from "./DrawOverlay";
import PhysicsCanvas from "./PhysicsCanvas";
import Toolbar from "./Toolbar";
import "./Editor.css"

export default function Editor() {
  return (
    <div className="editor-wrapper">
      <PhysicsCanvas />
      <DrawOverlay />
      <Toolbar />
    </div>
  );
}
