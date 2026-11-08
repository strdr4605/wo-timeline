# Sample data set

Locked by the grilling session (Q10, Q16). The names come from the Sketch artboard
`Work Order Schedule - Default`. The dates are the Sketch bar positions shifted by 27 months, so
the months run from 2026 instead of 2024. Two bars are additions, because the design has no
`open` bar and the brief wants at least 8 work orders with all 4 statuses.

The structure is the one from the brief: `docId`, `docType`, `data`. One work order per bar.
No two orders on the same work centre may overlap.

## Work centres (rail order of the design)

| docId | name |
|---|---|
| wc-genesis | Genesis Hardware |
| wc-rodriques | Rodriques Electrics |
| wc-konsulting | Konsulting Inc |
| wc-mcmarrow | McMarrow Distribution |
| wc-spartan | Spartan Manufacturing |

## Work orders

| docId | name | workCenterId | status | startDate | endDate | origin |
|---|---|---|---|---|---|---|
| wo-concentrix | Concentrix Ltd | wc-genesis | complete | 2026-10-18 | 2027-02-22 | Sketch bar, shifted |
| wo-polymer | Polymer Extrusion | wc-genesis | open | 2027-06-07 | 2027-07-19 | added |
| wo-rodriques | Rodriques Electrics | wc-rodriques | open | 2026-11-05 | 2027-03-10 | Sketch bar, shifted |
| wo-steel | Steel Fabrication | wc-rodriques | complete | 2027-04-01 | 2027-05-10 | added |
| wo-konsulting | Konsulting Inc | wc-konsulting | in-progress | 2026-09-18 | 2027-01-21 | Sketch bar, shifted |
| wo-compleks | Compleks Systems | wc-konsulting | in-progress | 2027-03-07 | 2027-07-10 | Sketch bar, shifted |
| wo-mcmarrow | McMarrow Distribution | wc-mcmarrow | blocked | 2027-01-08 | 2027-05-30 | Sketch bar, shifted |
| wo-spartan | Spartan Manufacturing | wc-spartan | open | 2026-11-26 | 2027-04-18 | Sketch bar, shifted |

8 work orders, 5 work centres, all 4 statuses: open 3, in-progress 2, complete 2, blocked 1.
Two work centres hold more than one order, and no order on a centre overlaps another.

The dates straddle 2026-11, so the current day marker and the current month column cross real bars.
