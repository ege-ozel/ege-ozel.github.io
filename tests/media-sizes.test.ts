import { describe, expect, it } from 'vitest';
import { posterPlan } from '../scripts/media-sizes.mjs';

describe('posterPlan', () => {
  it('keeps the existing desktop and phone screenshot sizes', () => {
    expect(posterPlan('woodcraft.png')).toEqual({ id: 'woodcraft', widths: [800, 1600], ratio: 10 / 16 });
    expect(posterPlan('grocery.mobile.png')).toEqual({ id: 'grocery', widths: [400, 800], ratio: 19.5 / 9 });
  });

  it('cuts film frames to the film shape so the poster does not jump when the video starts', () => {
    expect(posterPlan('hero.wide.png')).toEqual({ id: 'hero', widths: [800, 1600], ratio: 9 / 16 });
    expect(posterPlan('hero-mobile.tall.png')).toEqual({ id: 'hero-mobile', widths: [400, 800], ratio: 16 / 9 });
  });

  it('ignores files that are not images', () => {
    expect(posterPlan('notes.txt')).toBeNull();
  });
});
