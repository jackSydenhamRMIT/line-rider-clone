import { useEffect, useRef } from "react";
import { useStore } from "../store";
import {
  createTrackFromPoints,
  createRocketTrackFromPoints,
} from "../utils/physics";

interface Point {
  x: number;
  y: number;
}

export default function DrawOverlay() {
  const { addBodies, drawingMode } = useStore();
  const ref = useRef<HTMLCanvasElement>(null);

  // track drawing buffer
  const points = useRef<Point[]>([]);

  // smooth track
  const createSplineCurve = (
    controlPoints: Point[],
    segments = 10
  ): Point[] => {
    if (controlPoints.length < 2) return controlPoints;

    // failed catmull-rom calculation lol .. matter.js doesnt like curves ig .. -2 hours i have to keep this here
    const extendedPoints = [
      controlPoints[0],
      ...controlPoints,
      controlPoints[controlPoints.length - 1],
    ];

    const curvePoints: Point[] = [];

    for (let i = 0; i < controlPoints.length - 1; i++) {
      const p0 = extendedPoints[i];
      const p1 = extendedPoints[i + 1];
      const p2 = extendedPoints[i + 2];
      const p3 = extendedPoints[i + 3] || p2;

      curvePoints.push(p1);

      for (let j = 1; j <= segments; j++) {
        const t = j / segments;

        const t2 = t * t;
        const t3 = t2 * t;

        const c0 = -0.5 * t3 + t2 - 0.5 * t;
        const c1 = 1.5 * t3 - 2.5 * t2 + 1;
        const c2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
        const c3 = 0.5 * t3 - 0.5 * t2;

        const x = c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x;
        const y = c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y;

        curvePoints.push({ x, y });
      }
    }

    curvePoints.push(controlPoints[controlPoints.length - 1]);

    return curvePoints;
  };

  // Ramer Douglas Peucker the goat
  // removes low contributing points
  const simplifyPath = (points: Point[], tolerance: number): Point[] => {
    if (points.length <= 2) return points;

    let maxDistance = 0;
    let maxIndex = 0;

    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const distance = perpendicularDistance(points[i], start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    if (maxDistance > tolerance) {
      const firstPart = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
      const secondPart = simplifyPath(points.slice(maxIndex), tolerance);

      return [...firstPart.slice(0, -1), ...secondPart];
    } else {
      return [start, end];
    }
  };

  const perpendicularDistance = (
    point: Point,
    lineStart: Point,
    lineEnd: Point
  ): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    const lineLengthSq = dx * dx + dy * dy;

    if (lineLengthSq === 0) return 0;

    const t =
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
      lineLengthSq;

    if (t < 0) return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
    if (t > 1) return Math.hypot(point.x - lineEnd.x, point.y - lineEnd.y);

    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;

    return Math.hypot(point.x - projX, point.y - projY);
  };

  // basic drawing preview
  const drawPreview = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();

    if (drawingMode === "line") {
      const first = points[0];
      const last = points[points.length - 1];

      ctx.moveTo(first.x, first.y);
      ctx.lineTo(last.x, last.y);
    } else {
      const curvePoints = createSplineCurve(points, 8);

      ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
      for (let i = 1; i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
      }
    }

    ctx.strokeStyle = drawingMode === "rocket" ? "#4287f5" : "#000000";
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpi = window.devicePixelRatio ?? 1;
    canvas.width = window.innerWidth * dpi;
    canvas.height = window.innerHeight * dpi;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ctx.scale(dpi, dpi);

    // pointer handling
    let drawing = false;

    const start = (e: PointerEvent) => {
      drawing = true;
      points.current = [{ x: e.clientX, y: e.clientY }];
    };

    const move = (e: PointerEvent) => {
      if (!drawing) return;

      const { clientX: x, clientY: y } = e;
      const last = points.current[points.current.length - 1]!;
      const dx = x - last.x;
      const dy = y - last.y;
      if (dx * dx + dy * dy < 25) return;
      points.current.push({ x, y });

      drawPreview(ctx, points.current);
    };

    const end = () => {
      if (!drawing || points.current.length < 2) return;
      drawing = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let trackBodies;

      if (drawingMode === "line") {
        const linePoints = [
          points.current[0],
          points.current[points.current.length - 1],
        ];

        trackBodies = createTrackFromPoints(linePoints);
      } else if (drawingMode === "rocket") {
        const simplifiedPoints = simplifyPath(points.current, 6);

        const curvePoints = createSplineCurve(simplifiedPoints, 8);

        trackBodies = createRocketTrackFromPoints(curvePoints);
      } else {
        const simplifiedPoints = simplifyPath(points.current, 6);

        const curvePoints = createSplineCurve(simplifiedPoints, 8);

        trackBodies = createTrackFromPoints(curvePoints);
      }

      // add track physics world
      addBodies(trackBodies);

      points.current = [];
    };

    canvas.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);

    return () => {
      canvas.removeEventListener("pointerdown", start);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
  }, [addBodies, drawingMode]);

  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, background: "transparent" }}
    />
  );
}
