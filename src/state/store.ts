import { nanoid } from "nanoid";
import { create } from "zustand";
import { cloneWithOffset } from "../model/factory";
import type { Board, BoardObject } from "../model/types";
import { applyCommand, applyUndoDelete, type Command } from "./history";

export type ToolType =
  | "select"
  | "hand"
  | "sticky"
  | "rectangle"
  | "roundedRectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "pen"
  | "eraser";

export interface Viewport {
  x: number; // board-space point currently at the top-left of the screen
  y: number;
  zoom: number;
}

export interface ToolOptions {
  strokeWidth: number;
  stickyColor: string;
}

function emptyBoard(): Board {
  return { id: nanoid(10), name: "Untitled board", objects: [] };
}

interface Transaction {
  ids: string[];
  before: Record<string, Partial<BoardObject>>;
}

interface StoreState {
  board: Board;
  selection: string[];
  tool: ToolType;
  toolOptions: ToolOptions;
  viewport: Viewport;
  clipboard: BoardObject[];
  editingTextId: string | null;
  history: { past: Command[]; future: Command[] };
  transaction: Transaction | null;

  // tool / selection
  setTool: (tool: ToolType) => void;
  setToolOptions: (patch: Partial<ToolOptions>) => void;
  select: (ids: string[]) => void;
  toggleSelect: (id: string) => void;
  addToSelection: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setEditingText: (id: string | null) => void;

  // viewport
  setViewport: (patch: Partial<Viewport>) => void;
  resetView: () => void;

  // object mutation
  addObjects: (objects: BoardObject[], opts?: { select?: boolean }) => void;
  deleteObjects: (ids: string[]) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  updateObjectsCommitted: (patch: Record<string, Partial<BoardObject>>) => void;

  // transactions (drag / resize / freehand draw)
  beginTransaction: (ids: string[]) => void;
  updateLive: (patch: Record<string, Partial<BoardObject>>) => void;
  commitTransaction: () => void;
  cancelTransaction: () => void;

  // clipboard
  copySelected: () => void;
  paste: () => void;

  // history
  undo: () => void;
  redo: () => void;

  // board lifecycle
  loadBoard: (board: Board) => void;
  newBoard: () => void;
}

const MAX_HISTORY = 200;

