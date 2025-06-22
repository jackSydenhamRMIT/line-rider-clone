import DrawOverlay from "./DrawOverlay";
import PhysicsCanvas from "./PhysicsCanvas";
import Toolbar from "./Toolbar";

export default function Editor() {
  return (
    <>
      <PhysicsCanvas />
      <DrawOverlay />
      <Toolbar />
    </>
  );
}
