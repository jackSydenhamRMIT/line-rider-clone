import Matter from "matter-js";

/**
 * Creates a capsule-shaped body (elongated semicircle) between two points
 * This shape is similar to the one used in the original Line Rider
 */
export function createCapsuleSegment(ax: number, ay: number, bx: number, by: number) {
  const thickness = 4; // Track thickness
  const halfThickness = thickness / 2;
  
  // Calculate angle and length
  const angle = Math.atan2(by - ay, bx - ax);
  const length = Math.hypot(bx - ax, by - ay);
  
  // Create a capsule shape (rectangle with semicircular ends)
  // Generate vertices for a capsule (line with semicircular caps)
  const vertices = [];
  
  // Number of points to use for semicircular ends
  const numPointsInSemicircle = 8;
  
  // Create first semicircular end
  for (let i = 0; i <= numPointsInSemicircle; i++) {
    const theta = Math.PI / 2 + (Math.PI * i) / numPointsInSemicircle;
    vertices.push({
      x: -length / 2 + halfThickness * Math.cos(theta),
      y: halfThickness * Math.sin(theta)
    });
  }
  
  // Create second semicircular end
  for (let i = 0; i <= numPointsInSemicircle; i++) {
    const theta = -Math.PI / 2 + (Math.PI * i) / numPointsInSemicircle;
    vertices.push({
      x: length / 2 + halfThickness * Math.cos(theta),
      y: halfThickness * Math.sin(theta)
    });
  }
  
  // Create the body from vertices
  const capsule = Matter.Bodies.fromVertices(
    (ax + bx) / 2,
    (ay + by) / 2,
    [vertices],
    {
      isStatic: true,
      angle,
      friction: 0,
      frictionStatic: 0,
      render: {
        fillStyle: '#000000',
        strokeStyle: '#000000',
        lineWidth: 1
      }
    }
  );
  
  return capsule;
}

/**
 * Creates a smooth track from spline curve points using capsule segments
 */
export function createTrackFromPoints(points: { x: number, y: number }[]) {
  if (points.length < 2) return [];
  
  const segments = [];
  
  // Create capsule segments between each pair of points
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    segments.push(createCapsuleSegment(p1.x, p1.y, p2.x, p2.y));
  }
  
  return segments;
}