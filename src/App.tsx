import { FeaturedHero } from './components/FeaturedHero';
import { Contact, EducationList, ExperienceList, MoreWork } from './components/Lists';
import { PageNav } from './components/PageNav';
import { ProjectCard } from './components/ProjectCard';
import { QuickScan } from './components/QuickScan';
import { Section } from './components/Section';
import { featuredProjects } from './data/projects';
import { createT } from './i18n';
import { LightboxProvider } from './lightbox';
import type { Locale } from './types';

/** The portfolio page. Case studies render on their own (see entry-server.tsx). */
export function App({ locale }: { locale: Locale }) {
  const t = createT(locale);
  return (
    <LightboxProvider closeLabel={t('lightbox.close')}>
      <a className="skip" href="#work">
        {t('skip')}
      </a>
      <PageNav locale={locale} />
      <div className="shell">
        <QuickScan locale={locale} />
        <main className="content">
          <FeaturedHero locale={locale} />
          <Section id="work" title={t('work.title')}>
            <div className="cards">
              {featuredProjects.map((project) => (
                // The hero screens are above the fold, so every card poster loads lazily.
                <ProjectCard key={project.id} project={project} locale={locale} eager={false} />
              ))}
            </div>
          </Section>
          <Section id="more" split title={t('more.title')}>
            <MoreWork locale={locale} />
          </Section>
          <Section id="experience" split title={t('experience.title')}>
            <ExperienceList locale={locale} />
          </Section>
          <Section id="education" split title={t('education.title')}>
            <EducationList locale={locale} />
          </Section>
          <Section id="contact" split title={t('contact.title')}>
            <Contact locale={locale} />
          </Section>
          <footer className="footer">{t('footer.note')}</footer>
        </main>
      </div>
    </LightboxProvider>
  );
}
