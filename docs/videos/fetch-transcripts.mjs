import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = '/Users/strdr4605/P/interviews/2026-11-08-naologic/docs/videos';
mkdirSync(OUT, { recursive: true });

const run = (id, code) => {
  const raw = execFileSync('surf', ['js', '--tab-id', String(id), code], { encoding: 'utf8' });
  // surf prints the "[surf tab=...]" header on stderr; stdout is the JSON payload.
  const start = Math.min(...['[', '{'].map((c) => { const k = raw.indexOf(c); return k < 0 ? Infinity : k; }));
  return JSON.parse(raw.slice(start));
};

const drive = (id) => {
  const r = run(id, 'const els=[...document.querySelectorAll("[aria-label^=\\"Segment starting at\\"]")]; return els.map(e=>e.getAttribute("aria-label"));');
  return r.map((label) => {
    const m = label.match(/^Segment starting at (\d+:\d+), (.*)$/s);
    return { time: m[1], text: m[2].trim() };
  });
};

const loom = (id) => {
  const r = run(id, 'const rows=[...document.querySelectorAll(".phrase-list-item_row_wAH")]; return rows.map(x=>x.innerText.replace(/\\n/g," ").replace(/\\s+/g," ").trim());');
  return r.map((s) => {
    const i = s.indexOf(' ');
    return { time: s.slice(0, i), text: s.slice(i + 1).trim() };
  });
};

const write = (name, title, source, url, segments) => {
  const body = segments.map((s) => `**${s.time}**  ${s.text}`).join('\n\n');
  writeFileSync(`${OUT}/${name}.md`, `# ${title}\n\n- Source: ${source}\n- URL: ${url}\n- Transcript pulled: ${new Date().toISOString().slice(0, 10)}\n\n---\n\n${body}\n`);
  console.log(`${name}.md  (${segments.length} segments)`);
};

write(
  'fe-kickoff-and-handover',
  'FE Kickoff and Handover (Naologic, task owner)',
  'Google Drive video transcript',
  'https://drive.google.com/file/d/1rl3LHBytdvZ_pXNw6s-0tRZeCxEdwV8v/view',
  drive(155632632)
);

write(
  'naologic-company-intro',
  'Naologic Company Intro (recruitment)',
  'Google Drive video transcript',
  'https://drive.google.com/file/d/178wnbuvdAFtG0g1lu_4Fq7IUe7vR1HnN/view',
  drive(155632633)
);

write(
  'backend-challenge-erp-scheduling-context',
  'Gemini ERP Expert: work orders / scheduling explainer (task owner demo)',
  'Loom video transcript',
  'https://www.loom.com/share/d1dcfb7aa72e45aaae294985e68d2a5f',
  loom(155632624)
);
