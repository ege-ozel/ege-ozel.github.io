/** Fixed sample meals and per-100 g food values copied from Grocery's public data on 1 Nov 2026.
 * Food amounts are raw, dry, or ready-to-eat as described in each item, not cooked weights. */
export const sampleMeals = [
  {
    "id": "tavuk-pirinc-brokoli",
    "name": {
      "tr": "Tavuklu pirinç ve brokoli",
      "en": "Chicken, rice and broccoli"
    },
    "minutes": 20,
    "items": [
      {
        "name": {
          "tr": "tavuk göğsü",
          "en": "Chicken breast"
        },
        "grams": 150,
        "preparation": "çiğ, kemiksiz yenilebilir kısım",
        "source": "USDA fdc_id 171077",
        "nutrition": {
          "kcal": 120,
          "protein": 22.5,
          "carbs": 0,
          "fat": 2.6,
          "fiber": 0
        }
      },
      {
        "name": {
          "tr": "pirinç",
          "en": "Rice"
        },
        "grams": 60,
        "preparation": "kuru",
        "source": "USDA fdc_id 169756",
        "nutrition": {
          "kcal": 365,
          "protein": 7.1,
          "carbs": 80,
          "fat": 0.7,
          "fiber": 1.3
        }
      },
      {
        "name": {
          "tr": "brokoli",
          "en": "Broccoli"
        },
        "grams": 100,
        "preparation": "yenilebilir ağırlık",
        "source": "USDA fdc_id 170379",
        "nutrition": {
          "kcal": 34,
          "protein": 2.8,
          "carbs": 6.6,
          "fat": 0.4,
          "fiber": 2.6
        }
      }
    ]
  },
  {
    "id": "somon-brokoli-zeytinyagi",
    "name": {
      "tr": "Somon ve brokoli",
      "en": "Salmon and broccoli"
    },
    "minutes": 20,
    "items": [
      {
        "name": {
          "tr": "somon",
          "en": "Salmon"
        },
        "grams": 150,
        "preparation": "çiğ, kemiksiz yenilebilir kısım",
        "source": "USDA fdc_id 173686",
        "nutrition": {
          "kcal": 142,
          "protein": 19.8,
          "carbs": 0,
          "fat": 6.3,
          "fiber": 0
        }
      },
      {
        "name": {
          "tr": "brokoli",
          "en": "Broccoli"
        },
        "grams": 100,
        "preparation": "yenilebilir ağırlık",
        "source": "USDA fdc_id 170379",
        "nutrition": {
          "kcal": 34,
          "protein": 2.8,
          "carbs": 6.6,
          "fat": 0.4,
          "fiber": 2.6
        }
      },
      {
        "name": {
          "tr": "zeytinyağı",
          "en": "Olive oil"
        },
        "grams": 10,
        "preparation": "yenilebilir ağırlık",
        "source": "USDA fdc_id 171413",
        "nutrition": {
          "kcal": 884,
          "protein": 0,
          "carbs": 0,
          "fat": 100,
          "fiber": 0
        }
      }
    ]
  },
  {
    "id": "hindi-bulgur-patlican",
    "name": {
      "tr": "Hindi ve bulgur pilavı",
      "en": "Turkey and bulgur"
    },
    "minutes": 25,
    "items": [
      {
        "name": {
          "tr": "hindi göğsü",
          "en": "Turkey breast"
        },
        "grams": 150,
        "preparation": "çiğ, kemiksiz yenilebilir kısım",
        "source": "USDA fdc_id 171098",
        "nutrition": {
          "kcal": 114,
          "protein": 23.7,
          "carbs": 0.1,
          "fat": 1.5,
          "fiber": 0
        }
      },
      {
        "name": {
          "tr": "bulgur",
          "en": "Bulgur"
        },
        "grams": 60,
        "preparation": "kuru",
        "source": "USDA fdc_id 170688",
        "nutrition": {
          "kcal": 342,
          "protein": 12.3,
          "carbs": 75.9,
          "fat": 1.3,
          "fiber": 12.5
        }
      },
      {
        "name": {
          "tr": "patlıcan",
          "en": "Aubergine"
        },
        "grams": 100,
        "preparation": "yenilebilir ağırlık",
        "source": "USDA fdc_id 169228",
        "nutrition": {
          "kcal": 25,
          "protein": 1,
          "carbs": 5.9,
          "fat": 0.2,
          "fiber": 3
        }
      }
    ]
  },
  {
    "id": "yumurta-tam-bugday-domates",
    "name": {
      "tr": "Yumurta ve tam buğday ekmeği",
      "en": "Eggs and whole-wheat bread"
    },
    "minutes": 10,
    "items": [
      {
        "name": {
          "tr": "yumurta",
          "en": "Eggs"
        },
        "grams": 100,
        "preparation": "yenilebilir ağırlık",
        "source": "USDA fdc_id 171287",
        "nutrition": {
          "kcal": 143,
          "protein": 12.6,
          "carbs": 0.7,
          "fat": 9.5,
          "fiber": 0
        }
      },
      {
        "name": {
          "tr": "tam buğday ekmeği",
          "en": "Whole-wheat bread"
        },
        "grams": 60,
        "preparation": "tüketime hazır",
        "source": "USDA fdc_id 172688",
        "nutrition": {
          "kcal": 252,
          "protein": 12.5,
          "carbs": 42.7,
          "fat": 3.5,
          "fiber": 6
        }
      },
      {
        "name": {
          "tr": "domates",
          "en": "Tomato"
        },
        "grams": 80,
        "preparation": "yenilebilir ağırlık",
        "source": "USDA fdc_id 170457",
        "nutrition": {
          "kcal": 18,
          "protein": 0.9,
          "carbs": 3.9,
          "fat": 0.2,
          "fiber": 1.2
        }
      }
    ]
  }
] as const;

export type SampleMeal = (typeof sampleMeals)[number];
export type SampleId = SampleMeal['id'];
export type SamplePlan = Partial<Record<SampleId, number>>;
export type Macro = 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber';
export const macros: readonly Macro[] = ['kcal', 'protein', 'carbs', 'fat', 'fiber'];
export function sampleTotals(plan: SamplePlan): Record<Macro, number> {
  const result = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  for (const meal of sampleMeals) for (const item of meal.items) {
    for (const key of macros) result[key] += item.nutrition[key] * item.grams / 100 * (plan[meal.id] ?? 0);
  }
  return result;
}
export function sampleShopping(plan: SamplePlan) {
  const map = new Map<string, { name: { tr: string; en: string }; grams: number; preparation: string }>();
  for (const meal of sampleMeals) for (const item of meal.items) {
    const amount = (plan[meal.id] ?? 0) * item.grams;
    if (!amount) continue;
    const old = map.get(item.name.tr);
    map.set(item.name.tr, { name: item.name, grams: (old?.grams ?? 0) + amount, preparation: item.preparation });
  }
  return [...map.values()];
}

