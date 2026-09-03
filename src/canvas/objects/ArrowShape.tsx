import type { ArrowObject } from "../../model/types";

/** Arrows are simple point-to-point vectors for V1. `startObjectId` /
 * `endObjectId` are reserved so a future contributor can add "smart"
 * connections that follow objects when they move (see ROADMAP.md). */
export function ArrowShape({ object }: { object: ArrowObject }) {
  const markerId = `arrowhead-${object.id}`;
  return (
    <g data-object-id={object.id} data-object-type="arrow">
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="5"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={object.style.stroke} />
        </marker>
      </defs>
      <line
        x1={object.x}
        y1={object.y}
        x2={object.x2}
        y2={object.y2}
        stroke={object.style.stroke}
        strokeWidth={object.style.strokeWidth}
        strokeLinecap="round"
        opacity={object.style.opacity}
        markerEnd={`url(#${markerId})`}
      />
    </g>
  );
}
