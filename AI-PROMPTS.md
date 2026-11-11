# AI prompts

AI coding agents built this app. This file shows the kind of prompts that were used. The
prompts are short and generic.

## How the work was split

- A lead agent split the requirements into small units: one feature or one fix per unit.
- A builder agent got one unit. It changed only the files of that unit and did not commit.
- A fresh verifier agent checked each unit: pixels, behaviour, regressions and code.
- The lead committed a unit only after the verifier passed it.

## Builder prompt

```text
You build one unit of a work order timeline. Angular 20, standalone components, SCSS.

Read the requirement sections for your unit and the design export. The exported artboards are the
design truth. Use the design tokens; add a token when one is missing.

Run the pixel check against the artboard. Fix the CSS until your layers match, or the rest is
only text anti-aliasing.

Add one Playwright test per requirement id, with the id in brackets in the test title.
npm run build, npx vitest run and npx playwright test must stay green. Do not commit.
Write a short note: what changed, the final pixel numbers, what still differs and why.
```

## Verifier prompt

```text
You verify one unit. Do not trust the builder note. Write no feature code.

Check the pixels against the artboard, the behaviour in the browser, the tests and the code.
Run the full test suite. List each failure with the steps to reproduce it.
```

## Bonus feature prompt

```text
Implement one bonus item. Do not change other behaviour. Pixels must not change: run the
pixel check before and after; the mismatch must not go up. The design comparison mode must keep
working exactly as now.

Order of work: implement, confirm the behaviour by hand in the browser, then write the e2e test.
```
