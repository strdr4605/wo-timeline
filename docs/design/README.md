# Design source (Sketch)

Everything needed to build the Work Order Schedule timeline pixel-accurately.

## Files

| File | Purpose |
|---|---|
| `tokens.json` | Curated design tokens. This is what the SCSS variables must match. |
| `artboards.json` | Generated dump of every layer: frame, fills, borders, shadows, text style, string. Use it for anything `tokens.json` does not list. |
| `source/FE-Take-Home-Challenge.sketch` | The original file (zip). Kept because the Sketch cloud download token expires. |
| `fonts/CircularStd-*.otf` | Circular Std Book, Medium, Regular, Bold, extracted from the file. Offline fallback for the CDN font. |
| `extract.mjs` | Regenerates `artboards.json` and `fonts/` from the source file. |

## Regenerate

```bash
node docs/design/extract.mjs
```

## Provenance

- Sketch URL: https://www.sketch.com/s/d56a77de-9753-45a8-af7a-d93a42276667
- Document id: `79ec88c2-9a78-46e0-8da2-a04f5503d015`
- Pages: `Work Order Schedule` (9 artboards), `Symbols` (11 shared symbols)
- Extracted: 2026-11-08, by parsing the `.sketch` zip. The Sketch web canvas does not render in the agent browser, so the web UI was used only to read the component list.

## Artboards (all 1440 x 1024)

| Artboard | Shows |
|---|---|
| Work Order Schedule - Default | Month timescale, 5 work centers, bars in every status |
| Work Order Schedule - Options CTA Controls (shown on hover) | Bar hover state |
| Work Order Schedule - Edit and Delete Controls Expanded | Three-dot menu with Edit / Delete |
| Work Order Schedule - View Selection | Selected row |
| Work Order Schedule - Create New Event - With Selection | Panel open after a timeline click |
| Work Order Schedule - Create New Event - Placeholder and Defaults | Panel with placeholder name, default status, dates |
| Work Order Schedule - Create New Event - Active Text Field | Focused field |
| Work Order Schedule - Create New Event - Status Dropdown | Status menu open |
| Timeline - Hover Options | Bar hover with resize handles and date tooltip |

## Symbols (11)

`Controls/Text Field/Dropdown`, `Dropdown/Simple`, `Buttons/Primary/Active/Default/Main`, `Buttons/Secondary/Active/Default/Main`, `Button/Medium/Primary/Default/No-Background`, `Buttons/Alt/Dropdown`, `Buttons/Alt/Tooltip Dismiss`, `Buttons/Alt/Icon Subtle/Hover`, `Table/Header/3`, `Avatar / Status / Approved`, `Avatar / Border / White`, `Cursor/Hand/Pointing`.

## Reading the values

- Colour values are hex; an alpha of 0.75 or 0.5 is kept separate (Sketch `fill.color.alpha`).
- Borders in the Sketch file often use `#979797` as a placeholder stroke. The visible grid uses `#e6ebf0`.
- Corner radii live in `style.corners.radii`, not in `style.cornerRadius`.
- Text styles name the font face directly (`CircularStd-Book`, `CircularStd-Medium`, `CircularStd-Regular`, `CircularStd-Bold`).

## Not in the design

See `notInDesign` in `tokens.json`: Day and Week timescales, row hover colour, overlap error state, empty state. These are open decisions.
