import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProjectCard } from '../src/components/ProjectCard';
import { featuredProjects } from '../src/data/projects';
import { renderPage } from '../src/entry-server';

const en = renderPage('en');
const tr = renderPage('tr');

const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);

describe('prerendered page', () => {
  it('leads with the name, role and availability', () => {
    expect(en.html).toMatch(/<h1 class="quick__name">Ege Özel<\/h1>/);
    expect(en.html).toContain('Software Developer · React &amp; TypeScript');
    expect(en.html).toContain('Open to work');
    expect(tr.html).toContain('İşe açık');
    expect(en.title).toBe('Ege Özel, Software Developer');
  });

  it('never publishes a phone number or broken values, and links only the public CVs as PDFs', () => {
    for (const html of [en.html, tr.html]) {
      for (const banned of ['5544321601', '554 432', '+90', 'tel:', 'undefined', '[object Object]']) {
        expect(html, banned).not.toContain(banned);
      }
      const pdfs = [...html.matchAll(/href="([^"]+\.pdf)"/g)].map((m) => m[1]);
      expect(pdfs.length).toBeGreaterThan(0);
      expect(pdfs.every((p) => /^\/cv\/ege-ozel-cv-(en|tr)\.pdf$/.test(p))).toBe(true);
    }
  });

  it('offers the CV in the page language', () => {
    expect(en.html).toContain('href="/cv/ege-ozel-cv-en.pdf"');
    expect(tr.html).toContain('href="/cv/ege-ozel-cv-tr.pdf"');
    expect(en.html).not.toContain('subject=CV');
  });

  it('shows three stats in the header', () => {
    expect(en.html.match(/class="stat"/g)?.length).toBe(3);
  });

  it('opens external links safely in a new tab', () => {
    const external = anchors(en.html).filter((a) => /href="https?:/.test(a));
    expect(external.length).toBeGreaterThanOrEqual(12);
    for (const a of external) {
      expect(a).toContain('target="_blank"');
      expect(a).toContain('rel="noopener noreferrer"');
    }
  });

  it('links to the verified profiles', () => {
    expect(en.html).toContain('href="https://github.com/ege-ozel"');
    expect(en.html).toContain('href="https://www.linkedin.com/in/ege-%C3%B6zel-a721231bb"');
  });

  it('loads only the first poster eagerly', () => {
    const images = [...en.html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    expect(images.length).toBe(3);
    expect(images[0]).toContain('loading="eager"');
    expect(images[0]).toMatch(/fetchPriority="high"|fetchpriority="high"/);
    for (const img of images.slice(1)) expect(img).toContain('loading="lazy"');
  });

  it('marks the current language and links to the other', () => {
    expect(en.html).toMatch(/<a href="\/" hrefLang="en" lang="en" aria-current="page">EN<\/a>/);
    expect(en.html).toMatch(/<a href="\/tr\/" hrefLang="tr" lang="tr">TR<\/a>/);
    expect(tr.html).toMatch(/<a href="\/tr\/" hrefLang="tr" lang="tr" aria-current="page">TR<\/a>/);
  });

  it('shows placeholders for projects without screenshots', () => {
    expect(en.html.match(/class="media__empty"/g)?.length).toBe(2);
    expect(tr.html).toContain('Ekran görüntüleri yakında');
  });

  it('marks exactly the two cards with a preview video for hydration', () => {
    expect(en.html.match(/data-hydrate/g)?.length).toBe(2);
    expect(en.html.match(/<video\b/g)?.length).toBe(2);
    expect(en.html).not.toContain('.mp4');
  });

  it('marks a card with a video for hydration and never preloads it', () => {
    const withVideo = { ...featuredProjects[0], video: '/media/woodcraft.mp4' };
    const html = renderToString(<ProjectCard project={withVideo} locale="en" eager={false} />);
    expect(html).toContain('data-hydrate');
    expect(html).toContain('preload="none"');
    expect(html).not.toContain('woodcraft.mp4');
  });

  it('has a skip link to the projects', () => {
    expect(en.html.indexOf('class="skip" href="#work"')).toBeLessThan(en.html.indexOf('<header class="quick"'));
    expect(en.html.indexOf('<header class="quick"')).toBeGreaterThan(-1);
    expect(en.html).toContain('<section id="work"');
  });
});
