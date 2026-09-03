/**
 * Core data model for a GhostBoard document.
 *
 * A board is just a flat array of objects plus a bit of metadata. Every
 * object shares a common "envelope" (BaseObject) so generic code (selection,
 * move, resize, serialization) never needs to know about specific types.
 * Type-specific fields live in each object's own interface.
 *
 * ADDING A NEW OBJECT TYPE (e.g. an ImageObject)
 * ------------------------------------------------
 * 1. Add the type name to `ObjectType` below.
 * 2. Add an interface extending BaseObject with your extra fields.
 * 3. Add it to the `BoardObject` union.
 * 4. Add a default-props factory in `model/factory.ts`.
 * 5. Add a bounds/hit-test case in `model/geometry.ts`.
 * 6. Add a render component and register it in `canvas/registry.tsx`.
 * That's it -- nothing else in the app needs to change.
 */

export type ObjectType =
  | "sticky"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "pen";

export interface ObjectStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

/** Fields every board object has, regardless of type. */
export interface BaseObject {
  id: string;
  type: ObjectType;
  /** Top-left corner in board space for box-shaped objects. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrees. Reserved for future rotation support in the UI. */
  rotation: number;
  style: ObjectStyle;
  createdAt: number;
  updatedAt: number;
}

export interface StickyNoteObject extends BaseObject {
  type: "sticky";
  text: string;
}

export interface RectangleObject extends BaseObject {
  type: "rectangle";
  /** Corner radius in board units. 0 = sharp rectangle. */
  cornerRadius: number;
}

export interface EllipseObject extends BaseObject {
  type: "ellipse";
}

/** Lines and arrows store their two endpoints explicitly rather than
 * relying purely on the x/y/width/height box, since that's the natural
 * representation for a line and makes endpoint-dragging simple. The
 * bounding box fields are kept in sync for selection/serialization
 * consistency. */
export interface LineObject extends BaseObject {
  type: "line";
  x2: number;
  y2: number;
}

export interface ArrowObject extends BaseObject {
  type: "arrow";
  x2: number;
  y2: number;
  /** Reserved for future "smart" object-to-object connections. */
  startObjectId?: string;
  endObjectId?: string;
}

export interface PenObject extends BaseObject {
  type: "pen";
  /** Points relative to (x, y), flattened as [x0, y0, x1, y1, ...]. */
  points: number[];
}

export type BoardObject =
  | StickyNoteObject
  | RectangleObject
  | EllipseObject
  | LineObject
  | ArrowObject
  | PenObject;

export interface Board {
  id: string;
  name: string;
  objects: BoardObject[];
}

/** The persisted, versioned JSON document. See docs/JSON_FORMAT.md. */
export interface GhostBoardDocument {
  ghostboard: number; // schema version
  board: Board;
  exportedAt: string;
}
