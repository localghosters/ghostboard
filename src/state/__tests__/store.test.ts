import { beforeEach, describe, expect, it } from "vitest";
import { createRectangle, createStickyNote } from "../../model/factory";
import { useStore } from "../store";

beforeEach(() => {
  useStore.getState().newBoard();
});

describe("store: create/delete/select", () => {
  it("adds objects and selects them by default", () => {
    const rect = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    useStore.getState().addObjects([rect]);
    expect(useStore.getState().board.objects).toHaveLength(1);
    expect(useStore.getState().selection).toEqual([rect.id]);
  });

  it("deletes selected objects and clears them from selection", () => {
    const rect = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    useStore.getState().addObjects([rect]);
    useStore.getState().deleteSelected();
    expect(useStore.getState().board.objects).toHaveLength(0);
    expect(useStore.getState().selection).toEqual([]);
  });

  it("duplicates the current selection with an offset", () => {
    const note = createStickyNote({ x: 0, y: 0 });
    useStore.getState().addObjects([note]);
    useStore.getState().duplicateSelected();
    const objects = useStore.getState().board.objects;
    expect(objects).toHaveLength(2);
    expect(objects[1].id).not.toBe(objects[0].id);
    expect(objects[1].x).toBe(objects[0].x + 24);
  });
});

describe("store: undo/redo", () => {
  it("undoes and redoes an object creation", () => {
    const rect = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    useStore.getState().addObjects([rect]);
    expect(useStore.getState().board.objects).toHaveLength(1);

    useStore.getState().undo();
    expect(useStore.getState().board.objects).toHaveLength(0);

    useStore.getState().redo();
    expect(useStore.getState().board.objects).toHaveLength(1);
    expect(useStore.getState().board.objects[0].id).toBe(rect.id);
  });

  it("undoes a deletion by restoring the object at its original index", () => {
    const a = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    const b = createRectangle({ x: 20, y: 20 }, { x: 30, y: 30 });
    useStore.getState().addObjects([a], { select: false });
    useStore.getState().addObjects([b], { select: false });
    useStore.getState().deleteObjects([a.id]);
    expect(useStore.getState().board.objects.map((o) => o.id)).toEqual([b.id]);

    useStore.getState().undo();
    expect(useStore.getState().board.objects.map((o) => o.id)).toEqual([a.id, b.id]);
  });

  it("undoes a committed style update", () => {
    const rect = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    useStore.getState().addObjects([rect]);
    useStore.getState().updateObjectsCommitted({ [rect.id]: { style: { ...rect.style, fill: "#ff0000" } } });
    expect((useStore.getState().board.objects[0] as any).style.fill).toBe("#ff0000");

    useStore.getState().undo();
    expect((useStore.getState().board.objects[0] as any).style.fill).toBe(rect.style.fill);
  });

  it("clears redo history when a new action follows an undo", () => {
    const a = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    const b = createRectangle({ x: 20, y: 20 }, { x: 30, y: 30 });
    useStore.getState().addObjects([a]);
    useStore.getState().undo();
    useStore.getState().addObjects([b]);
    expect(useStore.getState().history.future).toHaveLength(0);
  });
});

describe("store: drag transactions", () => {
  it("commits a move as a single undoable step", () => {
    const rect = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    useStore.getState().addObjects([rect]);

    useStore.getState().beginTransaction([rect.id]);
    useStore.getState().updateLive({ [rect.id]: { x: 5 } });
    useStore.getState().updateLive({ [rect.id]: { x: 50 } });
    useStore.getState().commitTransaction();

    expect(useStore.getState().board.objects[0].x).toBe(50);
    expect(useStore.getState().history.past).toHaveLength(2); // create + one move
    useStore.getState().undo();
    expect(useStore.getState().board.objects[0].x).toBe(0);
  });

  it("does not push a history entry when a transaction results in no change", () => {
    const rect = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    useStore.getState().addObjects([rect]);
    const pastLength = useStore.getState().history.past.length;

    useStore.getState().beginTransaction([rect.id]);
    useStore.getState().commitTransaction();

    expect(useStore.getState().history.past).toHaveLength(pastLength);
  });

  it("cancels a transaction and reverts live changes", () => {
    const rect = createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 });
    useStore.getState().addObjects([rect]);

    useStore.getState().beginTransaction([rect.id]);
    useStore.getState().updateLive({ [rect.id]: { x: 999 } });
    useStore.getState().cancelTransaction();

    expect(useStore.getState().board.objects[0].x).toBe(0);
  });
});
