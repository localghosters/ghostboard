# GhostBoard JSON format

GhostBoard boards are plain JSON. This document describes the format
produced by **Export** and accepted by **Import**, and how it will evolve
over time.

The implementation lives in [`src/serialization/schema.ts`](../src/serialization/schema.ts)
and the object shapes in [`src/model/types.ts`](../src/model/types.ts).

## Top-level document

```jsonc
{
  "ghostboard": 1,          // schema version (integer)
  "board": {
    "id": "abc123",
    "name": "Untitled board",
    "objects": [ /* ... */ ]
  },
  "exportedAt": "2026-01-01T12:00:00.000Z"
}
```

- `ghostboard` is the schema version the file was written with. It is *not*
  the app version — it only changes when the object model itself changes.
- `exportedAt` is informational and ignored on import.

## Objects

Every object shares a base set of fields:

| Field       | Type     | Notes                                          |
| ----------- | -------- | ----------------------------------------------- |
| `id`        | string   | Unique within the board.                        |
| `type`      | string   | `"sticky"` \| `"rectangle"` \| `"ellipse"` \| `"line"` \| `"arrow"` \| `"pen"` |
| `x`, `y`    | number   | Top-left corner (or first point, for lines/arrows), in board units. |
| `width`, `height` | number | Bounding box. For `line`/`arrow`, kept roughly in sync but `x2`/`y2` are authoritative. |
| `rotation`  | number   | Degrees. Reserved — no tool sets this yet.      |
| `style`     | object   | `{ fill, stroke, strokeWidth, opacity }`        |
| `createdAt`, `updatedAt` | number (ms epoch) | Bookkeeping only. |

Type-specific fields:

- **sticky**: `text: string`
- **rectangle**: `cornerRadius: number`
- **ellipse**: *(no extra fields)*
- **line**: `x2: number, y2: number`
- **arrow**: `x2: number, y2: number`, plus optional `startObjectId` /
  `endObjectId` reserved for future smart connections
- **pen**: `points: number[]` — a flat `[x0, y0, x1, y1, ...]` array of
  points **relative to `(x, y)`**

## Board units

Board coordinates are independent of screen pixels or zoom level — they're
just numbers on an infinite plane. At 100% zoom, 1 board unit == 1 CSS
pixel, but that relationship only matters for rendering, not for the data.

## Versioning & migrations

- The current version is `1`.
- Bumping the version is required any time an object's fields change
  meaning (not just when a new object *type* is added — new types are
  additive and don't need a version bump, since a document doesn't
  reference types it doesn't contain).
- Migrations live in `migrate()` in `src/serialization/schema.ts`. Each
  past version should get a `case` that upgrades it to the next version,
  falling through until the document reaches `CURRENT_VERSION`.
- Importing a file from a *newer* version than the app understands throws
  a friendly error rather than silently corrupting the board.

If you add a new object type, you generally don't need to touch this file
— see the "Adding a new object type" checklist at the top of
`src/model/types.ts`.
