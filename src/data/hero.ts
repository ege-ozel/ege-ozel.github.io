import type { Hero } from '../types';

/** Grocery leads the portfolio: a short pitch next to three real screens (sample household data). */
export const hero: Hero = {
  projectId: 'grocery',
  title: { en: 'Grocery', tr: 'Grocery' },
  summary: {
    en: 'A full-stack app for Turkish households: decide what to cook, plan meals around nutrition goals and keep one shared shopping list in sync. Live, built with a co-developer, with nutrition logic traced back to textbooks.',
    tr: 'Türkiye’deki hanelerin ne pişireceğine karar vermesine, öğünleri beslenme hedeflerine göre planlamasına ve ortak alışveriş listesini güncel tutmasına yardımcı olan bir uygulama. Bir ortak geliştiriciyle hazırladık; uygulama yayında ve beslenme kuralları ders kitaplarına dayanıyor.',
  },
  shots: [
    {
      base: '/media/grocery-case/list',
      alt: {
        en: 'Grocery shopping list on a phone: items filed under fruit and vegetables, dairy, eggs and poultry.',
        tr: 'Telefonda Grocery alışveriş listesi: ürünler meyve ve sebze, süt ürünleri, yumurta ve kanatlı reyonlarına ayrılmış.',
      },
    },
    {
      base: '/media/grocery-case/plan',
      alt: {
        en: 'Grocery meal plan for Friday 23 October: daily totals for calories, protein, carbs, fat and fibre above the first meal.',
        tr: '23 Ekim Cuma için Grocery yemek planı: ilk öğünün üstünde kalori, protein, karbonhidrat, yağ ve lif günlük toplamları.',
      },
    },
    {
      base: '/media/grocery-case/suggestions',
      alt: {
        en: 'Grocery evening suggestions: minced beef with rice, 763 kcal and 29 g protein, with buttons to add it to the list or the plan.',
        tr: 'Grocery akşam önerileri: dana kıyma ve pirinç, 763 kcal ve 29 g protein; listeye ya da plana ekleme düğmeleriyle.',
      },
    },
  ],
};
