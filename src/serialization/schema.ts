import { nanoid } from "nanoid";
import type { Board, GhostBoardDocument } from "../model/types";

/**
 * GhostBoard's on-disk JSON format is documented in full at
 * docs/JSON_FORMAT.md. Bump CURRENT_VERSION and add a migration in
 * `migrate()` whenever the shape of the document changes -- never mutate
 * old boards' meaning silently.
 */
export const CURRENT_VERSION = 1;

export function serializeBoard(board: Board): string {
  const doc: GhostBoardDocument = {
    ghostboard: CURRENT_VERSION,
    board,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(doc, null, 2);
}

export class InvalidBoardFileError extends Error {}

/** Parses and migrates a raw JSON string into a Board. Throws
 * InvalidBoardFileError with a human-readable message on bad input. */
export function deserializeBoard(json: string): Board {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new InvalidBoardFileError("That file isn't valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || !("ghostboard" in parsed)) {
    throw new InvalidBoardFileError("That file doesn't look like a GhostBoard export.");
  }

  const doc = migrate(parsed as Partial<GhostBoardDocument> & { ghostboard: number });

  if (!doc.board || !Array.isArray(doc.board.objects)) {
    throw new InvalidBoardFileError("That file is missing its board data.");
  }

  return {
    id: doc.board.id ?? nanoid(10),
    name: doc.board.name ?? "Untitled board",
    objects: doc.board.objects,
  };
}

/** Upgrades older document versions to the current shape. Add a `case` for
 * each past version as the format evolves -- each case should fall through
 * to the next until it reaches CURRENT_VERSION. */
function migrate(doc: Partial<GhostBoardDocument> & { ghostboard: number }): GhostBoardDocument {
  if (doc.ghostboard > CURRENT_VERSION) {
    throw new InvalidBoardFileError(
      `This file was saved by a newer version of GhostBoard (v${doc.ghostboard}). Please update the app.`,
    );
  }

  // No migrations needed yet -- v1 is the only version that has existed.
  return doc as GhostBoardDocument;
}

export function downloadBoardAsJson(board: Board) {
  const json = serializeBoard(board);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(board.name)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "ghostboard";
}
