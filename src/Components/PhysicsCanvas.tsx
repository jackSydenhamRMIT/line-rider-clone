import { useEffect, useRef } from "react";
import { useStore } from "../store";
import Matter from "matter-js";

export default function PhysicsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const setEngine = useStore((s) => s.setEngine);
  const setRunner = useStore((s) => s.setRunner);
  const mode = useStore((s) => s.mode); // mode tracking

  useEffect(() => {
    const canvas = canvasRef.current!;
    // engine shi
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

    // Sled Object
    (() => {
      const x = canvas.width / 3;
      const y = canvas.height / 6;

      const rectW = 80;
      const rectH = 20;

      const radius = rectH;
      const barLength = rectW * 0.375;
      const barThick = rectH * 0.01;
      const handleWide = rectW * 0.001;
      const handleTall = rectH * 0.3;

      const outline = {
        fillStyle: "transparent",
        strokeStyle: "#000",
        lineWidth: 2,
      };

      const topBar = Matter.Bodies.rectangle(
        x - rectW / 2 + rectW * 0.8,
        y - rectH / 2 - radius,
        barLength,
        barThick,
        { render: outline, density: 1e-10 }
      );

      const rearTop = Matter.Bodies.rectangle(
        x - rectW / 3,
        y - rectH / 2,
        barLength / 3,
        barThick,
        { render: outline, density: 1e-10 }
      );

      const handle = Matter.Bodies.rectangle(
        x - rectW / 2 + rectW * 0.6125,
        y - rectH * 1.3,
        handleWide,
        handleTall,
        { render: outline, density: 1e-10 }
      );

      const deck = Matter.Bodies.rectangle(
        x + rectW / 8,
        y,
        rectW * 0.8,
        rectH,
        {
          friction: 0,
          frictionAir: 0,
          restitution: 0,
          render: outline,
        }
      );

      const wheel = Matter.Bodies.circle(x + rectW / 2, y - rectH / 2, radius, {
        friction: 0,
        frictionAir: 0,
        restitution: 0,
        render: outline,
        density: 1e-10,
      });

      //Final Obj
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

    // init physics
    Matter.Render.run(render);

    setEngine(engine);
    setRunner(runner);

    // when in play mode
    if (mode === "play") {
      Matter.Runner.run(runner, engine);
    }

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, [setEngine, setRunner]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
