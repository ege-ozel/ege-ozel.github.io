import { degrees, jobs, profile } from '../data/profile';
import { moreProjects } from '../data/projects';
import { createT } from '../i18n';
import type { Locale } from '../types';
import { ExternalLink } from './ExternalLink';
import { linkLabel } from './ProjectCard';

export function MoreWork({ locale }: { locale: Locale }) {
  const t = createT(locale);
  return (
    <ul className="more">
      {moreProjects.map((project) => (
        <li key={project.id} id={project.id} className="more__item">
          <h3 className="more__title">{project.title}</h3>
          <p className="more__summary">{project.summary[locale]}</p>
          <p className="more__tags">{project.tags.join(', ')}</p>
          <ul className="links" aria-label={t('card.links')}>
            {project.links.map((link) => (
              <li key={link.href}>
                <ExternalLink
                  className="btn btn--small"
                  href={link.href}
                  hint={`: ${project.title} (${t('link.newTab')})`}
                >
                  {t(linkLabel[link.kind])}
                </ExternalLink>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export function ExperienceList({ locale }: { locale: Locale }) {
  const t = createT(locale);
  return (
    <ol className="jobs">
      {jobs.map((job) => (
        <li key={job.company} className="job">
          <h3 className="job__company">
            {job.companyUrl ? (
              <ExternalLink href={job.companyUrl} hint={` (${t('link.newTab')})`}>
                {job.company}
              </ExternalLink>
            ) : (
              job.company
            )}
          </h3>
          <p className="job__meta">
            {job.role[locale]}, {job.period[locale]}
          </p>
          <ul className="job__bullets">
            {job.bullets.map((bullet) => (
              <li key={bullet.en}>{bullet[locale]}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

export function EducationList({ locale }: { locale: Locale }) {
  const t = createT(locale);
  return (
    <ul className="degrees">
      {degrees.map((degree) => (
        <li key={degree.title.en} className="degree">
          <span className="degree__title">{degree.title[locale]}</span>
          <span className="degree__meta">
            {degree.school[locale]}, {degree.year}
          </span>
          {degree.link && (
            <ExternalLink className="degree__link" href={degree.link.href} hint={` (${t('link.newTab')})`}>
              {degree.link.label[locale]}
            </ExternalLink>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Contact({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const newTab = ` (${t('link.newTab')})`;
  return (
    <div className="contact">
      <p className="contact__text">{t('contact.text')}</p>
      <a className="contact__email" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
      <ul className="actions">
        <li>
          <a className="btn btn--primary" href={profile.publicCv[locale]} type="application/pdf">
            {t('link.cv')}
          </a>
        </li>
        <li>
          <ExternalLink className="btn" href={profile.github} hint={newTab}>
            {t('link.github')}
          </ExternalLink>
        </li>
        <li>
          <ExternalLink className="btn" href={profile.linkedin} hint={newTab}>
            {t('link.linkedin')}
          </ExternalLink>
        </li>
      </ul>
    </div>
  );
}
