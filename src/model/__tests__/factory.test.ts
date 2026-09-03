import { describe, expect, it } from "vitest";
import { cloneWithOffset, createArrow, createEllipse, createLine, createPenStroke, createRectangle, createStickyNote } from "../factory";

describe("factory", () => {
  it("creates a sticky note centered on the given point", () => {
    const note = createStickyNote({ x: 100, y: 100 }, "#ffffff");
    expect(note.type).toBe("sticky");
    expect(note.x + note.width / 2).toBeCloseTo(100);
    expect(note.y + note.height / 2).toBeCloseTo(100);
    expect(note.style.fill).toBe("#ffffff");
    expect(note.text).toBe("");
  });

  it("creates a rectangle from two arbitrary corners", () => {
    const rect = createRectangle({ x: 50, y: 50 }, { x: 10, y: 20 }, 4);
    expect(rect.x).toBe(10);
    expect(rect.y).toBe(20);
    expect(rect.width).toBe(40);
    expect(rect.height).toBe(30);
    expect(rect.cornerRadius).toBe(4);
  });

  it("creates an ellipse bounding box", () => {
    const ellipse = createEllipse({ x: 0, y: 0 }, { x: 20, y: 10 });
    expect(ellipse.width).toBe(20);
    expect(ellipse.height).toBe(10);
  });

  it("keeps a line's real start point (not the box minimum)", () => {
    const line = createLine({ x: 40, y: 40 }, { x: 0, y: 0 });
    expect(line.x).toBe(40);
    expect(line.y).toBe(40);
    expect(line.x2).toBe(0);
    expect(line.y2).toBe(0);
  });

  it("keeps an arrow's direction from start to end", () => {
    const arrow = createArrow({ x: 0, y: 0 }, { x: 100, y: 0 });
    expect(arrow.x).toBe(0);
    expect(arrow.x2).toBe(100);
  });

  it("creates a pen stroke with a single origin point", () => {
    const pen = createPenStroke({ x: 5, y: 5 });
    expect(pen.points).toEqual([0, 0]);
    expect(pen.x).toBe(5);
    expect(pen.y).toBe(5);
  });

  it("clones an object with a positional offset and a new id", () => {
    const rect = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    const clone = cloneWithOffset(rect, 5, 5);
    expect(clone.id).not.toBe(rect.id);
    expect(clone.x).toBe(5);
    expect(clone.y).toBe(5);
  });

  it("offsets both endpoints when cloning a line", () => {
    const line = createLine({ x: 0, y: 0 }, { x: 10, y: 10 });
    const clone = cloneWithOffset(line, 5, 5) as typeof line;
    expect(clone.x2).toBe(15);
    expect(clone.y2).toBe(15);
  });
});
