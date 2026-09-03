import type { BoardObject, PenObject } from "./types";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Axis-aligned bounding box for any object, in board space. Used for
 * selection outlines, marquee selection, and export bounds. */
export function getBounds(obj: BoardObject): Rect {
  switch (obj.type) {
    case "line":
    case "arrow": {
      const x = Math.min(obj.x, obj.x2);
      const y = Math.min(obj.y, obj.y2);
      return {
        x,
        y,
        width: Math.max(Math.abs(obj.x2 - obj.x), 1),
        height: Math.max(Math.abs(obj.y2 - obj.y), 1),
      };
    }
    case "pen": {
      const pen = obj as PenObject;
      let minX = 0;
      let minY = 0;
      let maxX = 0;
      let maxY = 0;
      for (let i = 0; i < pen.points.length; i += 2) {
        const px = pen.points[i];
        const py = pen.points[i + 1];
        minX = Math.min(minX, px);
        minY = Math.min(minY, py);
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      }
      return {
        x: pen.x + minX,
        y: pen.y + minY,
        width: Math.max(maxX - minX, 1),
        height: Math.max(maxY - minY, 1),
      };
    }
    default:
      return { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
  }
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function pointInRect(p: { x: number; y: number }, r: Rect): boolean {
  return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
}

const LINE_HIT_TOLERANCE = 8;

function distanceToSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

/** Hit-test a point (board space) against an object. Box-shaped objects use
 * simple bounds containment; line-like objects use distance-to-segment so
 * thin strokes remain clickable. */
export function hitTestObject(obj: BoardObject, p: { x: number; y: number }, toleranceOverride?: number): boolean {
  const tolerance = toleranceOverride ?? LINE_HIT_TOLERANCE;
  switch (obj.type) {
    case "line":
    case "arrow":
      return distanceToSegment(p, { x: obj.x, y: obj.y }, { x: obj.x2, y: obj.y2 }) <= tolerance;
    case "pen": {
      const pen = obj as PenObject;
      for (let i = 0; i < pen.points.length - 2; i += 2) {
        const a = { x: pen.x + pen.points[i], y: pen.y + pen.points[i + 1] };
        const b = { x: pen.x + pen.points[i + 2], y: pen.y + pen.points[i + 3] };
        if (distanceToSegment(p, a, b) <= tolerance) return true;
      }
      return false;
    }
    default:
      return pointInRect(p, getBounds(obj));
  }
}

export function unionBounds(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
