// Written by scripts/activity.mjs on 2026-10-30: my commits per week, from the week of 4 May 2026.
// Do not edit by hand; run `npm run activity` instead.

export interface Activity {
  /** Project id, as in projects.ts. */
  id: string;
  /** Commits per week, oldest first. */
  counts: number[];
}

/** Monday of the first week, UTC. */
export const activityStart = '2026-05-04';

/** The day the counts were taken; the playhead stands here. */
export const activityTaken = '2026-10-30';

export const activity: Activity[] = [
  { id: 'grocery', counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 64, 34, 56, 159, 73, 39, 0, 0, 0, 0, 5] },
  { id: 'trackmesh', counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 36, 175, 46, 0] },
  { id: 'metronome', counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 73, 302, 26, 9, 19, 0] },
  { id: 'interval-timer', counts: [0, 0, 3, 0, 0, 0, 2, 4, 5, 65, 22, 42, 42, 2, 52, 9, 0, 22, 0, 0, 0, 0, 1, 0, 22, 0] },
  { id: 'desktuk', counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 73, 39, 1] },
  { id: 'wsm', counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 0, 35] },
  { id: 'voice-type', counts: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 2] },
];
