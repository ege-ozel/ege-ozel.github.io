/** Tall screens get the 9:16 film, everything else the 16:9 one. */
export function heroOrientation(width: number, height: number): 'landscape' | 'portrait' {
  return height > width ? 'portrait' : 'landscape';
}
