// src/PhysicsCanvas.tsx
import { useEffect, useRef } from "react";
import { useStore } from "../store";
import Matter from "matter-js";

export default function PhysicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const setEngine = useStore((s) => s.setEngine);
  const setRunner = useStore((s) => s.setRunner);
  const mode = useStore((s) => s.mode); // watch mode

  useEffect(() => {
    const canvas = canvasRef.current!;
    /* ---------- 1. Create engine / runner / renderer ---------- */
    const engine = Matter.Engine.create();
    const runner = Matter.Runner.create();
    const render = Matter.Render.create({
      engine,
      canvas,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "#ffffff",
      },
    });

    /* ---------- 2. Minimal demo bodies (box + ground) ---------- */
    (() => {
      const x = 400;
      const y = 100;

      /* geometry */
      const rectW = 80;
      const rectH = 20;
      const radius = 20;

      // reusable style object
      const outline = {
        fillStyle: "transparent",
        strokeStyle: "#000",
        lineWidth: 2,
      };

      const topBar = Matter.Bodies.rectangle(
        x + rectW - 56, // centred on the wheel
        y - rectH / 2 - radius, // sits flush with the circle’s top
        30, // bar length  (tweak to taste)
        0.5, // bar thickness
        { render: outline, density: 1e-10 }, // ← same black-outline style
        
      );

      /* 1) flat rectangle (“deck”) */
      const deck = Matter.Bodies.rectangle(x, y, rectW, rectH, {
        friction: 0,
        frictionAir: 0,
        restitution: 0,
        render: outline, // <── black outline, no fil
      });

      /* 2) circle (“wheel”) whose centre sits on the deck’s right-top corner */
      const wheel = Matter.Bodies.circle(x + rectW / 2, y - rectH / 2, radius, {
        friction: 0,
        frictionAir: 0,
        restitution: 0,
        render: outline, // <── same styling
        density: 1e-10
      });

      /* 3) merge into one rigid body */
      const mouseShape = Matter.Body.create({
        parts: [topBar, deck, wheel],
        friction: 0,
        frictionAir: 0,
        restitution: 0,
        collisionFilter: { group: -1 },
        render: outline, // <- catches any new parts you add later
      });

      Matter.World.add(engine.world, mouseShape);
    })();

    /* ---------- 3. Kick off renderer ---------- */
    Matter.Render.run(render);

    /* ---------- 4. Store refs globally ---------- */
    setEngine(engine);
    setRunner(runner);

    /* ---------- 5. Start physics only if in play mode ---------- */
    if (mode === "play") {
      Matter.Runner.run(runner, engine);
    }

    /* ---------- 6. Cleanup ---------- */
    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setEngine, setRunner]); // Intentionally exclude 'mode' to prevent recreation on mode change

  /* React to mode changes (pause / resume) */
  useEffect(() => {
    const { engine, runner } = useStore.getState();
    if (!runner || !engine) return;
    if (mode === "play") {
      Matter.Runner.run(runner, engine);
    } else {
      Matter.Runner.stop(runner);
    }
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
