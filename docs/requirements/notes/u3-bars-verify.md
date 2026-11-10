# Unit u3-bars: verify

Verifier, 2026-11-10. Lead: t38. Node 22.14.0. Artifacts of the run: `.pixel-check`-style output in
the session scratchpad (`pc/def`, `pc/cta`, `pc/edit`).

Pointer hotspots: the `Cursor/Hand/Pointing` layers give (710,325), (710,325), (850+9, 338-18) and
(1008,440). The fingertip is at (+12, +8): checked on the export of "Timeline - Hover Options"
(fingertip at 1020,448). The builder table is correct.

## Pixels

P1 Default total pass - 0.27% with `hover@722,333;wait@300`, mask `710,325,32,32` - pixel-check
P2 Default bar boxes pass - edges 0.2 to 1.9px off (Concentrix 438.9/437, Konsulting end 935.2/937, McMarrow end 1211.8/1210, Compleks start 946.3/945); 1 day = 3.7px in Month view - pixel-check, Playwright boundingBox
P3 Default names and badges pass - glyph anti-aliasing only (9 to 25% of text boxes), fills and right edges match - pixel-check zoom
P4 Default z-order pass - chip pixels over Concentrix bar #d4d7ff = design (600,255 and 700,256); today line under bar (597,270 #f8fff3 = design) - export vs app.png
P5 Options CTA total pass - 0.31% with `fixture=hover`, same steps and mask - pixel-check
P6 Options CTA three-dot button pass - 22 of 528 px differ, dot anti-aliasing only; fill #f1f3f8, 24x22 at 850,311, radius 4 - zoom 840,300,50,40
P7 Options CTA Spartan Distribution pass - app y 450, mock y 455 (mock draws it 5px under row centre); Open badge right edge 1079.5 against 1080, fill #e4fdff, text #00b0bf - pixel-check, computed style
P8 Edit and Delete menu pass - Dropdown/Simple Copy 37 bad px (0.23%), rows 22 and 15 px, text AA only; box 850,338 200x80, radius 5, shadows `0 4.5 5 -1 #d8dceb`, `0 2.5 3 -1.5 #c8cfe9` - pixel-check zoom 840,300,230,130
P9 Edit and Delete three-dot button (menu open) fail - design fill #d8dceb (853,314 / 856,318 / 870,314 / 853,330), app #f1f3f8; 315 of 333 unmasked px in box 850,311,24,22 differ. pixel-check does not list this symbol layer, so the builder note "clean" missed it - export vs app.png
P10 Timeline handles and date tooltip values pass - handle #dee0ff 4px at both ends incl. border (export x 556-559, 1028-1030); tooltip 26 high #687196, bottom 418, bar top 423 = gap 5. Design tooltip centre 788 against bar centre 793.5; app centres exactly - export pixels, layers
P11 Timeline pointer state fail - design pointer hotspot 1020,448 is 11px inside the bar end (bar 556 to 1031) and the export shows both handles and the date tooltip. App handle zone is 8px (`width: $radius-bar`): Konsulting Inc end-2 and end-6 show handles + tooltip, end-9, end-11, end-14 show nothing - Playwright, opacity of `__handle--end` and `.work-order-tooltip`

## Behaviour

C1 pass - parity bars at x/y of the artboards within 2px, all y exact (249, 303, 352, 352, 401, 450) - "Bar start position = work order start date / Bar end position = work order end date" - Playwright
C2 pass - every bar shows name + badge (Complete, In progress, Blocked, Open) - "Status badge (pill/tag style)" - Playwright
C3 pass - open #f2feff/#cefbff/#e4fdff/#00b0bf, in-progress #edeeff/#dee0ff/#d6d8ff/#3e40db, complete, blocked as tokens; all 4 statuses in sample data. Spec says "Open | Blue": cyan is the lead decision from the design - Playwright computed style
C4 pass - 38 high, radius 8px, border 1px - Playwright computed style
C5 pass - hover shows button (opacity 1), click opens menu Edit/Delete, outside click closes. Note: Escape does not close the menu (not required) - "Click three-dot menu on bar | Open dropdown with Edit/Delete options" - Playwright
C6 pass - menu 200x80, rows 200x28, radius 5, Delete hover #f1f3f8, menu draws over the row below (elementFromPoint 900,400 = menu item) - acceptance C6 - Playwright
C7 pass - body hover: opacity 0 at 300ms, 1 at 1100ms; text "Rodriques Electrics / In progress / Aug 6, 2024 to Nov 16, 2024"; 26 high, 5px over the bar - "Tooltip on bar hover: Show work order details (name, status, full date range)" - Playwright
C8 pass for the brief (handles at both ends on hover at the end); design state fails, see P11 - acceptance C8 - Playwright

## Regressions

R1 `npm run build` pass - bundle complete, no warnings shown
R2 `npx vitest run` pass - 9 passed
R3 `npx playwright test` pass - 26 passed

## Code

K1 tokens pass - no colour literals in work-order-bar.scss; new tokens all used (dot-group-width, menu-gap, tooltip-gap-to-bar, show-delay, row-hover-fill)
K2 dead code pass - none found
K3 top-down pass - parity.ts export must follow its `const` arrays; note: `fixture` parses the query string a second time next to PARITY_MODE
K4 scope pass - changes only in bar, parity fixture, tokens, bars.spec. Note: `docs/requirements/DESIGN-PARITY.md` still lists width 463 and no `fixture=hover` (outside the unit)

Not checked as a defect: "Drag to resize" tooltip of "Timeline - Hover Options" is not built (no resize yet). The scope names resize handles and the date tooltip only.

## Failures

- P9: three-dot button with open menu must use the pressed fill #d8dceb (design), app keeps #f1f3f8.
- P11: handle zone 8px is too narrow for the design pointer (11px inside the bar end); at the design hotspot the app shows no handles and no tooltip.
