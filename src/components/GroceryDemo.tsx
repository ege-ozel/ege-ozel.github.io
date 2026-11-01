import { useEffect, useState } from 'react';
import type { Locale } from '../types';

/** A small, local-only illustration of the flow, with figures from the recorded sample screen. */
export function GroceryDemo({ locale }: { locale: Locale }) {
  const [added, setAdded] = useState(false);
  const tr = locale === 'tr';
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
  return (
    <details className="grocery-demo" id="grocery-demo">
      <summary>{tr ? 'Girişsiz örnek demoyu aç' : 'Open the sample demo'}</summary>
      <div className="grocery-demo__body">
        <div>
          <h2>{tr ? 'Bugün ne pişirsem?' : 'What shall I cook today?'}</h2>
          <p>{tr ? 'Örnek bir öğünü plana ekleyerek akışı deneyin.' : 'Add a sample meal to the plan to try the flow.'}</p>
          <p className="grocery-demo__note">{tr ? 'Bu, örnek verilerle hazırlanmış küçük bir portfolyo demosudur. Gerçek uygulamanın öneri motorunu çalıştırmaz; veriler kaydedilmez.' : 'This small portfolio demo uses sample data. It does not run the app’s recommendation engine or save data.'}</p>
        </div>
        <div className="grocery-demo__meal">
          <strong>{tr ? 'Dana kıyma ve pirinç' : 'Ground beef and rice'}</strong>
          <span>763 kcal · 29 g {tr ? 'protein' : 'protein'}</span>
          <button className="btn btn--primary" type="button" onClick={() => setAdded(!added)}>
            {added ? (tr ? 'Plandan çıkar' : 'Remove from plan') : (tr ? 'Plana ekle' : 'Add to plan')}
          </button>
        </div>
        <div className="grocery-demo__plan" aria-live="polite">
          <strong>{tr ? 'Örnek plan' : 'Sample plan'}</strong>
          <p>{added ? (tr ? 'Dana kıyma ve pirinç eklendi.' : 'Ground beef and rice added.') : (tr ? 'Henüz öğün eklenmedi.' : 'No meal added yet.')}</p>
          <p><b>{added ? '763' : '0'}</b> kcal · <b>{added ? '29' : '0'} g</b> {tr ? 'protein' : 'protein'}</p>
        </div>
      </div>
    </details>
  );
}
