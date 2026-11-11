# r1-brand: neutral branding (release item R1)

## What changed

- `public/naologic-logo.svg` is removed. `public/wo-timeline-logo.svg` is new: a "WO Timeline"
  text wordmark, 80 x 10, fill #3e40db (the design logo colour). The text uses
  `textLength="80"` with `lengthAdjust="spacingAndGlyphs"`, so the glyphs fill the box on every
  system font. The `<img>` box (101, 20, 80 x 10) does not change; the layout does not move.
- `src/app/app.html`: `src="wo-timeline-logo.svg"`, `alt="WO Timeline"`.
- `src/app/data/schedule.service.ts`: the storage keys are `wo-timeline.workOrders.v1` and
  `wo-timeline.railWidth.v1`. No migration: stored data under the old keys is lost (accepted).
- Tests: the keys in `rail`, `resize`, `storage`, `demo-data` specs. Titles without the company
  name: `[G3] the wordmark sits at ...` (alt is now `WO Timeline`), `[A5] Circular Std comes from
  the font CDN ...`. The IDs stay.
- New `tests/e2e/brand.spec.ts`: `[R1]` checks the logo src, alt, natural width, box and SVG
  text, that the app reads `[]` and `300` from the new keys, and that a rail key step writes only
  the new keys.
- `acceptance-criteria.json/.md`: the evidence titles of A5 and G3, and a new row R1 in Bonus
  features.

## Pixel check (Schedule - Default, bar masks from the handover)

| | total | logo box 101,20,80,10 (Group 3) |
|---|---|---|
| before | 0.21% | 0 bad px |
| after  | 0.23% | 311 bad px (38.88%) |

All 311 new bad pixels are in the logo box (the top bar Rectangle 0,0,1440,50 shows the same
311). Every other layer has the same count as before (for example Group 2: 58).
This is the accepted change: the design shows the company wordmark.

## Checked by hand (Playwright, headless)

- `/`: logo `wo-timeline-logo.svg`, alt `WO Timeline`, naturalWidth 80, box {101, 20, 80, 10}.
- `wo-timeline.railWidth.v1 = 300` then reload: rail width 300.
- `/?parity=1` with empty storage: no key is written.
- `node docs/requirements/verify.mjs`: Playwright and vitest exit 0.

## Grep

`grep -rni naologic src tests public .storybook` finds only the font CDN URL
(`src/index.html`, `.storybook/preview-head.html`, `tests/e2e/font.spec.ts`).

## Open points for the lead

- `README.md` still has the company name (line 3, and the old keys on line 125). R6 rewrites the
  README, so R1 does not touch it. If R6 is dropped, fix these two lines.
- `src/app/timescale-chip/timescale-chip.html:16` names the design layer
  `Nao_Icons/Line/Arrow/Simple/Down`. It is not the full company name, so the grep does not find
  it. Kept as the design layer name.
- `verify.mjs` rewrites hand-written evidence: on this run it replaced the D12 and I12 evidence
  with one test title. I restored both from HEAD and ran `render.mjs` only.
