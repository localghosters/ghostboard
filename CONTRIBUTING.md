# Contributing to GhostBoard

Thanks for considering it — GhostBoard is meant to be built by more people
than just its original authors, and small contributions are as welcome as
big ones.

## Ground rules

- Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Open an issue before starting large or ambiguous work, so we can align on
  approach before you sink hours into it. Small fixes and clear bugs don't
  need this — just send a PR.
- Keep PRs focused. A PR that does one thing is easy to review and easy to
  revert if something goes wrong; a PR that does five things is neither.

## Getting set up

```bash
git clone https://github.com/localghosters/ghostboard.git
cd ghostboard
npm install
npm run dev
```

Requires Node.js 18+. See the README for the full list of scripts
(`npm run build`, `npm run test`, `npm run lint`, ...).

Before opening a PR, please run:

```bash
npm run lint
npm run test
npm run build
```

All three should pass. CI will run them too, but catching issues locally
first saves everyone a round trip.

## Where to start

- [`ROADMAP.md`](ROADMAP.md) has a running list of ideas, including a
  "good first issue"-style section of small, self-contained tasks.
- The [issue tracker](../../issues) has specific, ready-to-pick-up work.
  Comment on an issue before starting so two people don't duplicate effort.
- If you have your own idea that isn't listed anywhere, open an issue to
  discuss it first — especially if it's a bigger change.

## Project structure

See the "Architecture overview" section of the [README](README.md) for how
the codebase is organized. The short version: `model/` is data, `state/`
is app state and undo/redo, `canvas/` is rendering and pointer
interaction, `components/` is UI chrome. Try to keep new code in the
layer it belongs to rather than reaching across — e.g. a new tool
shouldn't need to know about React component internals of unrelated UI,
and a UI component shouldn't mutate the board directly instead of going
through a store action.

### Adding a new object type

This is the most common kind of contribution, so it has its own checklist
at the top of [`src/model/types.ts`](src/model/types.ts). Follow it in
order and you shouldn't need to touch anything outside of: the type
definition, a factory function, a bounds/hit-test case, and a render
component + registry entry.

### Adding a new tool

Tools are largely handled in three places:

1. `src/components/Toolbar.tsx` — add the tool button and icon.
2. `src/canvas/CanvasView.tsx` — add pointer-down/move/up behavior for the
   new tool. Look at how `pen` or the shape tools work as a starting
   point.
3. `src/components/ContextPanel.tsx` — if the tool has options (like
   stroke width), surface them here.

### Code style

- TypeScript, strict mode. Avoid `any` where you reasonably can (a couple
  of spots in the store use it deliberately for generic patch objects —
  that's a known, contained exception, not a pattern to copy elsewhere).
- Run `npm run lint` (oxlint) before committing.
- Prefer small, focused functions over deeply nested logic. Comments are
  welcome where the *why* isn't obvious from the code, but avoid
  narrating what the code already says.
- No new runtime dependencies without a good reason — GhostBoard is
  intentionally light. If you think one is warranted, say why in your PR.

### Tests

New logic in `model/`, `state/`, or `serialization/` should have tests —
these are the parts of the codebase where regressions are easy to miss
visually and easy to catch with a unit test. UI/rendering code doesn't
need the same level of test coverage yet, though that's itself a good
area to contribute to (see the roadmap).

## Commit messages & PRs

- Write a clear PR description: what changed and why. Screenshots or a
  short clip are genuinely appreciated for anything visual.
- Reference the issue you're addressing if there is one (`Closes #123`).
- Squash-friendly commit history is nice but not required — we'll squash
  on merge if needed.

## Reporting bugs / requesting features

Please use the issue templates (`.github/ISSUE_TEMPLATE/`) — they ask for
the minimum info needed to act on a report (repro steps, expected vs.
actual behavior, browser/OS for bugs).

## Security issues

Please don't open a public issue for a security concern — see
[SECURITY.md](SECURITY.md) instead.
