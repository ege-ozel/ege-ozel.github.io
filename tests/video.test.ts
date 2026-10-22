import { describe, expect, it } from 'vitest';
import { clipArgs, gifArgs, posterArgs } from '../scripts/video.mjs';

describe('video arguments', () => {
  it('cuts a silent, fast-start H.264 clip at the requested width', () => {
    const args: string[] = clipArgs({ input: 'in.mp4', output: 'out.mp4', start: 2, duration: 8, width: 1280 });
    expect(args).toEqual(
      expect.arrayContaining(['-ss', '2', '-t', '8', '-i', 'in.mp4', '-an', '-c:v', 'libx264', '-movflags', '+faststart', '-y', 'out.mp4']),
    );
    expect(args.join(' ')).toContain('scale=1280:-2');
    expect(args.join(' ')).toContain('-pix_fmt yuv420p');
  });

  it('grabs one poster frame', () => {
    expect(posterArgs({ input: 'in.mp4', output: 'p.png', at: 1.5 })).toEqual([
      '-ss', '1.5', '-i', 'in.mp4', '-frames:v', '1', '-y', 'p.png',
    ]);
  });

  it('builds a palette GIF', () => {
    expect(gifArgs({ input: 'in.mp4', output: 'o.gif', width: 640, fps: 12 }).join(' ')).toMatch(
      /fps=12,scale=640:-1.*palettegen.*paletteuse/,
    );
  });
});
