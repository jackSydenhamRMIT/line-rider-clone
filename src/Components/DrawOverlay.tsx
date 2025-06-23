import { useEffect, useRef } from "react";
import { useStore } from "../store";
import { createTrackFromPoints, createRocketTrackFromPoints } from "../utils/physics";

// Point interface
interface Point {
  x: number;
  y: number;
}

export default function DrawOverlay() {
  const { addBodies, drawingMode } = useStore();   // pull the addBodies function and drawingMode from context
  const ref = useRef<HTMLCanvasElement>(null);

  // simple draw buffer
  const points = useRef<Point[]>([]);

  // Create a smooth spline curve through control points
  const createSplineCurve = (controlPoints: Point[], segments = 10): Point[] => {
    if (controlPoints.length < 2) return controlPoints;
    
    // Create extended points array with duplicated endpoints for Catmull-Rom calculation
    const extendedPoints = [
      controlPoints[0], // Duplicate first point
      ...controlPoints,
      controlPoints[controlPoints.length - 1] // Duplicate last point
    ];
    
    const curvePoints: Point[] = [];
    
    // Generate points along the curve for each segment between control points
    for (let i = 0; i < controlPoints.length - 1; i++) {
      // Get 4 points needed for Catmull-Rom calculation
      const p0 = extendedPoints[i];
      const p1 = extendedPoints[i + 1];
      const p2 = extendedPoints[i + 2];
      const p3 = extendedPoints[i + 3] || p2; // Use p2 if p3 doesn't exist
      
      // Add the starting point
      curvePoints.push(p1);
      
      // Generate intermediate points
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        
        // Catmull-Rom spline formula
        const t2 = t * t;
        const t3 = t2 * t;
        
        // Coefficients for Catmull-Rom
        const c0 = -0.5 * t3 + t2 - 0.5 * t;
        const c1 = 1.5 * t3 - 2.5 * t2 + 1;
        const c2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
        const c3 = 0.5 * t3 - 0.5 * t2;
        
        // Calculate the interpolated point
        const x = c0 * p0.x + c1 * p1.x + c2 * p2.x + c3 * p3.x;
        const y = c0 * p0.y + c1 * p1.y + c2 * p2.y + c3 * p3.y;
        
        curvePoints.push({ x, y });
      }
    }
    
    // Add the final point
    curvePoints.push(controlPoints[controlPoints.length - 1]);
    
    return curvePoints;
  };
  
  // Simplify a path using the Ramer-Douglas-Peucker algorithm
  // This reduces the number of points while maintaining the general shape
  const simplifyPath = (points: Point[], tolerance: number): Point[] => {
    if (points.length <= 2) return points;
    
    // Find the point with the maximum distance
    let maxDistance = 0;
    let maxIndex = 0;
    
    const start = points[0];
    const end = points[points.length - 1];
    
    // Find the farthest point from the line connecting start and end
    for (let i = 1; i < points.length - 1; i++) {
      const distance = perpendicularDistance(points[i], start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }
    
    // If the maximum distance is greater than tolerance, recursively simplify
    if (maxDistance > tolerance) {
      const firstPart = simplifyPath(points.slice(0, maxIndex + 1), tolerance);
      const secondPart = simplifyPath(points.slice(maxIndex), tolerance);
      
      // Join the two parts (remove duplicated point)
      return [...firstPart.slice(0, -1), ...secondPart];
    } else {
      // If no point is distant enough, just use the endpoints
      return [start, end];
    }
  };
  
  // Calculate perpendicular distance from a point to a line
  const perpendicularDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    
    // Line length squared
    const lineLengthSq = dx * dx + dy * dy;
    
    if (lineLengthSq === 0) return 0; // Start and end are the same point
    
    // Project the point onto the line
    const t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lineLengthSq;
    
    // If t is outside [0,1], use distance to an endpoint
    if (t < 0) return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
    if (t > 1) return Math.hypot(point.x - lineEnd.x, point.y - lineEnd.y);
    
    // Compute the projected point
    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;
    
    // Return the distance from the point to the projection
    return Math.hypot(point.x - projX, point.y - projY);
  };
  
  // Draw preview based on current drawing mode
  const drawPreview = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    if (points.length < 2) return;
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    
    if (drawingMode === "line") {
      // For line mode, just draw a straight line between first and last point
      const first = points[0];
      const last = points[points.length - 1];
      
      ctx.moveTo(first.x, first.y);
      ctx.lineTo(last.x, last.y);
    } else {
      // For pencil and rocket modes, draw a smooth curve
      const curvePoints = createSplineCurve(points, 8);
      
      ctx.moveTo(curvePoints[0].x, curvePoints[0].y);
      for (let i = 1; i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x, curvePoints[i].y);
      }
    }
    
    // Set color based on drawing mode
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

    /* ---------- pointer handlers ---------- */
    let drawing = false;

    const start = (e: PointerEvent) => {
      drawing = true;
      points.current = [{ x: e.clientX, y: e.clientY }];
    };

    const move = (e: PointerEvent) => {
      if (!drawing) return;

      const { clientX: x, clientY: y } = e;
      const last = points.current[points.current.length - 1]!; // Get last element safely
      const dx = x - last.x;
      const dy = y - last.y;
      if (dx * dx + dy * dy < 25) return; // 5 px tolerance → skip tiny steps
      points.current.push({ x, y });

      // Draw preview based on current drawing mode
      drawPreview(ctx, points.current);
    };

    const end = () => {
      if (!drawing || points.current.length < 2) return;
      drawing = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let trackBodies;

      if (drawingMode === "line") {
        // For line mode, just use the first and last points
        const linePoints = [
          points.current[0],
          points.current[points.current.length - 1]
        ];
        
        // Create a straight line track
        trackBodies = createTrackFromPoints(linePoints);
      } else if (drawingMode === "rocket") {
        // For rocket mode, create a blue track with negative friction
        // First simplify the control points
        const simplifiedPoints = simplifyPath(points.current, 6);
        
        // Then create a smooth curve through the simplified control points
        const curvePoints = createSplineCurve(simplifiedPoints, 8);
        
        // Create rocket track (blue with negative friction)
        trackBodies = createRocketTrackFromPoints(curvePoints);
      } else {
        // For pencil mode (default)
        // First simplify the control points
        const simplifiedPoints = simplifyPath(points.current, 6);
        
        // Then create a smooth curve through the simplified control points
        const curvePoints = createSplineCurve(simplifiedPoints, 8);
        
        // Create regular track
        trackBodies = createTrackFromPoints(curvePoints);
      }
      
      // Add the track bodies to the physics world
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