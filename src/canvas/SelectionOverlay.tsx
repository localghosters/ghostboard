import type { BoardObject } from "../model/types";
import { getBounds } from "../model/geometry";

const HANDLE_SIZE = 8;

export type HandleId = "nw" | "ne" | "sw" | "se" | "start" | "end";

export function SelectionOverlay({
  objects,
  zoom,
}: {
  objects: BoardObject[];
  zoom: number;
}) {
  const single = objects.length === 1 ? objects[0] : null;
  const hs = HANDLE_SIZE / zoom;

  return (
    <g className="gb-selection-overlay">
      {objects.map((obj) => {
        if (obj.type === "line" || obj.type === "arrow") {
          return (
            <line
              key={obj.id}
              x1={obj.x}
              y1={obj.y}
              x2={obj.x2}
              y2={obj.y2}
              className="gb-selection-outline"
              strokeWidth={1.5 / zoom}
            />
          );
        }
        const b = getBounds(obj);
        return (
          <rect
            key={obj.id}
            x={b.x}
            y={b.y}
            width={b.width}
            height={b.height}
            className="gb-selection-outline"
            strokeWidth={1.5 / zoom}
          />
        );
      })}

      {single && (single.type === "line" || single.type === "arrow") && (
        <>
          <circle data-handle="start" cx={single.x} cy={single.y} r={hs} className="gb-handle" />
          <circle data-handle="end" cx={single.x2} cy={single.y2} r={hs} className="gb-handle" />
        </>
      )}

      {single && single.type !== "line" && single.type !== "arrow" && single.type !== "pen" && (
        <>
          {(["nw", "ne", "sw", "se"] as HandleId[]).map((corner) => {
            const b = getBounds(single);
            const cx = corner.includes("w") ? b.x : b.x + b.width;
            const cy = corner.includes("n") ? b.y : b.y + b.height;
            return (
              <rect
                key={corner}
                data-handle={corner}
                x={cx - hs / 2}
                y={cy - hs / 2}
                width={hs}
                height={hs}
                className="gb-handle"
              />
            );
          })}
        </>
      )}
    </g>
  );
}
