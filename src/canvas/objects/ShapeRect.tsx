import type { RectangleObject } from "../../model/types";

export function ShapeRect({ object }: { object: RectangleObject }) {
  return (
    <rect
      data-object-id={object.id}
      data-object-type="rectangle"
      x={object.x}
      y={object.y}
      width={object.width}
      height={object.height}
      rx={object.cornerRadius}
      ry={object.cornerRadius}
      fill={object.style.fill}
      stroke={object.style.stroke}
      strokeWidth={object.style.strokeWidth}
      opacity={object.style.opacity}
    />
  );
}
