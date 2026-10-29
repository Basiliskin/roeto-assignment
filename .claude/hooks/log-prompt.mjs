#!/usr/bin/env node
// UserPromptSubmit hook: appends every user prompt, timestamped, to docs/ai-log/PROMPTS.md.
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

let raw = '';
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  const { prompt = '' } = JSON.parse(raw || '{}');
  const skill = prompt.match(/^\/([\w:-]+)/)?.[1] ?? 'chat';
  const dir = join(process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), 'docs', 'ai-log');
  mkdirSync(dir, { recursive: true });
  const quoted = prompt.trim().split('\n').map((line) => `> ${line}`).join('\n');
  appendFileSync(join(dir, 'PROMPTS.md'), `\n### ${new Date().toISOString()} : ${skill}\n\n${quoted}\n`);
});
