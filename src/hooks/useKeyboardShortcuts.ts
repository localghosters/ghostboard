import { useEffect } from "react";
import { fitToContent } from "../canvas/viewportActions";
import { useStore, type ToolType } from "../state/store";
import { clampZoom } from "../utils/math";

const TOOL_KEYS: Record<string, ToolType> = {
  v: "select",
  h: "hand",
  s: "sticky",
  r: "rectangle",
  u: "roundedRectangle",
  o: "ellipse",
  l: "line",
  a: "arrow",
  p: "pen",
  e: "eraser",
};

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA";
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const store = useStore.getState();
      const typing = isTypingTarget(e.target);
      const mod = e.ctrlKey || e.metaKey;

      if (typing) {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
          store.setEditingText(null);
        }
        return;
      }

      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        store.redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        store.duplicateSelected();
        return;
      }
      if (mod && e.key.toLowerCase() === "c") {
        store.copySelected();
        return;
      }
      if (mod && e.key.toLowerCase() === "v") {
        store.paste();
        return;
      }
      if (mod && e.key.toLowerCase() === "a") {
        e.preventDefault();
        store.selectAll();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (store.selection.length) {
          e.preventDefault();
          store.deleteSelected();
        }
        return;
      }
      if (e.key === "Escape") {
        store.clearSelection();
        store.setEditingText(null);
        store.setTool("select");
        return;
      }
      if (e.key === "+" || e.key === "=") {
        store.setViewport({ zoom: clampZoom(store.viewport.zoom * 1.2) });
        return;
      }
      if (e.key === "-" || e.key === "_") {
        store.setViewport({ zoom: clampZoom(store.viewport.zoom / 1.2) });
        return;
      }
      if (e.key === "0") {
        fitToContent();
        return;
      }
      if (e.key === "?") {
        return; // handled by TopBar's own button; reserved
      }

      const tool = TOOL_KEYS[e.key.toLowerCase()];
      if (tool) {
        store.setTool(tool);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
