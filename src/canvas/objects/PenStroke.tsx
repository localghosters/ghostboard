import type { PenObject } from "../../model/types";

export function PenStroke({ object }: { object: PenObject }) {
  const d = pointsToPath(object.points);
  return (
    <path
      data-object-id={object.id}
      data-object-type="pen"
      transform={`translate(${object.x}, ${object.y})`}
      d={d}
      fill="none"
      stroke={object.style.stroke}
      strokeWidth={object.style.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={object.style.opacity}
    />
  );
}

function pointsToPath(points: number[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0]} ${points[1]}`;
  for (let i = 2; i < points.length; i += 2) {
    d += ` L ${points[i]} ${points[i + 1]}`;
  }
  return d;
}
