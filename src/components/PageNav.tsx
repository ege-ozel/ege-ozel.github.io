import { useEffect, useState } from 'react';
import { featuredProjects } from '../data/projects';
import { profile } from '../data/profile';
import { createT, type UiKey } from '../i18n';
import type { Locale } from '../types';

/** Each link and the sections it stands for (More work belongs to Projects, Education to Experience). */
const links: { id: string; label: UiKey; covers: string[] }[] = [
  { id: 'work', label: 'nav.work', covers: ['work', 'more'] },
  { id: 'experience', label: 'nav.experience', covers: ['experience', 'education'] },
  { id: 'contact', label: 'nav.contact', covers: ['contact'] },
];

/**
 * A bar that slides in at the top once the header has scrolled away: the name takes you back to
 * the top, the links to each part of the page, and the part you are reading is marked. It moves by
 * a transform only, and is inert while hidden so the keyboard skips it.
 */
export function PageNav({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const [shown, setShown] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const header = document.getElementById('top');
    if (!header) return;
    const away = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting), { rootMargin: '-120px 0px 0px 0px' });
    away.observe(header);
    // The part being read is the one crossing the middle of the window.
    const reading = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const link = links.find((l) => l.covers.includes(entry.target.id));
          setCurrent(link ? link.id : null);
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    for (const id of ['hero', ...links.flatMap((l) => l.covers)]) {
      const section = document.getElementById(id);
      if (section) reading.observe(section);
    }
    return () => {
      away.disconnect();
      reading.disconnect();
    };
  }, []);

  return (
    <>
    <details className="wayfinder">
      <summary aria-label={t('nav.menu')} title={t('nav.menu')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M6 3.5h12v17l-6-4-6 4z" /></svg>
      </summary>
      <nav className="wayfinder__menu" aria-label={t('nav.menu')} onClick={(event) => {
        if ((event.target as HTMLElement).closest('a')) event.currentTarget.closest('details')?.removeAttribute('open');
      }}>
        <p>{t('nav.here')}: {current ? t(`nav.${current}` as UiKey) : t('nav.topLabel')}</p>
        <a href="#top">{t('nav.top')}</a>
        <a href="#hero">Grocery</a>
        <a href="#work">{t('nav.work')}</a>
        {featuredProjects.filter((project) => project.id !== 'grocery').map((project) => <a className="wayfinder__project" key={project.id} href={`#${project.id}`}>{project.title}</a>)}
        <a href="#more">{t('more.title')}</a>
        <a href="#experience">{t('nav.experience')}</a>
        <a href="#education">{t('education.title')}</a>
        <a href="#contact">{t('nav.contact')}</a>
      </nav>
    </details>
    <nav className={shown ? 'pagenav is-shown' : 'pagenav'} aria-label={t('nav.label')} inert={!shown}>
      <div className="pagenav__inner">
        <a className="pagenav__top" href="#top" aria-label={t('nav.top')}>
          <span aria-hidden="true">↑</span> {profile.name}
        </a>
        <ul className="pagenav__links">
          {links.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} aria-current={current === link.id ? 'location' : undefined}>
                {t(link.label)}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
    </>
  );
}
