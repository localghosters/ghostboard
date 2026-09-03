# GhostBoard

> A lightweight, open-source infinite whiteboard built by the community.

GhostBoard is a fast, hackable infinite canvas for sticky notes, shapes,
arrows, and freehand drawing. It runs entirely in your browser — no
account, no backend, no lock-in. Everything you make is just JSON you can
export, version, and bring back later.

It is **not** trying to be Figma or Miro. It's trying to be small enough
to understand in an afternoon and useful enough to reach for anyway.

<!-- Screenshot / demo placeholder — drop a GIF or screenshot here once the
     project has one. A short clip of drawing shapes + sticky notes + pan/zoom
     goes a long way. -->
<p align="center">
  <em>Screenshot / demo GIF coming soon</em>
</p>

## Features

- **Infinite canvas** — smooth pan and zoom, dot grid, fit-to-content view
- **Selection** — click, shift-click, drag-select (marquee), drag to move, resize, duplicate, delete
- **Sticky notes** — editable text, five accent colors
- **Shapes** — rectangle, rounded rectangle, ellipse, line
- **Arrows** — simple point-to-point arrows, structured so object-to-object connections can be added later
- **Freehand drawing** — pen tool with adjustable stroke width, plus an eraser
- **Undo/redo** — a real command history, not full-board snapshots
- **Export/import** — the whole board is one versioned `.json` file (see [`docs/JSON_FORMAT.md`](docs/JSON_FORMAT.md))
- **Keyboard shortcuts** — for every common operation (press `?` in the app for the full list)

That's it for V1. See [`ROADMAP.md`](ROADMAP.md) for what's next.

## Getting started

Requires Node.js 18+.

```bash
git clone https://github.com/localghosters/ghostboard.git
cd ghostboard
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Development

```bash
npm run dev       # start the dev server with hot reload
npm run build     # type-check and build a production bundle to dist/
npm run preview   # preview the production build locally
npm run test      # run the test suite once
npm run test:watch  # run tests in watch mode
npm run lint      # lint the codebase
```

The app is a static site — `npm run build` produces a `dist/` folder you
can host anywhere (no server-side component).

## Architecture overview

GhostBoard is a client-only React + TypeScript app. The codebase is split
along the concerns that tend to matter for a canvas app, so you can change
one without having to understand all the others:

```
src/
  model/         Board/object data model, factories, geometry & hit-testing
  state/         App state (zustand store) + undo/redo command history
  serialization/ JSON export/import + schema versioning
  canvas/        SVG rendering: viewport, grid, selection, per-object renderers
  tools/         (reserved for tool-specific logic as it grows)
  components/    UI chrome: top bar, toolbar, context panel, shortcuts modal
  hooks/         Cross-cutting behavior (keyboard shortcuts)
  utils/         Small stateless helpers (coordinate math)
```

A few decisions worth knowing about before you dive in:

- **Board objects are a flat array**, each with a common envelope (`id`,
  `type`, `x/y/width/height`, `style`, ...) plus type-specific fields. See
  `src/model/types.ts` — it also documents the exact checklist for adding a
  new object type.
- **Rendering is a lookup table, not a switch statement.**
  `src/canvas/registry.tsx` maps `ObjectType -> React component`. Adding a
  new type means adding a new entry, not editing existing render code.
- **Undo/redo uses a command pattern**, not full-board snapshots
  (`src/state/history.ts`). Drags and resizes are batched into a single
  "transaction" so one drag = one undo step, not one per pixel moved.
- **State lives in one zustand store** (`src/state/store.ts`). There's no
  prop-drilling; components pull just the slice of state they need.
- **Pointer/tool interaction lives in `CanvasView`.** It's the one file
  that's intentionally a bit larger than the rest, because pan, select,
  draw, resize, and erase all share the same pointer event stream and
  splitting that apart tends to create more indirection than clarity. If
  you're adding a new tool, this — plus the toolbar and context panel — is
  where you'll spend most of your time.

None of the collaboration features listed in the roadmap (multiplayer,
comments, auth, cloud sync, plugins, ...) are implemented. The goal for V1
was to keep the surface area small; the architecture above is meant to
leave room for those without a rewrite, not to pre-build them.

## Keyboard shortcuts

Press `?` in the app for the full list. Highlights:

| Shortcut | Action |
| --- | --- |
| `V` | Select tool |
| `H` / hold `Space` + drag | Pan |
| `S` `R` `U` `O` `L` `A` `P` `E` | Sticky, Rectangle, Rounded rect, Ellipse, Line, Arrow, Pen, Eraser |
| `Delete` / `Backspace` | Delete selection |
| `Ctrl/Cmd+D` | Duplicate selection |
| `Ctrl/Cmd+C` / `Ctrl/Cmd+V` | Copy / paste |
| `Ctrl/Cmd+Z` / `Ctrl/Cmd+Shift+Z` | Undo / redo |
| `Ctrl/Cmd+A` | Select all |
| `Ctrl/Cmd` + scroll | Zoom |
| `+` / `-` | Zoom in / out |
| `0` | Fit view to content |
| `Escape` | Deselect / cancel current action |

## JSON format

Boards export to a single, documented, versioned JSON file. Full spec:
[`docs/JSON_FORMAT.md`](docs/JSON_FORMAT.md).

## Contributing

Contributions of all sizes are genuinely welcome — this project is meant
to be grown by more people than just its original authors. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for setup details and conventions, and
[`ROADMAP.md`](ROADMAP.md) for a list of concrete things to work on,
including:

- New tools and object types (images, text, ...)
- UI/UX improvements
- Performance work (large boards, thousands of objects)
- Accessibility
- Mobile/touch support
- Collaboration groundwork
- Documentation and examples
- Tests
- Bug fixes, however small

If nothing in the roadmap fits what you want to build, open an issue and
propose it — this list isn't exhaustive.

## License

[MIT](LICENSE)
