import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const root = join(__dirname, '..', '..');
const tokens = JSON.parse(readFileSync(join(root, 'src/styles/tokens.json'), 'utf8'));
const scss = readFileSync(join(root, 'src/styles/_tokens.scss'), 'utf8');

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// The font files and the CDN url are assets, not style values.
const SKIP = new Set(['typography.fontFiles', 'typography.cdn']);

// The token file names the font, not its CSS weight. Circular Std ships these weights.
const FONT_WEIGHT: Record<string, number> = { book: 400, regular: 400, medium: 500, bold: 700 };

const nameFor = (path: string[]): string => {
  const [group, ...rest] = path;
  const tail = rest.filter((p) => p !== 'styles').map(kebab);
  if (group === 'colors') return ['color', ...tail].join('-');
  if (group === 'typography') {
    return path[1] === 'fontFamily' ? 'font-family' : ['type', ...tail].join('-');
  }
  if (group === 'radii') return ['radius', ...tail].join('-');
  if (group === 'layout') return ['layout', ...tail].join('-');
  return ['component', ...tail].join('-');
};

const valueFor = (value: unknown, path: string[]): string => {
  const key = path[path.length - 1];
  if (typeof value === 'number') {
    return /alpha/i.test(key) ? String(value) : `${value}px`;
  }
  const text = String(value);
  return text.startsWith('#') ? text : `"${text}"`;
};

type Entry = { name: string; value: string };

const walk = (value: unknown, path: string[], out: Entry[]) => {
  if (SKIP.has(path.join('.'))) return;
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      walk(child, [...path, key], out);
    }
    return;
  }
  out.push({ name: nameFor(path), value: valueFor(value, path) });
  if (path[0] === 'typography' && path[path.length - 1] === 'font') {
    const weight = FONT_WEIGHT[String(value).toLowerCase()];
    if (weight) out.push({ name: `${nameFor(path)}-weight`, value: String(weight) });
  }
};

const expected: Entry[] = [];
walk(tokens.colors, ['colors'], expected);
walk(tokens.typography, ['typography'], expected);
walk(tokens.radii, ['radii'], expected);
walk(tokens.layout, ['layout'], expected);
walk(tokens.components, ['components'], expected);

const declared = new Map<string, string>();
for (const line of scss.split('\n')) {
  const match = line.match(/^\$([\w-]+):\s*(.+);$/);
  if (match) declared.set(match[1], match[2].trim());
}

const appStyles = (dir: string): string[] => {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...appStyles(path));
    else if (entry.name.endsWith('.scss') && entry.name !== '_tokens.scss') files.push(path);
  }
  return files;
};

describe('design tokens', () => {
  test('[G1] the app styles use no colour or size that the token file does not hold', () => {
    const tokenValues = new Set(expected.map((e) => e.value.replace(/"/g, '')));

    const literals = appStyles(join(root, 'src'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n')
      .match(/#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?px\b/g) ?? [];

    expect(literals.filter((literal) => !tokenValues.has(literal))).toEqual([]);
  });

  test('[G1] every SCSS token variable matches tokens.json', () => {
    for (const { name, value } of expected) {
      expect(declared.get(name), `$${name} is missing or wrong in src/styles/_tokens.scss`).toBe(value);
    }

    // No variable may exist that the token file does not describe.
    const expectedNames = new Set(expected.map((e) => e.name));
    expect([...declared.keys()].filter((n) => !expectedNames.has(n))).toEqual([]);
  });

  test('[G5] type scale matches the token file', () => {
    expect(declared.get('font-family')).toBe(`"${tokens.typography.fontFamily}"`);

    for (const [style, spec] of Object.entries(tokens.typography.styles)) {
      const name = kebab(style);
      expect(declared.get(`type-${name}-size`), `type-${name}-size`).toBe(`${spec.size}px`);
      expect(declared.get(`type-${name}-font`), `type-${name}-font`).toBe(`"${spec.font}"`);
      expect(declared.get(`type-${name}-color`), `type-${name}-color`).toBe(spec.color);
      if (spec.lineHeight !== undefined) {
        expect(declared.get(`type-${name}-line-height`), `type-${name}-line-height`).toBe(
          `${spec.lineHeight}px`,
        );
      }
    }

    // The three sizes the acceptance item names.
    expect(declared.get('type-body-size')).toBe('14px');
    expect(declared.get('type-body-font')).toBe('"Book"');
    expect(declared.get('type-panel-title-size')).toBe('20px');
    expect(declared.get('type-panel-title-font')).toBe('"Medium"');
    expect(declared.get('type-chip-label-size')).toBe('13px');
    expect(declared.get('type-chip-value-size')).toBe('13px');
  });
});
