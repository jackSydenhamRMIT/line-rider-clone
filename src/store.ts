import Matter from "matter-js";
import { create } from "zustand";

// src/store.ts
type Mode = "edit" | "play";

// Define interfaces for serialized body data
interface Vector2D {
  x: number;
  y: number;
}

interface SerializedBody {
  position: Vector2D;
  vertices: Vector2D[];
}

interface Store {
  engine: Matter.Engine | null;
  runner: Matter.Runner | null;
  mode: Mode;
  setEngine: (e: Matter.Engine) => void;
  setRunner: (r: Matter.Runner) => void;
  setMode: (m: Mode) => void;
  addBodies: (b: Matter.Body[]) => void;
  saveLevel: () => void;
  loadLevel: () => void;
}

export const useStore = create<Store>((set, get) => ({
  engine: null,
  runner: null,
  mode: "edit",

  setEngine: (engine) => set({ engine }),
  setRunner: (runner) => set({ runner }),
  setMode: (mode) => {
    const { runner, engine } = get();
    // Pause / resume physics automatically
    if (runner && engine) {
      if (mode === "play") {
        Matter.Runner.run(runner, engine);
      } else {
        Matter.Runner.stop(runner);
      }
    }
    set({ mode });
  },

  addBodies: (bodies) => {
    const { engine } = get();
    if (engine) Matter.World.add(engine.world, bodies);
  },

  saveLevel: () => {
    const { engine } = get();
    if (!engine) return;
    const bodies = Matter.Composite.allBodies(engine.world);
    const serial = bodies.map((b) => ({
      position: b.position,
      vertices: b.vertices.map((v) => ({ x: v.x, y: v.y })),
    }));
    localStorage.setItem("track", JSON.stringify(serial));
  },

  loadLevel: () => {
    const { engine } = get();
    const txt = localStorage.getItem("track");
    if (!txt || !engine) return;
    const data = JSON.parse(txt);
    const bodies = data.map((b: SerializedBody) =>
      Matter.Bodies.fromVertices(
        b.position.x,
        b.position.y,
        [b.vertices],
        { isStatic: true },
        true
      )
    );
    Matter.World.clear(engine.world, false);
    Matter.World.add(engine.world, bodies);
  },
}));
