import { hero } from '../data/hero';
import { projects } from '../data/projects';
import { createT } from '../i18n';
import { pagePath } from '../pages';
import type { Locale } from '../types';
import { ExternalLink } from './ExternalLink';
import { Shot } from './Shot';

/** The first project a visitor sees: Grocery's pitch, its links and three real screens. */
export function FeaturedHero({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const project = projects.find((p) => p.id === hero.projectId);
  const app = project?.links.find((link) => link.kind === 'app');
  const code = project?.links.find((link) => link.kind === 'code');
  const hint = `: ${project?.title ?? ''} (${t('link.newTab')})`;

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__text">
        <p className="hero__kicker">{hero.kicker[locale]}</p>
        <h2 id="hero-title" className="hero__title">
          {hero.title[locale]}
        </h2>
        <p className="hero__summary">{hero.summary[locale]}</p>
        <ul className="actions hero__actions">
          <li>
            <a className="btn btn--primary" href={pagePath('grocery', locale)}>
              {t('link.case')}
            </a>
          </li>
          {app && (
            <li>
              <ExternalLink className="btn" href={app.href} hint={hint}>
                {t('link.app')}
              </ExternalLink>
            </li>
          )}
          {code && (
            <li>
              <ExternalLink className="btn" href={code.href} hint={hint}>
                {t('link.code')}
              </ExternalLink>
            </li>
          )}
        </ul>
        {app && (
          <p className="hero__note">
            {t('link.app')}: {t('link.signIn')}
          </p>
        )}
      </div>
      <div className="hero__screens">
        {hero.shots.map((shot, i) => (
          <div key={shot.base} className={`phone phone--${i}`}>
            {/* The middle screen sits in front, so it is the one image fetched with high priority. */}
            <Shot shot={shot} locale={locale} eager priority={i === 1} />
          </div>
        ))}
      </div>
    </section>
  );
}
