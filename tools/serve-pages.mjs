#!/usr/bin/env node
// Serves a built Pages folder the way GitHub Pages serves a project site: the folder is at
// /<base>/, a folder path serves its index.html, and an unknown path gets 404.html with status
// 404. The e2e job uses it to test the production build, not the dev server.
//
// Usage: node tools/serve-pages.mjs <folder> [--base=/wo-timeline/] [--port=4300]

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const args = process.argv.slice(2);
const root = resolve(args.find((a) => !a.startsWith('--')) ?? 'dist/pages');
const base = option('base', '/wo-timeline/');
const port = Number(option('port', '4300'));

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
};

createServer((request, response) => {
  const path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);

  // GitHub Pages adds the trailing slash to the site root.
  if (path === base.slice(0, -1)) return response.writeHead(301, { location: base }).end();

  const file = fileFor(path);

  if (file) return send(response, 200, file);

  const notFound = join(root, '404.html');
  if (existsSync(notFound)) return send(response, 404, notFound);

  response.writeHead(404).end('Not found');
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}${base}`));

/** The file for a request path, or undefined when the path is outside the site or missing. */
function fileFor(path) {
  if (!path.startsWith(base)) return undefined;

  const file = normalize(join(root, path.slice(base.length)));
  if (!file.startsWith(root)) return undefined;
  if (!existsSync(file)) return undefined;
  if (statSync(file).isFile()) return file;

  const index = join(file, 'index.html');
  return existsSync(index) ? index : undefined;
}

function send(response, status, file) {
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  response.writeHead(status, { 'content-type': type });
  createReadStream(file).pipe(response);
}

function option(name, fallback) {
  const prefix = `--${name}=`;
  return args.find((a) => a.startsWith(prefix))?.slice(prefix.length) ?? fallback;
}
