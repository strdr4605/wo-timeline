#!/usr/bin/env node
// Render acceptance-criteria.json into a Markdown checklist.
// Usage: node docs/requirements/render.mjs
// The JSON is the source of truth. Agents update the JSON, not this file.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, 'acceptance-criteria.json'), 'utf8'));

const mark = { pass: 'x', fail: ' ', 'open-decision': '?', pending: ' ' };
const groups = [...new Set(data.items.map((i) => i.group))];
const count = (s) => data.items.filter((i) => i.status === s).length;

let md = `# Acceptance criteria

${data.meta.task}. Generated from \`acceptance-criteria.json\` - edit the JSON, then run \`node docs/requirements/render.mjs\`.

Progress: ${count('pass')} pass, ${count('fail')} fail, ${count('open-decision')} open decision, ${count('pending')} pending.

Legend: \`[x]\` pass, \`[ ]\` pending, \`[?]\` open decision. An item may only be marked pass with an evidence command (test name, screenshot path or measurement output) in the JSON \`evidence\` field.

`;

for (const g of groups) {
  md += `## ${g}\n\n`;
  md += '| | id | requirement | source | verify | priority | evidence |\n|---|---|---|---|---|---|---|\n';
  for (const i of data.items.filter((x) => x.group === g)) {
    md += `| [${mark[i.status] ?? ' '}] | ${i.id} | ${i.requirement} | ${i.source.join(', ')} | ${i.verify} | ${i.priority} | ${i.evidence || ''} |\n`;
  }
  md += '\n';
}

md += '## Sources\n\n';
for (const [k, v] of Object.entries(data.meta.sources)) md += `- **${k}**: ${v}\n`;
md += '\n## Verification kinds\n\n';
for (const [k, v] of Object.entries(data.meta.verifyKinds)) md += `- **${k}**: ${v}\n`;

writeFileSync(join(here, 'acceptance-criteria.md'), md);
console.log(`wrote ${join(here, 'acceptance-criteria.md')}`);
