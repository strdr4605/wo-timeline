# Unit u3-fix: builder notes

Builder, 2026-11-10. Items P9 and P11 of `u3-bars-verify.md`. Lead: t38. Node 22.14.0.

## What changed

- P9. The three-dot button uses the pressed fill while its menu is open.
  - `docs/design/tokens.json`: new token `layout.bar.actionsButton.pressedFill` `#d8dceb`, with a
    note in `agentChoices`. Then `npm run tokens` (`$layout-bar-actions-button-pressed-fill`).
  - The value comes from the export of "Edit and Delete Controls Expanded" (853,314 / 856,318 /
    870,314 / 853,330). The fill of the symbol `Buttons/Alt/Icon Subtle/Hover` is not in
    `artboards.json`.
  - `work-order-bar.scss`: rule `.work-order-bar--menu-open .work-order-bar__actions`.
  - `tests/e2e/bars.spec.ts`: test `[P9]`. Hover gives `#f1f3f8`, open menu gives `#d8dceb`, a
    click outside gives `#f1f3f8` again.
- P11. No code change. The lead chose option C: keep the 8px handle zone and record the conflict
  (see below).

## P11: design conflict

- "Timeline - Hover Options" puts the pointer hotspot at 1020,448. That is 11px inside the bar end
  (bar 556 to 1031). The export shows both handles and the date tooltip.
- "Edit and Delete Controls Expanded" clicks the three-dot button at 871,328. That is also 11px
  inside the bar end (Rodriques Electrics, 501 + 381 = 882).
- The two artboards ask for different results at the same point. I tried a 12px zone (3 x the 4px
  handle layer) above the button. The `[P11]` test then passed, but the click hit the handle and
  the menu stayed shut. "Edit and Delete Controls Expanded" went from 0.26% to 0.98%.
- "Timeline - Hover Options" is an older mock. It has no three-dot button, so it cannot show this
  conflict. The handle zone stays 8px (`$radius-bar`). The 12px try is removed: no token, no test.

## Final pixel-check lines

Edit and Delete Controls Expanded (`fixture=hover`, `hover@871,328;click@871,328;wait@300`, mask
`859,320,32,32`): **0.26%**

    1920  0.28%  Rectangle [483,309,957,713]
    1738  0.29%  Group 5 [596,275,799,747]
     635  3.14%  Group 6/Rectangle 2 [677,401,533,38]   bar end at 1211.8, see u3-bars
     470  3.25%  Group 7/Rectangle 2 [437,249,381,38]   bar start at 438.9, see u3-bars

pixel-check does not list the button symbol layer. Direct compare of the export and `app.png` in
box 850,311,24,22 (mask excluded): 5 of 333 px differ (before: 315). The four sample points are
`#d8dceb` in both.

Options CTA Controls (`fixture=hover`, `hover@722,333;wait@300`, mask `710,325,32,32`): **0.31%**,
no change.

Schedule - Default (`hover@722,333;wait@300`, mask `710,325,32,32`): **0.27%**, no change.

## Regressions

- `npm run build`: clean.
- `npx vitest run`: 9 passed.
- `npx playwright test`: 27 passed.

## What still differs and why

- P11: the design pointer 11px inside the bar end shows no handles and no tooltip. This is the
  design conflict above. The handles and the immediate tooltip show in the outer 8px of each end.
- The 5 different px in the button box are dot anti-aliasing.
