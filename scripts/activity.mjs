// Usage: npm run activity
// Counts my commits per week in each project's repository (sibling folders of this one) and
// writes src/data/activity.ts, which the arrangement on the home page draws. The repositories
// are not on the build server, so the counts are committed and refreshed by hand.
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const parent = resolve(root, '..');

/** Project id (as in src/data/projects.ts) → its folder, and an author filter where others committed too. */
const repos = [
  { id: 'grocery', dir: 'grocery', author: 'Ege' },
  { id: 'trackmesh', dir: 'track-mesh' },
  { id: 'metronome', dir: 'metronome' },
  { id: 'interval-timer', dir: 'interval-timer' },
  { id: 'desktuk', dir: 'desktuk' },
  { id: 'wsm', dir: 'workspace-agent-session-manager' },
  { id: 'voice-type', dir: 'voice-type' },
];

// Weeks start on Monday; the first one is the week of 4 May 2026.
const start = Date.UTC(2026, 4, 4);
const week = 7 * 24 * 3600 * 1000;
const weeks = Math.ceil((Date.now() - start) / week);

const lanes = repos.map(({ id, dir, author }) => {
  const path = join(parent, dir);
  if (!existsSync(join(path, '.git'))) throw new Error(`${dir}: no repository at ${path}`);
  const args = ['-C', path, 'log', '--all', '--format=%at'];
  if (author) args.push(`--author=${author}`);
  const times = execFileSync('git', args, { encoding: 'utf8' }).trim().split('\n').filter(Boolean).map(Number);
  const counts = Array(weeks).fill(0);
  for (const t of times) {
    const i = Math.floor((t * 1000 - start) / week);
    if (i >= 0 && i < weeks) counts[i]++;
  }
  return { id, counts };
});

const today = new Date().toISOString().slice(0, 10);
const body = `// Written by scripts/activity.mjs on ${today}: my commits per week, from the week of 4 May 2026.
// Do not edit by hand; run \`npm run activity\` instead.

export interface Activity {
  /** Project id, as in projects.ts. */
  id: string;
  /** Commits per week, oldest first. */
  counts: number[];
}

/** Monday of the first week, UTC. */
export const activityStart = '2026-05-04';

/** The day the counts were taken; the playhead stands here. */
export const activityTaken = '${today}';

export const activity: Activity[] = [
${lanes.map((lane) => `  { id: '${lane.id}', counts: [${lane.counts.join(', ')}] },`).join('\n')}
];
`;
writeFileSync(join(root, 'src/data/activity.ts'), body);
console.log(`activity: ${weeks} weeks, ${lanes.map((l) => `${l.id} ${l.counts.reduce((a, b) => a + b, 0)}`).join(', ')}`);
