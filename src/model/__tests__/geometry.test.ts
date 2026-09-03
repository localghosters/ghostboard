import { describe, expect, it } from "vitest";
import { createRectangle } from "../factory";
import { getBounds, hitTestObject, rectsIntersect, unionBounds } from "../geometry";

describe("geometry", () => {
  it("computes bounds for a box object", () => {
    const rect = createRectangle({ x: 10, y: 10 }, { x: 50, y: 40 });
    expect(getBounds(rect)).toEqual({ x: 10, y: 10, width: 40, height: 30 });
  });

  it("computes bounds for a line regardless of point order", () => {
    const line = { ...createRectangle({ x: 0, y: 0 }, { x: 1, y: 1 }), type: "line" as const, x: 40, y: 40, x2: 10, y2: 5 };
    const bounds = getBounds(line as any);
    expect(bounds).toEqual({ x: 10, y: 5, width: 30, height: 35 });
  });

  it("detects intersecting rectangles", () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 5, y: 5, width: 10, height: 10 };
    const c = { x: 100, y: 100, width: 10, height: 10 };
    expect(rectsIntersect(a, b)).toBe(true);
    expect(rectsIntersect(a, c)).toBe(false);
  });

  it("hit-tests a box object by point containment", () => {
    const rect = createRectangle({ x: 0, y: 0 }, { x: 20, y: 20 });
    expect(hitTestObject(rect, { x: 10, y: 10 })).toBe(true);
    expect(hitTestObject(rect, { x: 40, y: 40 })).toBe(false);
  });

  it("hit-tests a thin line within tolerance", () => {
    const line = { type: "line" as const, x: 0, y: 0, x2: 100, y2: 0, width: 100, height: 1, id: "l1", rotation: 0, style: { fill: "", stroke: "", strokeWidth: 1, opacity: 1 }, createdAt: 0, updatedAt: 0 };
    expect(hitTestObject(line, { x: 50, y: 3 })).toBe(true);
    expect(hitTestObject(line, { x: 50, y: 30 })).toBe(false);
  });

  it("unions multiple bounds", () => {
    const union = unionBounds([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 20, y: 30, width: 5, height: 5 },
    ]);
    expect(union).toEqual({ x: 0, y: 0, width: 25, height: 35 });
  });

  it("returns null bounds union for an empty list", () => {
    expect(unionBounds([])).toBeNull();
  });
});
