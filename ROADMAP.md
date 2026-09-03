# Roadmap

GhostBoard is deliberately small right now. This doc tracks where it's
headed and, more importantly, where **you** could take it. Nothing here is
a promise or a deadline — it's a map of open space.

If you want to work on something, check the [issue tracker](../../issues)
first (someone may already be on it), then open an issue or PR. See
[CONTRIBUTING.md](../CONTRIBUTING.md).

## V1 — done (this release)

- [x] Infinite pan/zoom canvas with a grid background and fit-to-content
- [x] Selection: click, shift-click, marquee, drag, resize, duplicate, delete
- [x] Sticky notes with editable text and color
- [x] Shapes: rectangle, rounded rectangle, ellipse, line
- [x] Arrows (simple point-to-point)
- [x] Freehand pen tool with adjustable stroke width and an eraser
- [x] JSON export/import with a documented, versioned format
- [x] Undo/redo via a command history
- [x] Keyboard shortcuts for common operations

## V2 — near-term ideas

- [ ] Persist the current board locally (so a refresh doesn't lose work)
- [ ] Smarter selection: edge/side resize handles, rotate handle, snapping/alignment guides
- [ ] Image objects (upload or paste an image onto the board)
- [ ] Text objects that aren't tied to a sticky note
- [ ] Board templates (starter layouts you can drop onto a blank board)
- [ ] A proper keyboard-shortcut overlay/cheat sheet, not just a modal list
- [ ] Dark/light theme toggle (GhostBoard ships dark-only today)
- [ ] Better eraser (drag-to-erase along a stroke, not whole-object-only)
- [ ] SVG/PNG export of the board or current selection
- [ ] Performance pass for boards with thousands of objects (viewport culling, canvas2d fallback)

## Collaboration — further out

- [ ] Real-time multiplayer (see the architecture notes below)
- [ ] Multiplayer cursors and presence
- [ ] Comments/annotations on objects
- [ ] Authentication and board sharing
- [ ] Public/read-only boards
- [ ] Collaboration permissions (view/comment/edit)
- [ ] Cloud persistence and offline mode with sync

## Ecosystem — long-term

- [ ] Plugin system for custom tools/object types
- [ ] Public API
- [ ] Shareable board templates
- [ ] Mobile/touch-first controls

## A few concrete "good first issue" ideas

These are intentionally scoped small. Pick one, open an issue to claim it
(or check if one exists), and go:

- Add an `ImageObject` type (see the checklist in `src/model/types.ts`)
- Add a plain `TextObject` (a sticky note without the background/color)
- Add a dark/light theme toggle
- Add an on-canvas shortcut cheat sheet (not just the `?` modal)
- Improve mobile/touch support for panning and selection
- Improve arrow connections (snap to nearby object edges on creation)
- Add board templates (a small picker on "New board")
- Accessibility pass: focus states, ARIA labels on toolbar buttons, keyboard-only object creation
- Optimize rendering for boards with thousands of objects
- Add SVG export
- Add PNG export (rasterize the SVG canvas)
- Add a "duplicate board" / multi-board switcher in local storage

## Notes on architecture for collaboration features

GhostBoard's state lives in one place (`src/state/store.ts`) and object
mutations already flow through a small set of well-defined operations
(`addObjects`, `deleteObjects`, `updateObjectsCommitted`, and the
transaction API for drags). That's intentional: it's the seam where a
future CRDT or operational-transform layer could hook in without a
rewrite. It is **not** implemented yet — don't feel like you need to build
multiplayer to contribute. Most of the roadmap above is single-user work.
