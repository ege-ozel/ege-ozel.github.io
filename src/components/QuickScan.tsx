import { profile } from '../data/profile';
import { createT, localePath } from '../i18n';
import { locales, type Locale } from '../types';
import { ExternalLink } from './ExternalLink';

/** The first screen: everything a recruiter checks, before any project. */
export function QuickScan({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const newTab = ` (${t('link.newTab')})`;

  return (
    <header className="quick">
      <div className="quick__id">
        {profile.portrait ? (
          <img className="portrait" src={profile.portrait} alt="" width={64} height={64} />
        ) : (
          <div className="portrait portrait--empty" aria-hidden="true">
            {profile.initials}
          </div>
        )}
        <div className="quick__heading">
          <h1 className="quick__name">{profile.name}</h1>
          <p className="quick__role">{t('profile.role')}</p>
        </div>
        <nav className="lang" aria-label={t('lang.label')}>
          {locales.map((code) => (
            <a
              key={code}
              href={localePath(code)}
              hrefLang={code}
              lang={code}
              aria-current={code === locale ? 'page' : undefined}
            >
              {code.toUpperCase()}
            </a>
          ))}
        </nav>
      </div>

      <div className="quick__meta">
        {profile.openToWork && (
          <span className="open">
            <span className="dot" aria-hidden="true" />
            {t('profile.open')}
          </span>
        )}
        <span className="quick__location">{t('profile.location')}</span>
      </div>

      <p className="quick__tagline">{profile.tagline[locale]}</p>
      <p className="quick__intro">{profile.intro[locale]}</p>

      <dl className="stats" aria-label={t('profile.stats')}>
        {profile.stats.map((stat) => (
          <div key={stat.label.en} className="stat">
            <dt className="stat__value">{stat.value[locale]}</dt>
            <dd className="stat__label">{stat.label[locale]}</dd>
          </div>
        ))}
      </dl>

      <ul className="strengths" aria-label={t('profile.strengths')}>
        {profile.strengths.primary.map((name) => (
          <li key={name} className="strength">
            {name}
          </li>
        ))}
        {profile.strengths.secondary.map((name) => (
          <li key={name} className="strength strength--secondary">
            {name}
          </li>
        ))}
      </ul>

      <ul className="actions">
        <li>
          <a className="btn btn--primary" href={profile.publicCv[locale]} type="application/pdf">
            {t('link.cv')}
          </a>
        </li>
        <li>
          <a className="btn" href={`mailto:${profile.email}`}>
            {t('link.email')}
          </a>
        </li>
        <li>
          <ExternalLink className="btn" href={profile.linkedin} hint={newTab}>
            {t('link.linkedin')}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink className="btn" href={profile.github} hint={newTab}>
            {t('link.github')}
          </ExternalLink>
        </li>
      </ul>
    </header>
  );
}
