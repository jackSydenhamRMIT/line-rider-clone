import Matter from "matter-js";

export function createCapsuleSegment(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  options: {
    fillColor?: string;
    strokeColor?: string;
    friction?: number;
  } = {}
) {
  const thickness = 4;
  const halfThickness = thickness / 2;

  // calc track angle and length
  const angle = Math.atan2(by - ay, bx - ax);
  const length = Math.hypot(bx - ax, by - ay);
  const vertices = [];

  // unused now del
  const numPointsInSemicircle = 8;
  for (let i = 0; i <= numPointsInSemicircle; i++) {
    const theta = Math.PI / 2 + (Math.PI * i) / numPointsInSemicircle;
    vertices.push({
      x: -length / 2 + halfThickness * Math.cos(theta),
      y: halfThickness * Math.sin(theta),
    });
  }

  for (let i = 0; i <= numPointsInSemicircle; i++) {
    const theta = -Math.PI / 2 + (Math.PI * i) / numPointsInSemicircle;
    vertices.push({
      x: length / 2 + halfThickness * Math.cos(theta),
      y: halfThickness * Math.sin(theta),
    });
  }

  // track properties
  const fillColor = options.fillColor || "#000000";
  const strokeColor = options.strokeColor || "#000000";
  const friction = options.friction !== undefined ? options.friction : 0;

  const capsule = Matter.Bodies.fromVertices(
    (ax + bx) / 2,
    (ay + by) / 2,
    [vertices],
    {
      isStatic: true,
      angle,
      friction: friction,
      frictionStatic: friction,
      render: {
        fillStyle: fillColor,
        strokeStyle: strokeColor,
        lineWidth: 1,
      },
    }
  );

  return capsule;
}

export function createTrackFromPoints(
  points: { x: number; y: number }[],
  options: {
    fillColor?: string;
    strokeColor?: string;
    friction?: number;
  } = {}
) {
  if (points.length < 2) return [];

  const segments = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    segments.push(createCapsuleSegment(p1.x, p1.y, p2.x, p2.y, options));
  }

  return segments;
}

export function createRocketTrackFromPoints(
  points: { x: number; y: number }[]
) {
  return createTrackFromPoints(points, {
    fillColor: "#4287f5",
    strokeColor: "#2563eb",
    friction: -0.5, // negative friction for speed boost doesnt work :(
  });
}
