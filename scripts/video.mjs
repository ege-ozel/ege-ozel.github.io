// ffmpeg argument builders for preview clips, poster frames and README GIFs.
// Pure functions so the encoding settings are unit-tested; build-video.mjs runs them.

/** Silent H.264 clip that starts playing before it has fully downloaded. */
export function clipArgs({ input, output, start, duration, width }) {
  return [
    '-ss', String(start),
    '-t', String(duration),
    '-i', input,
    '-an',
    '-vf', `scale=${width}:-2`,
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '28',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-y', output,
  ];
}

/** One frame as an image, for the poster pipeline in build-media.mjs. */
export function posterArgs({ input, output, at }) {
  return ['-ss', String(at), '-i', input, '-frames:v', '1', '-y', output];
}

/** Looping GIF with a palette built from the clip itself. */
export function gifArgs({ input, output, width, fps }) {
  return [
    '-i', input,
    '-filter_complex', `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse`,
    '-loop', '0',
    '-y', output,
  ];
}
