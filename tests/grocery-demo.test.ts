import { describe, expect, it } from 'vitest';
import { sampleShopping, sampleTotals } from '../src/data/groceryDemo';

describe('sample meal plan', () => {
  it('adds per-100g nutrition values across portions', () => {
    const totals = sampleTotals({ 'tavuk-pirinc-brokoli': 2 });
    expect(totals.kcal).toBeCloseTo(866);
    expect(totals.protein).toBeCloseTo(81.62);
    expect(sampleTotals({}).kcal).toBe(0);
  });
  it('combines shared ingredients and accounts for servings', () => {
    const list = sampleShopping({ 'tavuk-pirinc-brokoli': 2, 'somon-brokoli-zeytinyagi': 1 });
    expect(list.find((item) => item.name.tr === 'brokoli')?.grams).toBe(300);
    expect(list.find((item) => item.name.tr === 'pirinç')?.grams).toBe(120);
    expect(sampleShopping({})).toEqual([]);
  });
});
