import { describe, expect, it } from 'vitest';
import { heroOrientation } from '../src/hero';

describe('heroOrientation', () => {
  it('uses the portrait film only on tall screens', () => {
    expect(heroOrientation(390, 844)).toBe('portrait');
    expect(heroOrientation(1440, 900)).toBe('landscape');
    expect(heroOrientation(800, 800)).toBe('landscape');
  });
});
