import type { Viewport } from "../state/store";

const BASE_GRID = 32;

/** Renders a dot grid that stays visually consistent across zoom levels by
 * snapping the pattern to board-space coordinates. */
export function Grid({ viewport }: { viewport: Viewport }) {
  const size = BASE_GRID;
  const offsetX = -viewport.x % size;
  const offsetY = -viewport.y % size;
  const dotRadius = viewport.zoom < 0.4 ? 0 : 1.1;

  return (
    <svg className="gb-grid" aria-hidden="true">
      <defs>
        <pattern
          id="gb-grid-pattern"
          width={size * viewport.zoom}
          height={size * viewport.zoom}
          patternUnits="userSpaceOnUse"
          x={offsetX * viewport.zoom}
          y={offsetY * viewport.zoom}
        >
          <circle cx={1} cy={1} r={dotRadius} fill="var(--gb-grid-dot)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gb-grid-pattern)" />
    </svg>
  );
}