export const useStore = create<StoreState>((set, get) => ({
  board: emptyBoard(),
  selection: [],
  tool: "select",
  toolOptions: { strokeWidth: 3, stickyColor: "#F4D35E" },
  viewport: { x: 0, y: 0, zoom: 1 },
  clipboard: [],
  editingTextId: null,
  history: { past: [], future: [] },
  transaction: null,

  setTool: (tool) => set({ tool, editingTextId: null }),
  setToolOptions: (patch) => set((s) => ({ toolOptions: { ...s.toolOptions, ...patch } })),

  select: (ids) => set({ selection: ids }),
  toggleSelect: (id) =>
    set((s) => ({
      selection: s.selection.includes(id)
        ? s.selection.filter((x) => x !== id)
        : [...s.selection, id],
    })),
  addToSelection: (ids) =>
    set((s) => ({ selection: Array.from(new Set([...s.selection, ...ids])) })),
  clearSelection: () => set({ selection: [] }),
  selectAll: () => set((s) => ({ selection: s.board.objects.map((o) => o.id) })),
  setEditingText: (id) => set({ editingTextId: id }),

  setViewport: (patch) => set((s) => ({ viewport: { ...s.viewport, ...patch } })),
  resetView: () => set({ viewport: { x: 0, y: 0, zoom: 1 } }),

  addObjects: (objects, opts) => {
    const command: Command = { kind: "create", objects };
    pushCommand(set, get, command);
    if (opts?.select !== false) set({ selection: objects.map((o) => o.id) });
  },

  deleteObjects: (ids) => {
    const idSet = new Set(ids);
    const { objects } = get().board;
    const removed: BoardObject[] = [];
    const indices: number[] = [];
    objects.forEach((o, i) => {
      if (idSet.has(o.id)) {
        removed.push(o);
        indices.push(i);
      }
    });
    if (removed.length === 0) return;
    const command: Command = { kind: "delete", objects: removed, indices };
    pushCommand(set, get, command);
    set((s) => ({ selection: s.selection.filter((id) => !idSet.has(id)) }));
  },

  deleteSelected: () => get().deleteObjects(get().selection),

  duplicateSelected: () => {
    const { board, selection } = get();
    const originals = board.objects.filter((o) => selection.includes(o.id));
    if (originals.length === 0) return;
    const copies = originals.map((o) => cloneWithOffset(o, 24, 24));
    get().addObjects(copies);
  },

  updateObjectsCommitted: (patch) => {
    const { board } = get();
    const before: Record<string, Partial<BoardObject>> = {};
    for (const id of Object.keys(patch)) {
      const obj = board.objects.find((o) => o.id === id);
      if (!obj) continue;
      const keys = Object.keys(patch[id]) as (keyof BoardObject)[];
      const snapshot: Partial<BoardObject> = {};
      for (const k of keys) (snapshot as any)[k] = (obj as any)[k];
      before[id] = snapshot;
    }
    const after: Record<string, Partial<BoardObject>> = {};
    for (const id of Object.keys(patch)) after[id] = { ...patch[id], updatedAt: Date.now() };
    pushCommand(set, get, { kind: "update", before, after });
  },

  beginTransaction: (ids) => {
    const { board } = get();
    const before: Record<string, Partial<BoardObject>> = {};
    for (const id of ids) {
      const obj = board.objects.find((o) => o.id === id);
      if (obj) before[id] = { ...obj };
    }
    set({ transaction: { ids, before } });
  },

  updateLive: (patch) => {
    set((s) => ({
      board: {
        ...s.board,
        objects: s.board.objects.map((o) => (patch[o.id] ? ({ ...o, ...patch[o.id] } as BoardObject) : o)),
      },
    }));
  },

  commitTransaction: () => {
    const { transaction, board } = get();
    if (!transaction) return;
    const after: Record<string, Partial<BoardObject>> = {};
    let changed = false;
    for (const id of transaction.ids) {
      const obj = board.objects.find((o) => o.id === id);
      if (!obj) continue;
      const before = transaction.before[id];
      const patch: Partial<BoardObject> = {};
      for (const k of Object.keys(before) as (keyof BoardObject)[]) {
        if ((obj as any)[k] !== (before as any)[k]) {
          (patch as any)[k] = (obj as any)[k];
          changed = true;
        }
      }
      after[id] = patch;
    }
    set({ transaction: null });
    if (!changed) return;
    pushCommand(set, get, { kind: "update", before: transaction.before, after }, { alreadyApplied: true });
  },

  cancelTransaction: () => {
    const { transaction } = get();
    if (!transaction) return;
    set((s) => ({
      board: {
        ...s.board,
        objects: s.board.objects.map((o) =>
          transaction.before[o.id] ? ({ ...o, ...transaction.before[o.id] } as BoardObject) : o,
        ),
      },
      transaction: null,
    }));
  },

  copySelected: () => {
    const { board, selection } = get();
    const objs = board.objects.filter((o) => selection.includes(o.id));
    if (objs.length) set({ clipboard: objs });
  },

  paste: () => {
    const { clipboard } = get();
    if (clipboard.length === 0) return;
    const copies = clipboard.map((o) => cloneWithOffset(o, 32, 32));
    get().addObjects(copies);
    set({ clipboard: copies });
  },

  undo: () => {
    const { history, board } = get();
    const command = history.past[history.past.length - 1];
    if (!command) return;
    let nextBoard: Board;
    switch (command.kind) {
      case "create":
        nextBoard = applyCommand(board, { kind: "delete", objects: command.objects, indices: [] });
        break;
      case "delete":
        nextBoard = applyUndoDelete(board, command);
        break;
      case "update":
        nextBoard = applyCommand(board, { kind: "update", before: command.after, after: command.before });
        break;
    }
    set({
      board: nextBoard,
      history: { past: history.past.slice(0, -1), future: [command, ...history.future].slice(0, MAX_HISTORY) },
      selection: [],
    });
  },

  redo: () => {
    const { history, board } = get();
    const command = history.future[0];
    if (!command) return;
    const nextBoard = applyCommand(board, command);
    set({
      board: nextBoard,
      history: { past: [...history.past, command].slice(-MAX_HISTORY), future: history.future.slice(1) },
      selection: [],
    });
  },

  loadBoard: (board) => set({ board, selection: [], history: { past: [], future: [] }, transaction: null }),
  newBoard: () => set({ board: emptyBoard(), selection: [], history: { past: [], future: [] }, transaction: null }),
}));

function pushCommand(
  set: (partial: Partial<StoreState> | ((s: StoreState) => Partial<StoreState>)) => void,
  get: () => StoreState,
  command: Command,
  opts?: { alreadyApplied?: boolean },
) {
  const { board, history } = get();
  const nextBoard = opts?.alreadyApplied ? board : applyCommand(board, command);
  set({
    board: nextBoard,
    history: { past: [...history.past, command].slice(-MAX_HISTORY), future: [] },
  });
}
