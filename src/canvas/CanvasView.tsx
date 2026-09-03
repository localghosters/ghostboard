import { useCallback, useEffect, useRef, useState } from "react";
import {
  createArrow,
  createEllipse,
  createLine,
  createPenStroke,
  createRectangle,
  createStickyNote,
} from "../model/factory";
import { getBounds, hitTestObject, rectsIntersect, type Rect } from "../model/geometry";
import type { BoardObject } from "../model/types";
import { useStore } from "../state/store";
import { clampZoom, screenToBoard, type Point } from "../utils/math";
import { Grid } from "./Grid";
import { ObjectRenderer } from "./registry";
import { SelectionOverlay, type HandleId } from "./SelectionOverlay";

type Interaction =
  | { kind: "pan"; startScreen: Point; startViewport: { x: number; y: number } }
  | { kind: "marquee"; startBoard: Point; additive: boolean }
  | { kind: "move"; startBoard: Point }
  | { kind: "resize"; id: string; handle: HandleId; startObj: BoardObject }
  | { kind: "endpoint"; id: string; handle: "start" | "end" }
  | { kind: "draw"; tool: string }
  | { kind: "pen-draw" }
  | { kind: "erase" };

const MIN_DRAG_SIZE = 4;

export function CanvasView() {
  const board = useStore((s) => s.board);
  const selection = useStore((s) => s.selection);
  const tool = useStore((s) => s.tool);
  const toolOptions = useStore((s) => s.toolOptions);
  const viewport = useStore((s) => s.viewport);
  const editingTextId = useStore((s) => s.editingTextId);

  const svgRef = useRef<SVGSVGElement>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const eraseHitsRef = useRef<Set<string>>(new Set());

  const [marquee, setMarquee] = useState<Rect | null>(null);
  const [draft, setDraft] = useState<BoardObject | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);

  // Space bar temporarily activates panning regardless of the active tool.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTypingTarget(e.target)) setSpaceHeld(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const toScreenPoint = useCallback((e: { clientX: number; clientY: number }): Point => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const toBoardPoint = useCallback(
    (e: { clientX: number; clientY: number }) => screenToBoard(toScreenPoint(e), viewport),
    [toScreenPoint, viewport],
  );

  const isPanMode = tool === "hand" || spaceHeld;

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const boardPoint = toBoardPoint(e);
    const store = useStore.getState();

    if (e.button === 1 || isPanMode) {
      interactionRef.current = {
        kind: "pan",
        startScreen: toScreenPoint(e),
        startViewport: { x: viewport.x, y: viewport.y },
      };
      return;
    }

    const targetEl = e.target as Element;
    const handle = targetEl.closest("[data-handle]")?.getAttribute("data-handle") as HandleId | undefined;
    const objectId = targetEl.closest("[data-object-id]")?.getAttribute("data-object-id") ?? undefined;

    if (tool === "select") {
      if (handle && selection.length === 1) {
        const obj = board.objects.find((o) => o.id === selection[0])!;
        store.beginTransaction([obj.id]);
        interactionRef.current =
          obj.type === "line" || obj.type === "arrow"
            ? { kind: "endpoint", id: obj.id, handle: handle as "start" | "end" }
            : { kind: "resize", id: obj.id, handle, startObj: obj };
        return;
      }

      if (objectId) {
        if (e.shiftKey) {
          store.toggleSelect(objectId);
        } else if (!selection.includes(objectId)) {
          store.select([objectId]);
        }
        const freshSelection = useStore.getState().selection;
        const idsToMove = freshSelection.includes(objectId) ? freshSelection : [objectId];
        store.beginTransaction(idsToMove);
        interactionRef.current = { kind: "move", startBoard: boardPoint };
        return;
      }

      if (!e.shiftKey) store.clearSelection();
      interactionRef.current = { kind: "marquee", startBoard: boardPoint, additive: e.shiftKey };
      setMarquee({ x: boardPoint.x, y: boardPoint.y, width: 0, height: 0 });
      return;
    }

    if (tool === "eraser") {
      interactionRef.current = { kind: "erase" };
      eraseHitsRef.current = new Set();
      eraseAt(boardPoint);
      return;
    }

    if (tool === "sticky") {
      const obj = createStickyNote(boardPoint, toolOptions.stickyColor);
      store.addObjects([obj]);
      store.setEditingText(obj.id);
      store.setTool("select");
      return;
    }

    if (tool === "pen") {
      const obj = createPenStroke(boardPoint, toolOptions.strokeWidth);
      setDraft(obj);
      interactionRef.current = { kind: "pen-draw" };
      return;
    }

    if (["rectangle", "roundedRectangle", "ellipse", "line", "arrow"].includes(tool)) {
      const obj = makeShapeDraft(tool, boardPoint, boardPoint, toolOptions.strokeWidth);
      setDraft(obj);
      interactionRef.current = { kind: "draw", tool };
      return;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const interaction = interactionRef.current;
    if (!interaction) return;
    const store = useStore.getState();

    if (interaction.kind === "pan") {
      const screen = toScreenPoint(e);
      const dx = (screen.x - interaction.startScreen.x) / viewport.zoom;
      const dy = (screen.y - interaction.startScreen.y) / viewport.zoom;
      store.setViewport({ x: interaction.startViewport.x - dx, y: interaction.startViewport.y - dy });
      return;
    }

    const boardPoint = toBoardPoint(e);

    if (interaction.kind === "marquee") {
      setMarquee(normalizeRect(interaction.startBoard, boardPoint));
      return;
    }

    if (interaction.kind === "move") {
      const dx = boardPoint.x - interaction.startBoard.x;
      const dy = boardPoint.y - interaction.startBoard.y;
      const patch: Record<string, Partial<BoardObject>> = {};
      for (const id of selection) {
        const obj = board.objects.find((o) => o.id === id);
        if (!obj) continue;
        const base: any = { x: obj.x + dx, y: obj.y + dy };
        if (obj.type === "line" || obj.type === "arrow") {
          base.x2 = obj.x2 + dx;
          base.y2 = obj.y2 + dy;
        }
        patch[id] = base;
      }
      store.updateLive(patch);
      interactionRef.current = { kind: "move", startBoard: boardPoint };
      return;
    }

    if (interaction.kind === "resize") {
      const obj = board.objects.find((o) => o.id === interaction.id);
      if (!obj) return;
      const bounds = getBounds(interaction.startObj);
      const next = resizeBounds(bounds, interaction.handle, boardPoint);
      store.updateLive({ [obj.id]: { x: next.x, y: next.y, width: next.width, height: next.height } });
      return;
    }

    if (interaction.kind === "endpoint") {
      store.updateLive({
        [interaction.id]: interaction.handle === "start" ? { x: boardPoint.x, y: boardPoint.y } : { x2: boardPoint.x, y2: boardPoint.y },
      });
      return;
    }

    if (interaction.kind === "draw" && draft) {
      const origin = { x: draft.x, y: draft.y };
      setDraft(makeShapeDraft(interaction.tool, origin, boardPoint, toolOptions.strokeWidth, draft.id));
      return;
    }

    if (interaction.kind === "pen-draw" && draft && draft.type === "pen") {
      const relX = boardPoint.x - draft.x;
      const relY = boardPoint.y - draft.y;
      const points = [...draft.points, relX, relY];
      setDraft({ ...draft, points });
      return;
    }

    if (interaction.kind === "erase") {
      eraseAt(boardPoint);
      return;
    }
  };

  const handlePointerUp = () => {
    const interaction = interactionRef.current;
    const store = useStore.getState();

    if (interaction?.kind === "marquee") {
      const rect = marquee;
      if (rect) {
        const hits = board.objects.filter((o) => rectsIntersect(getBounds(o), rect)).map((o) => o.id);
        if (interaction.additive) store.addToSelection(hits);
        else store.select(hits);
      }
      setMarquee(null);
    }

    if (interaction?.kind === "move" || interaction?.kind === "resize" || interaction?.kind === "endpoint") {
      store.commitTransaction();
    }

    if (interaction?.kind === "draw" && draft) {
      const bounds = getBounds(draft);
      const big = draft.type === "line" || draft.type === "arrow" ? true : bounds.width > MIN_DRAG_SIZE || bounds.height > MIN_DRAG_SIZE;
      if (big) {
        store.addObjects([draft]);
        store.setTool("select");
      }
      setDraft(null);
    }

    if (interaction?.kind === "pen-draw" && draft && draft.type === "pen") {
      if (draft.points.length > 2) {
        store.addObjects([draft]);
      }
      setDraft(null);
    }

    interactionRef.current = null;
  };

  const eraseAt = (boardPoint: Point) => {
    const store = useStore.getState();
    const hit = [...board.objects].reverse().find((o) => hitTestObject(o, boardPoint, 10 / viewport.zoom));
    if (hit && !eraseHitsRef.current.has(hit.id)) {
      eraseHitsRef.current.add(hit.id);
      store.deleteObjects([hit.id]);
    }
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const store = useStore.getState();
    if (e.ctrlKey || e.metaKey) {
      const screen = toScreenPoint(e);
      const before = screenToBoard(screen, viewport);
      const zoom = clampZoom(viewport.zoom * Math.exp(-e.deltaY * 0.01));
      const after = screenToBoard(screen, { ...viewport, zoom });
      store.setViewport({ zoom, x: viewport.x + (before.x - after.x), y: viewport.y + (before.y - after.y) });
    } else {
      store.setViewport({ x: viewport.x + e.deltaX / viewport.zoom, y: viewport.y + e.deltaY / viewport.zoom });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const objectId = (e.target as Element).closest("[data-object-id]")?.getAttribute("data-object-id");
    if (!objectId) return;
    const obj = board.objects.find((o) => o.id === objectId);
    if (obj?.type === "sticky") {
      useStore.getState().select([objectId]);
      useStore.getState().setEditingText(objectId);
    }
  };

  const selectedObjects = board.objects.filter((o) => selection.includes(o.id));

  const cursor = isPanMode
    ? "grab"
    : tool === "select"
      ? "default"
      : tool === "eraser"
        ? "cell"
        : "crosshair";

  return (
    <svg
      ref={svgRef}
      className="gb-canvas"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      <Grid viewport={viewport} />
      <g transform={`scale(${viewport.zoom}) translate(${-viewport.x}, ${-viewport.y})`}>
        {board.objects.map((obj) => (
          <ObjectRenderer key={obj.id} object={obj} />
        ))}
        {draft && <ObjectRenderer object={draft} />}
        {selectedObjects.length > 0 && !editingTextId && (
          <SelectionOverlay objects={selectedObjects} zoom={viewport.zoom} />
        )}
        {marquee && (
          <rect
            x={marquee.x}
            y={marquee.y}
            width={marquee.width}
            height={marquee.height}
            className="gb-marquee"
          />
        )}
      </g>
    </svg>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA";
}

function normalizeRect(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

function resizeBounds(bounds: Rect, handle: HandleId, pointer: Point): Rect {
  let { x, y, width, height } = bounds;
  const right = bounds.x + bounds.width;
  const bottom = bounds.y + bounds.height;

  if (handle.includes("w")) {
    x = Math.min(pointer.x, right - MIN_DRAG_SIZE);
    width = right - x;
  }
  if (handle.includes("e")) {
    width = Math.max(pointer.x - bounds.x, MIN_DRAG_SIZE);
  }
  if (handle.includes("n")) {
    y = Math.min(pointer.y, bottom - MIN_DRAG_SIZE);
    height = bottom - y;
  }
  if (handle.includes("s")) {
    height = Math.max(pointer.y - bounds.y, MIN_DRAG_SIZE);
  }
  return { x, y, width, height };
}

function makeShapeDraft(
  tool: string,
  a: Point,
  b: Point,
  strokeWidth: number,
  existingId?: string,
): BoardObject {
  switch (tool) {
    case "rectangle":
      return withStrokeWidth(createRectangle(a, b, 0), strokeWidth, existingId);
    case "roundedRectangle":
      return withStrokeWidth(createRectangle(a, b, 12), strokeWidth, existingId);
    case "ellipse":
      return withStrokeWidth(createEllipse(a, b), strokeWidth, existingId);
    case "line":
      return withStrokeWidth(createLine(a, b), strokeWidth, existingId);
    case "arrow":
      return withStrokeWidth(createArrow(a, b), strokeWidth, existingId);
    default:
      throw new Error(`Unknown draw tool: ${tool}`);
  }
}

function withStrokeWidth<T extends BoardObject>(obj: T, strokeWidth: number, existingId?: string): T {
  const id = existingId ?? obj.id;
  return { ...obj, id, style: { ...obj.style, strokeWidth } };
}


