import {
  ai,
  architecture,
  contact,
  credits,
  decisionStatus,
  intro,
  links,
  nutrition,
  problem,
  sections,
  status,
  tradeoffs,
  walkthrough,
} from '../data/groceryCase';
import { profile } from '../data/profile';
import { createT } from '../i18n';
import { pagePath } from '../pages';
import { locales, type Locale } from '../types';
import { ExternalLink } from './ExternalLink';
import { Icon } from './Icon';
import { Shot } from './Shot';
import { ThemeSwitch } from './ThemeSwitch';

const TOTAL = decisionStatus.reduce((sum, s) => sum + s.count, 0);

function Heading({ id, locale }: { id: string; locale: Locale }) {
  const section = sections.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown case-study section ${id}`);
  return (
    <h2 id={`${id}-title`} className="cs-h2">
      {section.title[locale]}
    </h2>
  );
}

/** The public Grocery case study: real screens first, then architecture, traceability and process. */
export function GroceryCase({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const newTab = ` (${t('link.newTab')})`;
  const L = (text: Record<Locale, string>) => text[locale];

  return (
    <div className="cs">
      <a className="skip" href="#case">
        {t('case.skip')}
      </a>
      <header className="cs-top">
        <a className="cs-top__home" href={pagePath('home', locale)}>
          <Icon name="arrowLeft" />
          <span className="cs-top__name">{profile.name} · </span>
          {t('case.back')}
        </a>
        <div className="prefs">
          <ThemeSwitch locale={locale} />
          <nav className="lang switch" aria-label={t('lang.label')}>
            <span className="switch__pill" aria-hidden="true" />
            {locales.map((code) => (
              <a
                key={code}
                href={pagePath('grocery', code)}
                hrefLang={code}
                lang={code}
                aria-current={code === locale ? 'page' : undefined}
              >
                {code.toUpperCase()}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="case" className="cs-main" tabIndex={-1}>
        <section className="cs-hero" aria-labelledby="case-title">
          <div className="cs-hero__text">
            <h1 id="case-title" className="cs-h1">
              {L(intro.title)}
            </h1>
            <p className="cs-lead">{L(intro.lead)}</p>
            <ul className="actions cs-actions">
              <li>
                <ExternalLink className="btn btn--primary" href={links.code} hint={newTab}>
                  {t('case.code')}
                </ExternalLink>
              </li>
              <li>
                <ExternalLink className="btn" href={links.app} hint={newTab}>
                  {t('case.app')}
                </ExternalLink>
              </li>
            </ul>
            <p className="cs-note">{L(intro.signIn)}</p>
            <dl className="cs-facts">
              {intro.facts.map((fact) => (
                <div key={fact.label.en}>
                  <dt>{L(fact.label)}</dt>
                  <dd>{L(fact.value)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="cs-hero__shot">
            <div className="phone">
              <Shot shot={intro.shot} locale={locale} eager priority />
            </div>
            <figcaption>{L(intro.shot.caption)}</figcaption>
          </figure>
        </section>

        <nav className="cs-toc" aria-label={t('case.toc')}>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{L(s.title)}</a>
              </li>
            ))}
          </ol>
        </nav>

        <section id="problem" className="cs-section" aria-labelledby="problem-title" tabIndex={-1}>
          <Heading id="problem" locale={locale} />
          <div className="cs-prose">
            {problem.body.map((p) => (
              <p key={p.en}>{L(p)}</p>
            ))}
          </div>
          <ol className="cs-jobs">
            {problem.jobs.map((job) => (
              <li key={job.title.en}>
                <strong>{L(job.title)}</strong>
                <span>{L(job.body)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="walkthrough" className="cs-section" aria-labelledby="walkthrough-title" tabIndex={-1}>
          <Heading id="walkthrough" locale={locale} />
          <p className="cs-prose">{L(walkthrough.intro)}</p>
          {walkthrough.steps.map((step) => (
            <article key={step.id} className="cs-step" aria-labelledby={`step-${step.id}`}>
              <div className="cs-step__text">
                <h3 id={`step-${step.id}`} className="cs-h3">
                  {L(step.title)}
                </h3>
                <p>{L(step.body)}</p>
              </div>
              <div className="cs-shots">
                {step.shots.map((s) => (
                  <figure key={s.base}>
                    <div className="phone">
                      <Shot shot={s} locale={locale} />
                    </div>
                    <figcaption>{L(s.caption)}</figcaption>
                  </figure>
                ))}
              </div>
            </article>
          ))}
          <div className="cs-more">
            <ul className="cs-cards cs-cards--stack">
              {walkthrough.more.map((item) => (
                <li key={item.title.en}>
                  <h3 className="cs-h3">{L(item.title)}</h3>
                  <p>{L(item.body)}</p>
                </li>
              ))}
            </ul>
            <figure className="cs-video">
              <video
                controls
                playsInline
                preload="none"
                width={390}
                height={844}
                poster={walkthrough.video.poster}
                aria-label={L(walkthrough.video.title)}
              >
                <source src={walkthrough.video.src} type="video/mp4" />
                {t('case.noVideo')}
              </video>
              <figcaption>
                <strong>{L(walkthrough.video.title)}.</strong> {L(walkthrough.video.caption)}
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="architecture" className="cs-section cs-dark" aria-labelledby="architecture-title" tabIndex={-1}>
          <Heading id="architecture" locale={locale} />
          <p className="cs-prose">{L(architecture.intro)}</p>
          <figure className="cs-flow">
            <ol aria-label={L(architecture.diagram.label)}>
              <li className="cs-node">
                <strong>{L(architecture.diagram.browser)}</strong>
                <span>{L(architecture.diagram.browserDetail)}</span>
              </li>
              <li className="cs-edge" aria-hidden="true">
                <span>{L(architecture.diagram.cookie)}</span>
              </li>
              <li className="cs-node">
                <strong>{L(architecture.diagram.functions)}</strong>
                <code>{L(architecture.diagram.functionsDetail)}</code>
                <span className="cs-node__side">↔ {L(architecture.diagram.google)}</span>
              </li>
              <li className="cs-edge" aria-hidden="true">
                <span>{L(architecture.diagram.session)}</span>
              </li>
              <li className="cs-node">
                <strong>{L(architecture.diagram.database)}</strong>
                <span>{L(architecture.diagram.databaseDetail)}</span>
              </li>
            </ol>
          </figure>
          <ul className="cs-cards">
            {architecture.points.map((point) => (
              <li key={point.title.en}>
                <h3 className="cs-h3">{L(point.title)}</h3>
                <p>{L(point.body)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="nutrition" className="cs-section" aria-labelledby="nutrition-title" tabIndex={-1}>
          <Heading id="nutrition" locale={locale} />
          <p className="cs-prose">{L(nutrition.intro)}</p>

          <h3 className="cs-h3">{L(nutrition.statusTitle)}</h3>
          <div className="cs-bar" aria-hidden="true">
            {decisionStatus.map((s) => (
              <span key={s.id} className={`cs-bar__seg cs-bar__seg--${s.id}`} style={{ flexGrow: s.count }} />
            ))}
          </div>
          <ul className="cs-legend">
            {decisionStatus.map((s) => (
              <li key={s.id}>
                <span className={`cs-swatch cs-bar__seg--${s.id}`} aria-hidden="true" />
                <span className="cs-num">{s.count}</span> {L(s.label)}
              </li>
            ))}
            <li className="cs-legend__total">
              <span className="cs-num">{TOTAL}</span> DEC
            </li>
          </ul>
          <p className="cs-small">{L(nutrition.statusNote)}</p>

          <h3 className="cs-h3">{L(nutrition.chainTitle)}</h3>
          <ol className="cs-chain">
            {nutrition.chain.map((step) => (
              <li key={step.title.en}>
                <span className="cs-chain__label">{L(step.title)}</span>
                <p>{L(step.body)}</p>
              </li>
            ))}
          </ol>
          <p className="cs-prose">{L(nutrition.method)}</p>
          <aside className="cs-limits" aria-labelledby="limits-title">
            <h3 id="limits-title" className="cs-h3">
              {L(nutrition.limitsTitle)}
            </h3>
            <ul>
              {nutrition.limits.map((item) => (
                <li key={item.en}>{L(item)}</li>
              ))}
            </ul>
          </aside>
        </section>

        <section id="ai" className="cs-section cs-dark" aria-labelledby="ai-title" tabIndex={-1}>
          <Heading id="ai" locale={locale} />
          <p className="cs-prose">{L(ai.intro)}</p>
          <ul className="cs-cards">
            {ai.rules.map((rule) => (
              <li key={rule.title.en}>
                <h3 className="cs-h3">{L(rule.title)}</h3>
                <p>{L(rule.body)}</p>
              </li>
            ))}
          </ul>
          <h3 className="cs-h3">{L(ai.humanTitle)}</h3>
          <ul className="cs-pills">
            {ai.human.map((item) => (
              <li key={item.en}>{L(item)}</li>
            ))}
          </ul>
        </section>

        <section id="tradeoffs" className="cs-section" aria-labelledby="tradeoffs-title" tabIndex={-1}>
          <Heading id="tradeoffs" locale={locale} />
          <dl className="cs-tradeoffs">
            {tradeoffs.map((item) => (
              <div key={item.title.en}>
                <dt>{L(item.title)}</dt>
                <dd>{L(item.body)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="status" className="cs-section cs-section--split" aria-labelledby="status-title" tabIndex={-1}>
          <Heading id="status" locale={locale} />
          <p className="cs-prose">{L(status.body)}</p>
          <ul className="cs-list">
            {status.next.map((item) => (
              <li key={item.en}>{L(item)}</li>
            ))}
          </ul>
        </section>

        <section id="credits" className="cs-section cs-section--split" aria-labelledby="credits-title" tabIndex={-1}>
          <Heading id="credits" locale={locale} />
          <div className="cs-prose">
            {credits.body.map((p) => (
              <p key={p.en}>{L(p)}</p>
            ))}
          </div>
        </section>

        <section id="contact" className="cs-section cs-contact" aria-labelledby="contact-title" tabIndex={-1}>
          <Heading id="contact" locale={locale} />
          <p className="cs-prose">{L(contact.body)}</p>
          <ul className="actions">
            <li>
              <a className="btn btn--primary" href={`mailto:${profile.email}`}>
                {t('link.email')}: {profile.email}
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
            <li>
              <a className="btn" href={profile.publicCv[locale]} type="application/pdf">
                {t('link.cv')}
              </a>
            </li>
          </ul>
        </section>
      </main>

      <footer className="cs-footer">
        <a href={pagePath('home', locale)}>
          <Icon name="arrowLeft" /> {t('case.back')}
        </a>
        <span>{t('footer.note')}</span>
      </footer>
    </div>
  );
}
