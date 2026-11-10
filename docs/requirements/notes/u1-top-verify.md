# u1-top verify (2026-11-10)

Verifier: Claude, herdr-core child. Node 22.14.0 (the default Node 16 cannot run Playwright).

## Pixels

Default: `--url=/?parity=1 --mask="0,204,1440,820"`. View Selection: `--steps="click@210,167;wait@300"`,
grid masked except the menu box (`0,204,95,820;310,204,1130,820;95,330,215,694`).

- Logo "Group 3" pass - 0 bad px, img box 101,20,80x10, natural size loaded - pixel-check Default + zoom
- Top bar pass - 0 bad px, 1440x50, white, border-bottom 0px - pixel-check Default, computed style
- Page head (y 50-204) pass - 0 bad px, white, box 0,50,1440x154 - pixel-check Default, computed style
- Table/Header/3 (title) pass - 197 px, 4.08%; glyph run wider in app (text engine), top and left edges match, 24px/34px/500 #030929 at y 95 - zoom Default
- Rectangle 2 chip body 146x25 fail - 53 px, 1.45%; shadow too strong. Design (150,180) #dce1f1, app #c9d0e9; design (150,181) #ebeef8, app #cfd5ec; design (100,165) #ffffff, app #f8f9fc (app bleeds left, design does not). Rendered `1px 2.5px 3px #c8cfe9` is darker than the export: the Sketch blur 3 does not map 1:1 to CSS blur 3, or the colour needs alpha - pixel sampling Default
- Rectangle 2 label segment 75x25 pass - 44 px, 2.35%, edge of the same shadow plus AA - zoom Default
- Timescale label pass - 44 px, 4.66%, AA only, same glyph box - zoom Default
- Rectangle 2 value segment pass - 9 px, 0.51% - pixel-check Default
- Month value text pass - 8 px, 1.25%, AA only - zoom Default
- Chevron Nao_Icons/Line/Arrow/Simple/Down pass - 1 px; box 230.52,165.91,8.47x5; #687196 closed, rgb(86,89,255)=#5659ff open - pixel-check both artboards, computed stroke
- Dropdown/Simple Copy (menu) pass - 72 px, 0.26%; box 101,185,200x136 matches; side shadow 1-2 px slightly darker than export (design 301,250 #f3f5f9, app #e3e6f2), AA level - zoom View Selection
- Rows under the menu (Rodriques Electrics, Rectangle fills) n/a - below y 204, row height B10, outside unit

## Behaviour

- Parity A1 today pass - Sep 2024 is the current column ("Current month" chip) with `?parity=1` - DESIGN-PARITY.md "takes 2024-09-01 as today"
- Parity A2 first column pass - Aug 2024 header at x 482 (rail edge), also after Hour -> Month round trip - DESIGN-PARITY.md "the first column is August 2024"
- Parity A3 fixture pass - 4 bars: Concentrix Ltd, Konsulting Inc, Compleks Systems, McMarrow Distribution - DESIGN-PARITY.md fixture table
- Parity A4 Month default pass - chip value Month - DESIGN-PARITY.md "keeps the timescale Month"
- Normal app unchanged pass - no param: current Nov 2026, 8 sample bars, chip Month, centred on today - unit scope
- G3 pass - logo at (101,20) 80x10 - acceptance-criteria G3 "Logo top left with the spacing from the design"
- G2 pass - chip 146x25 at (101,155), label 75, value 71, radius 5 - acceptance-criteria G2 "label segment 75, value segment 71, height 25, radius 5"
- B3 pass - menu lists Hour, Day, Week, Month; each select updates chip, closes menu, header changes (00:00.., 18 19.., Jul 15.., Mar 2024..), 4 bars kept - acceptance-criteria B3 "offers Day, Week, Month (Hour is optional extra)"; FE spec "Change Timescale dropdown | Update timeline zoom level"
- B3 close on outside click pass - menu closes - behaviour check
- B3 Escape note - Escape does not close the menu; pre-existing, not in spec - behaviour check

## Regressions

- `npm run build` pass - clean, 0 warnings
- `npx vitest run` pass - 9 passed
- `npx playwright test` pass - 24 passed

## Code

- Tokens pass - no new colour or px literals in unit scss; new values in tokens.json with agentChoices notes. Chevron polyline points are SVG geometry literals in the template (acceptable)
- Dead code pass - old chevron triangle, border, `sass:math` removed
- Top-down order pass - scrollToStart/scrollToColumn sit before centerOnToday, helpers at bottom
- `todayPosition` Hour detection note - detects Hour by column span `<= HOUR_MS` instead of the timescale; works, but implicit
- Scope note - diff also holds `scripts/pixel-check.mjs`, `package.json`/`package-lock.json` (pixelmatch, pngjs), `.gitignore` (.pixel-check), `docs/requirements/prompts/*`: tooling, not feature code; lead decides the commit split
- ng-select note - timescale menu is a custom list, not ng-select (FE spec: "you must use ng-select for dropdowns"; grill Q11). Pre-existing, not changed by this unit

## Failures

- Chip shadow (Rectangle 2, 101,155,146x25): rendered shadow darker and wider than the export. Design #dce1f1 / app #c9d0e9 at (150,180); left bleed #f8f9fc where design is #ffffff.
