# Herdr runbook

The orchestrator runs inside a Herdr pane (`HERDR_ENV=1`). An agent outside Herdr cannot
inspect or control the session, so every command below must run from a Herdr pane.

## Topology

```
workspace wo-build
  tab build      pane 1 orchestrator
  tab build      pane 2 builder-a     (pane split down)
  tab verify     pane 3 verifier      (pane split right)
```

Same repo and same working directory for all agents. Split only when two agents would
edit the same files; otherwise one builder at a time keeps merges trivial.

## Commands

```bash
# layout
herdr workspace create wo-build
herdr tab create --workspace "$HERDR_WORKSPACE_ID" --name build
herdr pane split --current --direction down --cwd "$PWD" --no-focus
herdr pane split --current --direction right --cwd "$PWD" --no-focus

# agents (kind list: herdr agent)
herdr agent start builder-a --kind pi --pane <pane-id>
herdr agent start verifier  --kind pi --pane <pane-id>

# work
herdr agent prompt builder-a "<prompt from AGENT-PROMPTS.md>" --wait --timeout 600000
herdr agent read builder-a --source recent-unwrapped --lines 200

# ordinary commands in another pane
herdr pane run <pane-id> "npx playwright test"
herdr pane wait-output <pane-id> --match "passed" --timeout 300000
```

Keep `--no-focus` on splits so the human keeps their focus in the orchestrator pane.

## Rules

- One agent per item group. Two agents editing one file means silent overwrites.
- After every wave: `herdr agent prompt verifier "..." --wait`, then read
  `docs/requirements/acceptance-criteria.json` for the pass and fail counts.
- `blocked` state means an approval or question dialog. Inspect with
  `herdr agent get <name>` and `herdr agent read <name>`; ask the human before answering.
- A timeout is not proof that nothing was delivered. Read the pane before re-prompting.
- Do not close panes, tabs or workspaces that were not created here.
- Do not run `herdr server stop` from inside the session.

## Wiring the harness into the loop

The verifier agent owns `docs/requirements/measurements.json` and the Playwright suite.
The orchestrator only reads the checklist. Status changes come from:

```bash
node docs/requirements/verify.mjs      # playwright + unit results -> acceptance-criteria.json
node docs/requirements/measure.mjs     # rendered DOM vs tokens.json -> acceptance-criteria.json
node docs/requirements/render.mjs      # json -> acceptance-criteria.md
```

Both scripts run from the repo root and need the app on `http://localhost:4200`
(`npm start` in a pane, or `npx playwright test` with the webServer config).
