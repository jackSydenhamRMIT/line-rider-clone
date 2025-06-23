import Matter from "matter-js";
import { create } from "zustand";

// src/store.ts
type Mode = "edit" | "play";
type DrawingMode = "pencil" | "line" | "rocket";

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
  drawingMode: DrawingMode;
  setEngine: (e: Matter.Engine) => void;
  setRunner: (r: Matter.Runner) => void;
  setMode: (m: Mode) => void;
  setDrawingMode: (m: DrawingMode) => void;
  addBodies: (b: Matter.Body[]) => void;
  saveLevel: () => void;
  loadLevel: () => void;
  resetDemoBody: () => void;
  clearAll: () => void;
}

export const useStore = create<Store>((set, get) => ({
  engine: null,
  runner: null,
  mode: "edit",
  drawingMode: "pencil", // init on pencil

  setEngine: (engine) => set({ engine }),
  setDrawingMode: (drawingMode) => set({ drawingMode }),
  setRunner: (runner) => set({ runner }),
  setMode: (mode) => {
    const { runner, engine } = get();
    if (!engine || !runner) {
      set({ mode });
      return;
    }

    if (mode === "play") {
      get().resetDemoBody();
      
      engine.gravity.scale = 0.001;
      engine.gravity.x = 0;
      engine.gravity.y = 1;
      
      runner.enabled = true;
      Matter.Runner.run(runner, engine);
    } else {
      Matter.Runner.stop(runner);
      runner.enabled = false;

      // no gravity while editing
      engine.gravity.scale = 0; 
      engine.gravity.x     = 0;
      engine.gravity.y     = 0;

      get().resetDemoBody();
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

  resetDemoBody: () => {
    const { engine } = get();
    if (!engine) return;
    
    const bodies = Matter.Composite.allBodies(engine.world);
    const demoBody = bodies.find(body => 
      body.parts && body.parts.length > 1 && 
      body.collisionFilter && body.collisionFilter.group === -1
    );
    
    if (demoBody) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const x = canvas.width / 3;
        const y = canvas.height / 6;
        
        // reset position
        Matter.Body.setPosition(demoBody, { x, y });
        Matter.Body.setVelocity(demoBody, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(demoBody, 0);
        Matter.Body.setAngle(demoBody, 0);
      }
    }
  },

  clearAll: () => {
    const { engine } = get();
    if (!engine) return;
    
    const bodies = Matter.Composite.allBodies(engine.world);
    
    const demoBody = bodies.find(body => 
      body.parts && body.parts.length > 1 && 
      body.collisionFilter && body.collisionFilter.group === -1
    );
    
    // del tracks
    Matter.World.clear(engine.world, false);
    
    if (demoBody) {
      Matter.World.add(engine.world, demoBody);
    }
  },
}));
