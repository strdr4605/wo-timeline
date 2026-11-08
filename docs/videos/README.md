# Video transcripts

Reference material from the task owner, pulled from the Chrome tabs on 2026-11-08.

| File | Video | Length | Source |
|---|---|---|---|
| `fe-kickoff-and-handover.md` | FE Kickoff and Handover — grading notes for the challenge | 2:56 | https://drive.google.com/file/d/1rl3LHBytdvZ_pXNw6s-0tRZeCxEdwV8v/view |
| `fe-reference-implementation-walkthrough.md` | Reference implementation walkthrough — Renvil Dsa, 16:33, candidate submission | 16:33 | https://www.loom.com/share/728c42f5b9a341a88c1a5fad167df398 |
| `fe-work-order-timeline-overview.md` | Work Order Schedule Timeline overview — Jacob Hamel, 4:05, candidate submission | 4:05 | https://www.loom.com/share/96206a805ac34428b99fd557e5fd02f7 |
| `naologic-company-intro.md` | Naologic Company Intro — company and process context | 4:30 | https://drive.google.com/file/d/178wnbuvdAFtG0g1lu_4Fq7IUe7vR1HnN/view |
| `backend-challenge-erp-scheduling-context.md` | Gemini ERP Expert demo — **backend track, not this task**. Domain vocabulary only | 2:39 | https://www.loom.com/share/d1dcfb7aa72e45aaae294985e68d2a5f |

The two Drive videos are from the task owner (Naologic). The two Loom walkthroughs are candidate submissions to this same challenge, found in the owner's Loom comments.

## What the owner said matters (from `fe-kickoff-and-handover.md`)

- UI attention to detail: "we are going to care a lot about layouts … down to the pixel that things are looking like they're supposed to."
- Inspect every state in Sketch Cloud and copy the exact colour codes and styling.
- States to implement: timeline default view, hover state (click to add dates), expanded timescale dropdown, bar hover options, and clicked hover options (Edit / Delete).
- Default timescale is **Month**.
- Do not use system dropdowns. Style the dropdown exactly like the design.
- Side panel: correct drop shadow, correct width, correct overlay, correct placement.
- Status dropdown is a pill when collapsed and plain text when expanded.
- Text field: placeholder state and active/focused state. The date picker must open when the field is clicked — no separate calendar entry point.
- "Please make sure you have the right colors … that you have looked at all of the states."

## Domain context (from `backend-challenge-erp-scheduling-context.md`, different challenge)

This video is a screen recording of a Gemini session ("ERP Manufacturing Order to Work Order") for a **separate backend challenge**. Nothing in it specifies this front-end component. Useful only for vocabulary and domain sense.

- The problem there is classic scheduling: capacity planning and resource management.
- Work orders live in Gemini under ERP Expert → Manufacturing Order → Creates Work Orders.
- That owner wants thousands of demo rows, constraint solving (time, dependency, location).
- ERP work is "status changes of a document", snapshotting data at different levels, plus math.

## Company context (from `naologic-company-intro.md`)

- Naologic builds vertical ERPs for manufacturers: make-to-stock, continuous flow, engineered-to-order, configured-to-order.
- Modules span finance, sales, purchasing, vendor and account management, CRM, quality control, deep inventory management.
- Built on their own low-code platform; backend is roughly 90–95% AI-generated, front end roughly 50%.
- They are hiring front-end people to close that gap.

## What the two candidate walkthroughs reveal (useful as prior art)

From `fe-reference-implementation-walkthrough.md` (Renvil Dsa, 16:33) and `fe-work-order-timeline-overview.md` (Jacob Hamel, 4:05):

- Component split used by both: timeline state + drawer state, timeline split into shared / grid / bar components, a work order store service, hardcoded sample data, overlap checks in the service.
- Default timescale in both: **Month**. Week and Day render at a different column scale.
- Bonus features both implement: infinite horizontal scroll, a "Today" button that centres the view, tooltip on bar hover showing work order details.
- Drawer behaviour: slides in from the right; start date pre-filled from the click position; end date defaults to start + 7 days; three-dot menu on the bar offers Edit and Delete; delete is immediate.
- Overlap validation: rejected on save with a message, order is not created or updated.
