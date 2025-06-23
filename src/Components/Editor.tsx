import DrawOverlay from "./DrawOverlay";
import "./Editor.css"
import PhysicsCanvas from "./PhysicsCanvas";
import Toolbar from "./Toolbar";

export default function Editor() {
  return (
    <div className="editor-wrapper">
      <PhysicsCanvas />
      <DrawOverlay />
      <Toolbar />
    </div>
  );
}
