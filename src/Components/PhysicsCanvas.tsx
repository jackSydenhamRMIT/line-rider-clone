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
        background: '#ffffff',
      },
    });

    /* ---------- 2. Minimal demo bodies (box + ground) ---------- */
    const box = Matter.Bodies.rectangle(
      400, // x
      100, // y
      60, // width
      20, // height
      {
        friction: 0,
        frictionAir: 0,
        restitution: 0, // “perfect” bounce
        chamfer: { radius: 10 }, // ← round the corners (≤ half the height)
      }
    );
    Matter.World.add(engine.world, [box]);

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
      style={{ width: "100%", height: "100%", display: "block"}}
    />
  );
}
