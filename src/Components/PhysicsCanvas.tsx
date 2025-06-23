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

    // Sled Object ---------------------------------------------------------------
    (() => {
      const x = canvas.width/3;
      const y = canvas.height/6;

      /* base dimensions (tweak just these) */
      const rectW = 80;
      const rectH = 20;

      /* derived dimensions ----------------------------------------------------- */
      const radius = rectH; // wheel radius = deck height
      const barLength = rectW * 0.375;
      const barThick = rectH * 0.01;
      const handleWide = rectW * 0.001;
      const handleTall = rectH * 0.3; 

      /* reusable outline style */
      const outline = {
        fillStyle: "transparent",
        strokeStyle: "#000",
        lineWidth: 2,
      };

      /* parts ------------------------------------------------------------------ */
      // horizontal top bar (80 % across the deck, flush with wheel top)
      const topBar = Matter.Bodies.rectangle(
        x - rectW / 2 + rectW * 0.8, // centre-x
        y - rectH / 2 - radius, // centre-y
        barLength,
        barThick,
        { render: outline, density: 1e-10 }
      );

      const rearTop = Matter.Bodies.rectangle(
        x - rectW / 3, // centre-x
        y - rectH / 2,
        barLength / 3,
        barThick,
        { render: outline, density: 1e-10 }
      );

      // vertical handle (≈ 61 % across, 1.3 × deck-height above centre)
      const handle = Matter.Bodies.rectangle(
        x - rectW / 2 + rectW * 0.6125,
        y - rectH * 1.3,
        handleWide,
        handleTall,
        { render: outline, density: 1e-10 }
      );

      // deck
      const deck = Matter.Bodies.rectangle(x + rectW / 8, y, rectW * 0.8, rectH, {
        friction: 0,
        frictionAir: 0,
        restitution: 0,
        render: outline,
      });

      // wheel (right edge, centred vertically on deck’s top face)
      const wheel = Matter.Bodies.circle(x + rectW / 2, y - rectH / 2, radius, {
        friction: 0,
        frictionAir: 0,
        restitution: 0,
        render: outline,
        density: 1e-10,
      });

      /* assemble + add to the world ------------------------------------------- */
      const sled = Matter.Body.create({
        parts: [topBar, rearTop, handle, deck, wheel],
        friction: 0,
        frictionAir: 0,
        restitution: 0,
        collisionFilter: { group: -1 },
        render: outline,
      });

      Matter.World.add(engine.world, sled);
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

  /* React to mode changes (pause / resume) - handled by store.setMode */
  // The useEffect below was removed because it duplicates logic in store.setMode
  // This was causing issues when toggling between play and stop modes
  // The store.setMode function already handles starting/stopping the runner
  // and properly sets up gravity and resets the demo body position

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
