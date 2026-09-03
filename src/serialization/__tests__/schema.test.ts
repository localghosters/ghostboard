import { describe, expect, it } from "vitest";
import { createRectangle } from "../../model/factory";
import type { Board } from "../../model/types";
import { CURRENT_VERSION, deserializeBoard, InvalidBoardFileError, serializeBoard } from "../schema";

function sampleBoard(): Board {
  return {
    id: "board1",
    name: "Test board",
    objects: [createRectangle({ x: 0, y: 0 }, { x: 10, y: 10 })],
  };
}

describe("serialization", () => {
  it("round-trips a board through serialize/deserialize", () => {
    const board = sampleBoard();
    const json = serializeBoard(board);
    const restored = deserializeBoard(json);
    expect(restored).toEqual(board);
  });

  it("stamps the current schema version on export", () => {
    const json = serializeBoard(sampleBoard());
    const parsed = JSON.parse(json);
    expect(parsed.ghostboard).toBe(CURRENT_VERSION);
    expect(typeof parsed.exportedAt).toBe("string");
  });

  it("rejects invalid JSON", () => {
    expect(() => deserializeBoard("{not json")).toThrow(InvalidBoardFileError);
  });

  it("rejects a JSON file that isn't a GhostBoard export", () => {
    expect(() => deserializeBoard(JSON.stringify({ hello: "world" }))).toThrow(InvalidBoardFileError);
  });

  it("rejects a document from a newer, unknown schema version", () => {
    const future = JSON.stringify({ ghostboard: CURRENT_VERSION + 1, board: sampleBoard() });
    expect(() => deserializeBoard(future)).toThrow(InvalidBoardFileError);
  });

  it("fills in a missing board name on import", () => {
    const doc = JSON.stringify({ ghostboard: CURRENT_VERSION, board: { id: "b", objects: [] } });
    const restored = deserializeBoard(doc);
    expect(restored.name).toBe("Untitled board");
  });
});
