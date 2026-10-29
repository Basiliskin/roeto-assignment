// Builds docs/diagrams/index.html from the numbered .md files next to it (the single source).
// Usage: npm run docs:diagrams
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const dir = dirname(fileURLToPath(import.meta.url));
const pages = readdirSync(dir)
  .filter((f) => /^\d\d-.+\.md$/.test(f))
  .sort()
  .map((file) => ({ file, markdown: readFileSync(join(dir, file), 'utf8') }));

const template = readFileSync(join(dir, 'index.template.html'), 'utf8');
// JSON inside <script>: escape "<" so a "</script>" in the markdown cannot close the tag.
const data = JSON.stringify(pages).replace(/</g, '\\u003c');
writeFileSync(join(dir, 'index.html'), template.replace('/*PAGES*/[]', data));
process.stdout.write(`index.html built from ${pages.length} files\n`);
