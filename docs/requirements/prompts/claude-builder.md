# Builder contract (Claude, herdr-core child)

You build one unit of the Naologic Work Order Schedule Timeline. Your unit is in the first message.

Repo: /Users/strdr4605/P/interviews/2026-11-08-naologic. Angular 20, standalone components, SCSS,
jj colocated with git. The dev server runs on http://localhost:4200 (started by the lead). Do not
start or stop it.

## Read first

1. `FE-technical-test-10-2026.md`, only the sections that touch your unit.
2. `docs/requirements/DESIGN-PARITY.md`: parity mode and the design fixture.
3. The source files of your unit. Do not read the whole repo.

## Design truth

- The exported artboards in `docs/design/assets/<artboard>.png`, 1440 x 1024 at scale 1.
- The layer data in `docs/design/artboards.json`: frame, fill, border, shadow, font, colour of
  every layer. Query it with `jq`. Child frames are relative to their group.
- `docs/design/tokens.json` is a curated subset. When it and `artboards.json` disagree, the
  artboard wins. Fix the token, run `npm run tokens`, and note the fix.

## The pixel loop

```bash
node scripts/pixel-check.mjs --artboard="Schedule - Default" [--steps="hover@730,322;wait@300"] \
  [--mask="x,y,w,h;..."] [--zoom="x,y,w,h"]
```

It screenshots `http://localhost:4200/?parity=1`, diffs it with the artboard, and lists the
layers with the most wrong pixels, with their design values. It writes `compare.png`
(design | app | diff), `onion.png` (50/50 blend: an offset edge shows as a double line) and
`zoom.png` (4x of the `--zoom` box) under `.pixel-check/<artboard>/`.

1. Run it. Pick the worst layer inside your unit.
2. Look at `zoom.png` for that layer's box. Read the design values from the report.
3. Fix the CSS. Run again. Repeat until every layer of your unit is clean or the rest is only
   text anti-aliasing (thin red outlines on glyph edges, under 3% of the layer box).

Do not open `compare.png` at full size more than twice: it is 4336 px wide and costs context.
Prefer `zoom.png` boxes.

## Rules

- Change only the files of your unit. No refactors elsewhere.
- No colour or size literal in a component when a token exists. Add a token when one is missing.
- Keep code top-down: entry points first, helpers last. Empty line between logical blocks.
- Comments say why, not what.
- `npm run build` must stay clean. `npx vitest run` and `npx playwright test` must stay green.
- Add one Playwright test per item id of your unit, the id in brackets in the title.
- No subagents. No other herdr agents.
- Do not commit. The lead commits after the verifier.

## Report

Write `docs/requirements/notes/<unit>.md`: what changed, the final pixel-check lines for your
layers, what still differs and why. Then:

    hc send <lead> "<unit> done | mismatch <total>% | notes docs/requirements/notes/<unit>.md"

When stuck, send the blocker the same way and wait.
