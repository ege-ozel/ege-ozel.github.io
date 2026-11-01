import { useEffect, useRef, useState } from 'react';
import { featuredProjects, moreProjects } from '../data/projects';
import { createT } from '../i18n';
import type { Locale } from '../types';

/** A compact, persistent map of the portfolio and its projects. */
export function PageNav({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const menu = useRef<HTMLDetailsElement>(null);
  const [current, setCurrent] = useState('top');

  useEffect(() => {
    const ids = ['top', 'hero', 'work', ...featuredProjects.map((p) => p.id), 'activity', 'more', ...moreProjects.map((p) => p.id), 'experience', 'education', 'contact'];
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = Math.min(window.innerHeight * 0.32, 220);
      let active = 'top';
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= marker) active = el.id;
      }
      setCurrent(active);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const dismiss = (event: PointerEvent) => {
      if (menu.current?.open && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector('summary')?.focus();
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, []);

  const item = (id: string, label: string, nested = false) => (
    <a href={`#${id}`} className={nested ? 'wayfinder__project' : undefined} aria-current={current === id ? 'location' : undefined}>
      <span aria-hidden="true" className="wayfinder__pin">{nested ? '·' : '•'}</span>{label}
    </a>
  );

  return (
    <details className="wayfinder" ref={menu}>
      <summary aria-label={t('nav.menu')} title={t('nav.menu')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 6h16M4 12h12M4 18h8" strokeLinecap="round" /></svg>
      </summary>
      <nav className="wayfinder__menu" aria-label={t('nav.menu')} onClick={(event) => {
        if ((event.target as HTMLElement).closest('a') && menu.current) menu.current.open = false;
      }}>
        {item('top', t('nav.top'))}
        {item('hero', 'Grocery')}
        <details className="wayfinder__group" open>
          <summary className={current === 'work' || featuredProjects.some((p) => p.id === current) ? 'is-current' : undefined}>{t('work.title')}</summary>
          {item('work', t('nav.overview'), true)}
          {featuredProjects.map((p) => <span key={p.id}>{item(p.id, p.title, true)}</span>)}
        </details>
        {item('activity', t('arr.title'))}
        <details className="wayfinder__group" open>
          <summary className={current === 'more' || moreProjects.some((p) => p.id === current) ? 'is-current' : undefined}>{t('more.title')}</summary>
          {item('more', t('nav.overview'), true)}
          {moreProjects.map((p) => <span key={p.id}>{item(p.id, p.title, true)}</span>)}
        </details>
        {item('experience', t('nav.experience'))}
        {item('education', t('education.title'))}
        {item('contact', t('nav.contact'))}
      </nav>
    </details>
  );
}
