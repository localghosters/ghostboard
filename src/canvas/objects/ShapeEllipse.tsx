import type { EllipseObject } from "../../model/types";

export function ShapeEllipse({ object }: { object: EllipseObject }) {
  return (
    <ellipse
      data-object-id={object.id}
      data-object-type="ellipse"
      cx={object.x + object.width / 2}
      cy={object.y + object.height / 2}
      rx={object.width / 2}
      ry={object.height / 2}
      fill={object.style.fill}
      stroke={object.style.stroke}
      strokeWidth={object.style.strokeWidth}
      opacity={object.style.opacity}
    />
  );
}
