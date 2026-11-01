import { useEffect, useState } from 'react';
import { macros, sampleMeals, sampleShopping, sampleTotals, type Macro, type SampleId, type SamplePlan } from '../data/groceryDemo';
import type { Locale } from '../types';

type View = 'meals' | 'plan' | 'shopping';

export function GroceryDemo({ locale }: { locale: Locale }) {
  const [plan, setPlan] = useState<SamplePlan>({});
  const [view, setView] = useState<View>('meals');
  const [checked, setChecked] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const tr = locale === 'tr';
  const labels: Record<Macro, string> = { kcal: tr ? 'Enerji' : 'Energy', protein: tr ? 'Protein' : 'Protein', carbs: tr ? 'Karbonhidrat' : 'Carbs', fat: tr ? 'Yağ' : 'Fat', fiber: tr ? 'Lif' : 'Fibre' };
  const totals = sampleTotals(plan);
  const shopping = sampleShopping(plan);
  const count = Object.values(plan).reduce((sum, quantity) => sum + (quantity ?? 0), 0);
  useEffect(() => {
    const openFromHash = () => {
      if (location.hash === '#grocery-demo') {
        const panel = document.getElementById('grocery-demo');
        if (panel instanceof HTMLDetailsElement) panel.open = true;
      }
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);
  const change = (id: SampleId, amount: number) => {
    setPlan((old) => ({ ...old, [id]: Math.max(0, Math.min(10, (old[id] ?? 0) + amount)) }));
    setChecked([]);
  };
  const add = (id: SampleId, name: string) => {
    change(id, 1);
    setNotice(tr ? `${name} plana eklendi.` : `${name} added to the plan.`);
  };
  const reset = () => { setPlan({}); setChecked([]); setNotice(tr ? 'Örnek sıfırlandı.' : 'Sample reset.'); setView('meals'); };
  const number = (value: number, key: Macro) => key === 'kcal' ? String(Math.round(value)) : value.toLocaleString(locale, { maximumFractionDigits: 1 });
  const nav: { id: View; label: string }[] = [
    { id: 'meals', label: tr ? 'Yemekler' : 'Meals' },
    { id: 'plan', label: tr ? 'Yemek planı' : 'Meal plan' },
    { id: 'shopping', label: tr ? 'Alışveriş' : 'Shopping' },
  ];
  return (
    <details className="grocery-demo" id="grocery-demo">
      <summary>{tr ? 'Girişsiz örnek demoyu aç' : 'Open the sample demo'}</summary>
      <div className="grocery-demo__body">
        <header className="demo-intro">
          <h2>{tr ? 'Bugün ne pişirsem?' : 'What shall I cook today?'}</h2>
          <p>{tr ? 'Örnek yemekleri plana ekleyin, toplamları görün ve alışveriş listenizi hazırlayın.' : 'Add sample meals, see the totals and prepare a shopping list.'}</p>
          <p className="demo-note">{tr ? 'Portfolyo için hazırlanmış girişsiz örnek: gerçek uygulamanın öneri motorunu ve eşitlemesini çalıştırmaz. Veriler bu sayfada geçicidir ve kişisel beslenme önerisi değildir.' : 'A sign-in-free portfolio sample: it does not run the app’s recommendation engine or sync. Data is temporary and is not personalised nutrition advice.'}</p>
        </header>
        <nav className="demo-nav" aria-label={tr ? 'Örnek demo bölümleri' : 'Sample demo sections'}>
          {nav.map((item) => <button type="button" key={item.id} aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.label}{item.id === 'plan' && count > 0 ? ` (${count})` : ''}</button>)}
        </nav>
        <p className="sr-only" aria-live="polite">{notice}</p>
        {view === 'meals' && <section aria-labelledby="demo-meals-title">
          <div className="demo-heading"><h3 id="demo-meals-title">{tr ? 'Örnek yemekler' : 'Sample meals'}</h3><span>{tr ? 'Birini seçip plana ekleyin' : 'Pick one to add to your plan'}</span></div>
          <div className="demo-meals">
            {sampleMeals.map((meal) => {
              const mealTotal = sampleTotals({ [meal.id]: 1 });
              return <article className="demo-meal" key={meal.id}>
                <div className="demo-meal__top"><h4>{meal.name[locale]}</h4><span>{meal.minutes} {tr ? 'dk' : 'min'}</span></div>
                <p>{meal.items.map((item) => item.name[locale]).join(' · ')}</p>
                <p className="demo-meal__macros">{number(mealTotal.kcal, 'kcal')} kcal · {number(mealTotal.protein, 'protein')} g {tr ? 'protein' : 'protein'}</p>
                <button type="button" className="btn btn--small" disabled={(plan[meal.id] ?? 0) >= 10} onClick={() => add(meal.id, meal.name[locale])}>{tr ? 'Plana ekle' : 'Add to plan'}</button>
              </article>;
            })}
          </div>
          <button type="button" className="btn demo-next" onClick={() => setView('plan')}>{tr ? 'Yemek planını gör' : 'View meal plan'} →</button>
        </section>}
        {view === 'plan' && <section aria-labelledby="demo-plan-title">
          <div className="demo-heading"><h3 id="demo-plan-title">{tr ? 'Örnek gün planı' : 'Sample day plan'}</h3><span>{tr ? 'Hedefler kişiselleştirilmez' : 'Targets are not personalised'}</span></div>
          <div className="demo-totals">{macros.map((key) => <div key={key}><span>{labels[key]}</span><strong>{number(totals[key], key)} <small>{key === 'kcal' ? 'kcal' : 'g'}</small></strong></div>)}</div>
          {count === 0 ? <p className="demo-empty">{tr ? 'Henüz öğün eklenmedi. Yemekler bölümünden bir seçim yapın.' : 'No meals yet. Pick one from the meals section.'}</p> : <ul className="demo-plan">
            {sampleMeals.filter((meal) => (plan[meal.id] ?? 0) > 0).map((meal) => <li key={meal.id}><div><strong>{meal.name[locale]}</strong><p>{tr ? 'Porsiyon' : 'Servings'}: {plan[meal.id]}</p></div><div className="demo-stepper"><button type="button" aria-label={`${meal.name[locale]} ${tr ? 'porsiyon azalt' : 'remove one serving'}`} onClick={() => change(meal.id, -1)}>−</button><span>{plan[meal.id]}</span><button type="button" aria-label={`${meal.name[locale]} ${tr ? 'porsiyon artır' : 'add one serving'}`} disabled={(plan[meal.id] ?? 0) >= 10} onClick={() => change(meal.id, 1)}>+</button></div></li>)}
          </ul>}
          <div className="demo-actions"><button type="button" className="btn" onClick={() => setView('meals')}>{tr ? 'Yemek ekle' : 'Add meals'}</button><button type="button" className="btn btn--primary" onClick={() => setView('shopping')}>{tr ? 'Alışveriş listesini gör' : 'View shopping list'} →</button></div>
        </section>}
        {view === 'shopping' && <section aria-labelledby="demo-shopping-title">
          <div className="demo-heading"><h3 id="demo-shopping-title">{tr ? 'Örnek alışveriş listesi' : 'Sample shopping list'}</h3><span>{tr ? 'Plandaki malzemeler birleştirilir' : 'Ingredients are combined from your plan'}</span></div>
          {shopping.length === 0 ? <p className="demo-empty">{tr ? 'Liste boş. Önce yemek planına bir öğün ekleyin.' : 'The list is empty. Add a meal to your plan first.'}</p> : <ul className="demo-shopping">{shopping.map((item) => <li key={item.name.tr}><label><input type="checkbox" checked={checked.includes(item.name.tr)} onChange={() => setChecked((old) => old.includes(item.name.tr) ? old.filter((name) => name !== item.name.tr) : [...old, item.name.tr])} /><span>{item.name[locale]}<small>{tr ? item.preparation : 'See preparation note below'}</small></span><strong>{item.grams} g</strong></label></li>)}</ul>}
          <p className="demo-note">{tr ? 'Gramajlar kaynak veride belirtildiği gibi çiğ, kuru veya tüketime hazır olabilir. Besin değerleri yaklaşık olup Grocery’nin örnek kataloğundan hesaplanır.' : 'Weights may be raw, dry or ready-to-eat as in the source data. Nutrition totals are approximate and calculated from Grocery’s sample catalog.'}</p>
          <button type="button" className="btn demo-next" onClick={() => setView('plan')}>← {tr ? 'Yemek planına dön' : 'Back to meal plan'}</button>
        </section>}
        <div className="demo-footer"><a href="https://github.com/ozan-ozel/grocery/blob/master/data/nutrition.json" target="_blank" rel="noopener noreferrer">{tr ? 'Örnek besin verilerinin kaynağı' : 'Sample nutrition data source'} ↗</a><button type="button" onClick={reset}>{tr ? 'Örneği sıfırla' : 'Reset sample'}</button></div>
      </div>
    </details>
  );
}
