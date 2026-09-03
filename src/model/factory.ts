import { nanoid } from "nanoid";
import type {
  ArrowObject,
  BoardObject,
  EllipseObject,
  LineObject,
  ObjectStyle,
  PenObject,
  RectangleObject,
  StickyNoteObject,
} from "./types";

const now = () => Date.now();

const defaultStyle = (overrides: Partial<ObjectStyle> = {}): ObjectStyle => ({
  fill: "#2A3441",
  stroke: "#7DE0C7",
  strokeWidth: 2,
  opacity: 1,
  ...overrides,
});

export const STICKY_COLORS = [
  "#F4D35E", // amber
  "#7DE0C7", // mint
  "#A78BFA", // violet
  "#F28482", // coral
  "#8ECAE6", // sky
];

interface Point {
  x: number;
  y: number;
}

/** Creates a sticky note centered on `at`, with a default size. */
export function createStickyNote(at: Point, color = STICKY_COLORS[0]): StickyNoteObject {
  const size = 180;
  return {
    id: nanoid(10),
    type: "sticky",
    x: at.x - size / 2,
    y: at.y - size / 2,
    width: size,
    height: size,
    rotation: 0,
    text: "",
    style: defaultStyle({ fill: color, stroke: color }),
    createdAt: now(),
    updatedAt: now(),
  };
}

/** Creates a shape from a drag rectangle defined by two corners. */
export function createRectangle(a: Point, b: Point, cornerRadius = 0): RectangleObject {
  const box = boxFromPoints(a, b);
  return {
    id: nanoid(10),
    type: "rectangle",
    ...box,
    rotation: 0,
    cornerRadius,
    style: defaultStyle(),
    createdAt: now(),
    updatedAt: now(),
  };
}

export function createEllipse(a: Point, b: Point): EllipseObject {
  const box = boxFromPoints(a, b);
  return {
    id: nanoid(10),
    type: "ellipse",
    ...box,
    rotation: 0,
    style: defaultStyle(),
    createdAt: now(),
    updatedAt: now(),
  };
}

export function createLine(a: Point, b: Point): LineObject {
  return {
    id: nanoid(10),
    type: "line",
    x: a.x,
    y: a.y,
    width: Math.max(Math.abs(a.x - b.x), 1),
    height: Math.max(Math.abs(a.y - b.y), 1),
    x2: b.x,
    y2: b.y,
    rotation: 0,
    style: defaultStyle({ fill: "transparent" }),
    createdAt: now(),
    updatedAt: now(),
  };
}

export function createArrow(a: Point, b: Point): ArrowObject {
  return {
    id: nanoid(10),
    type: "arrow",
    x: a.x,
    y: a.y,
    width: Math.max(Math.abs(a.x - b.x), 1),
    height: Math.max(Math.abs(a.y - b.y), 1),
    x2: b.x,
    y2: b.y,
    rotation: 0,
    style: defaultStyle({ fill: "transparent" }),
    createdAt: now(),
    updatedAt: now(),
  };
}

export function createPenStroke(origin: Point, strokeWidth = 3): PenObject {
  return {
    id: nanoid(10),
    type: "pen",
    x: origin.x,
    y: origin.y,
    width: 0,
    height: 0,
    points: [0, 0],
    rotation: 0,
    style: defaultStyle({ fill: "transparent", strokeWidth }),
    createdAt: now(),
    updatedAt: now(),
  };
}

export function cloneWithOffset(obj: BoardObject, dx: number, dy: number): BoardObject {
  return {
    ...obj,
    id: nanoid(10),
    x: obj.x + dx,
    y: obj.y + dy,
    ...(obj.type === "line" || obj.type === "arrow"
      ? { x2: obj.x2 + dx, y2: obj.y2 + dy }
      : {}),
    createdAt: now(),
    updatedAt: now(),
  };
}

function boxFromPoints(a: Point, b: Point) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.max(Math.abs(a.x - b.x), 1),
    height: Math.max(Math.abs(a.y - b.y), 1),
  };
}
