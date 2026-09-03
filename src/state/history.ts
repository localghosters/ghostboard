import type { Board, BoardObject } from "../model/types";

/**
 * Undo/redo uses the command pattern rather than full-board snapshots: each
 * command records only what changed, so history stays cheap even on large
 * boards. Every command knows how to apply itself forward and how to
 * produce its own inverse.
 */
export type Command =
  | { kind: "create"; objects: BoardObject[] }
  | { kind: "delete"; objects: BoardObject[] /* removed, in original order-index order */; indices: number[] }
  | { kind: "update"; before: Record<string, Partial<BoardObject>>; after: Record<string, Partial<BoardObject>> };

export function applyCommand(board: Board, command: Command): Board {
  switch (command.kind) {
    case "create":
      return { ...board, objects: [...board.objects, ...command.objects] };
    case "delete": {
      const removedIds = new Set(command.objects.map((o) => o.id));
      return { ...board, objects: board.objects.filter((o) => !removedIds.has(o.id)) };
    }
    case "update":
      return {
        ...board,
        objects: board.objects.map((o) =>
          command.after[o.id] ? ({ ...o, ...command.after[o.id] } as BoardObject) : o,
        ),
      };
  }
}

export function invertCommand(command: Command): Command {
  switch (command.kind) {
    case "create":
      return {
        kind: "delete",
        objects: command.objects,
        indices: command.objects.map(() => -1),
      };
    case "delete":
      return { kind: "create", objects: command.objects };
    case "update":
      return { kind: "update", before: command.after, after: command.before };
  }
}

/** Re-inserts deleted objects at their original positions where possible,
 * so undo doesn't reshuffle z-order. */
export function applyUndoDelete(board: Board, command: Extract<Command, { kind: "delete" }>): Board {
  const objects = [...board.objects];
  command.objects.forEach((obj, i) => {
    const index = command.indices[i];
    if (index >= 0 && index <= objects.length) {
      objects.splice(index, 0, obj);
    } else {
      objects.push(obj);
    }
  });
  return { ...board, objects };
}
