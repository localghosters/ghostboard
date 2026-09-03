import type { LineObject } from "../../model/types";

export function ShapeLine({ object }: { object: LineObject }) {
  return (
    <line
      data-object-id={object.id}
      data-object-type="line"
      x1={object.x}
      y1={object.y}
      x2={object.x2}
      y2={object.y2}
      stroke={object.style.stroke}
      strokeWidth={object.style.strokeWidth}
      strokeLinecap="round"
      opacity={object.style.opacity}
    />
  );
}
