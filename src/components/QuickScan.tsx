import { profile } from '../data/profile';
import { createT, localePath } from '../i18n';
import { locales, type Locale } from '../types';
import { CopyEmail } from './CopyEmail';
import { useLightbox } from '../lightbox';
import { ExternalLink } from './ExternalLink';
import { ThemeSwitch } from './ThemeSwitch';
import { kinds, type Kind } from './Arrangement';

/**
 * The first screen: who I am and what I build. The three words are also a filter: each dims the
 * projects in the arrangement below that do not run there.
 */
export function QuickScan({ locale, kind, setKind }: { locale: Locale; kind: Kind | null; setKind: (kind: Kind | null) => void }) {
  const t = createT(locale);
  const newTab = ` (${t('link.newTab')})`;
  const openLightbox = useLightbox();

  return (
    <header id="top" className="quick">
      <div className="quick__id">
        {profile.portrait ? (
          // Without script the link still opens the whole photo; with it, the photo opens in the lightbox.
          <a
            className="portrait-link"
            href={profile.photo.src}
            aria-label={t('profile.photo')}
            onClick={(event) => {
              event.preventDefault();
              openLightbox({
                src: profile.photo.src,
                title: profile.name,
                image: { alt: t('profile.photoAlt'), width: profile.photo.width, height: profile.photo.height },
              });
            }}
          >
            <img className="portrait" src={profile.portrait} alt="" width={88} height={88} />
          </a>
        ) : (
          <div className="portrait portrait--empty" aria-hidden="true">
            {profile.initials}
          </div>
        )}
        <div className="quick__heading">
          <h1 className="quick__name">{profile.name}</h1>
          <p className="quick__role">{t('profile.role')}</p>
        </div>
        <div className="prefs">
          <ThemeSwitch locale={locale} />
          <nav className="lang switch" aria-label={t('lang.label')}>
            <span className="switch__pill" aria-hidden="true" />
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
      </div>

      <p className="quick__words" role="group" aria-label={t('arr.words')}>
        {kinds.map((word) => (
          <button
            key={word}
            type="button"
            className="quick__word"
            aria-pressed={kind === word}
            onClick={() => {
              setKind(kind === word ? null : word);
              document.getElementById('activity')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            }}
          >
            {t(`arr.${word}`)}
          </button>
        ))}
      </p>

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
      <ul className="actions">
        <li>
          <a
            className="btn btn--primary"
            href={profile.publicCv[locale]}
            type="application/pdf"
            download={`Ege-Ozel-CV-${locale.toUpperCase()}.pdf`}
          >
            {t('link.cv')}
            <span className="btn__meta">PDF</span>
          </a>
        </li>
        <li>
          <CopyEmail email={profile.email} label={t('link.copyEmail')} copied={t('link.copied')} />
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
    </header>
  );
}
