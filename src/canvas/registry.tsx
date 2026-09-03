import type { ComponentType } from "react";
import type { BoardObject, ObjectType } from "../model/types";
import { ArrowShape } from "./objects/ArrowShape";
import { PenStroke } from "./objects/PenStroke";
import { ShapeEllipse } from "./objects/ShapeEllipse";
import { ShapeLine } from "./objects/ShapeLine";
import { ShapeRect } from "./objects/ShapeRect";
import { StickyNote } from "./objects/StickyNote";

/**
 * Single lookup table from object type -> render component. This is the
 * main thing a new object type needs to plug into (see model/types.ts for
 * the full checklist). Nothing else in the canvas needs a switch statement
 * over object type.
 */
export const OBJECT_RENDERERS: Record<ObjectType, ComponentType<{ object: any }>> = {
  sticky: StickyNote,
  rectangle: ShapeRect,
  ellipse: ShapeEllipse,
  line: ShapeLine,
  arrow: ArrowShape,
  pen: PenStroke,
};

export function ObjectRenderer({ object }: { object: BoardObject }) {
  const Component = OBJECT_RENDERERS[object.type];
  if (!Component) return null;
  return <Component object={object} />;
}
