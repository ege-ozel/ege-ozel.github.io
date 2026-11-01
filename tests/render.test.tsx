import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProjectCard } from '../src/components/ProjectCard';
import { featuredProjects, moreProjects } from '../src/data/projects';
import { renderPage } from '../src/entry-server';

const en = renderPage('en');
const tr = renderPage('tr');

const anchors = (html: string) => [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);

describe('prerendered page', () => {
  it('leads with the name, role and availability', () => {
    expect(en.html).toMatch(/<h1 class="quick__name">Ege Özel<\/h1>/);
    expect(en.html).toContain('Software Developer · React &amp; TypeScript');
    expect(en.html).toContain('Open to work');
    expect(tr.html).toContain('İş fırsatlarına açık');
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

  it('links the employers and the thesis project', () => {
    expect(en.html).toContain('href="https://patikaglobal.com"');
    expect(en.html).toContain('href="https://www.traderlands.com"');
    expect(en.html).toContain('href="https://github.com/ege-ozel/gencomparator-frontend"');
    expect(tr.html).toContain('Bitirme projesi: Gencomparator');
  });

  it('links to the verified profiles', () => {
    expect(en.html).toContain('href="https://github.com/ege-ozel"');
    expect(en.html).toContain('href="https://www.linkedin.com/in/ege-%C3%B6zel-a721231bb"');
  });

  it('prerenders the three Grocery screens first and eagerly, one with high priority, and every card poster lazily', () => {
    // The portrait is a small header image; the rest are screens and posters.
    const images = [...en.html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).filter((img) => !img.includes('portrait'));
    expect(images.length).toBe(3 + featuredProjects.filter((p) => p.poster).length);
    for (const img of images.slice(0, 3)) {
      expect(img).toContain('/media/grocery-case/');
      expect(img).toContain('loading="eager"');
    }
    expect(images.filter((img) => /fetchPriority="high"|fetchpriority="high"/i.test(img))).toHaveLength(1);
    for (const img of images.slice(3)) expect(img).toContain('loading="lazy"');
  });

  it('opens with Grocery and links its case study in the page language', () => {
    expect(en.html.indexOf('id="hero-title"')).toBeLessThan(en.html.indexOf('<section id="work"'));
    expect(en.html).toMatch(/id="hero-title"[^>]*>Grocery<\/h2>/);
    expect(en.html).toContain('href="/projects/grocery/"');
    expect(tr.html).toContain('href="/tr/projects/grocery/"');
    expect(en.html).not.toContain('TrackMesh: DAW projects');
    expect(en.html.match(/<article id="[^"]+" class="card"/g)?.length).toBe(featuredProjects.length);
    expect(en.html.indexOf('id="grocery-title"')).toBeLessThan(en.html.indexOf('id="trackmesh-title"'));
  });

  it('includes every project in the page navigation', () => {
    const navigation = en.html.match(/<nav class="wayfinder__menu"[\s\S]*?<\/nav>/)?.[0] ?? '';
    for (const project of [...featuredProjects, ...moreProjects]) {
      expect(navigation).toContain(`href="#${project.id}"`);
      expect(en.html).toContain(`id="${project.id}"`);
    }
  });

  it('offers a clearly labelled sample demo in both languages', () => {
    expect(en.html).toContain('id="grocery-demo"');
    expect(en.html).toContain('does not run the app');
    expect(tr.html).toContain('gerçek uygulamanın öneri motorunu ve eşitlemesini çalıştırmaz');
    expect(tr.html).toContain('Plana ekle');
    expect(tr.html).toContain('Örnek yemekler');
  });

  it('marks the current language and links to the other', () => {
    expect(en.html).toMatch(/<a href="\/" hrefLang="en" lang="en" aria-current="page">EN<\/a>/);
    expect(en.html).toMatch(/<a href="\/tr\/" hrefLang="tr" lang="tr">TR<\/a>/);
    expect(tr.html).toMatch(/<a href="\/tr\/" hrefLang="tr" lang="tr" aria-current="page">TR<\/a>/);
  });

  it('shows a placeholder only for featured projects still waiting for media', () => {
    const waiting = featuredProjects.filter((p) => !p.poster).length;
    expect(en.html.match(/class="media__empty"/g)?.length ?? 0).toBe(waiting);
  });

  it('marks every featured clip for hydration and never preloads a video', () => {
    const clips = featuredProjects.filter((p) => p.poster && p.video).length;
    expect(en.html.match(/data-hydrate/g)?.length).toBe(clips);
    expect(en.html).not.toContain('.mp4');
    for (const video of en.html.match(/<video\b[^>]*>/g) ?? []) expect(video).toContain('preload="none"');
  });

  it('offers a watch button for each featured clip, and renders the lightbox closed', () => {
    const clips = featuredProjects.filter((p) => p.poster && p.video).length;
    expect(en.html.match(/class="watch/g)?.length).toBe(clips);
    expect(en.html).toMatch(/<dialog\b[^>]*class="lightbox"/);
    expect(en.html).not.toMatch(/<dialog\b[^>]*\sopen[\s=>]/);
  });

  it('marks a card with a video for hydration and never preloads it', () => {
    const withVideo = { ...featuredProjects[0], video: '/media/woodcraft.mp4' };
    const html = renderToString(<ProjectCard project={withVideo} locale="en" eager={false} />);
    expect(html).toContain('data-hydrate');
    expect(html).toContain('preload="none"');
    expect(html).not.toContain('woodcraft.mp4');
  });

  it('has a skip link to the projects', () => {
    expect(en.html.indexOf('class="skip" href="#work"')).toBeLessThan(en.html.indexOf('<header id="top" class="quick"'));
    expect(en.html.indexOf('<header id="top" class="quick"')).toBeGreaterThan(-1);
    expect(en.html).toContain('<section id="work"');
  });
});

describe('Grocery case study', () => {
  const caseEn = renderPage('en', 'grocery');
  const caseTr = renderPage('tr', 'grocery');

  it('has its own title, description and one h1', () => {
    expect(caseEn.title).toBe('Grocery — From Meal Planning to Shared Shopping · Ege Özel');
    expect(caseTr.title).toBe('Grocery — Yemek planından ortak alışverişe · Ege Özel');
    expect(caseEn.description.length).toBeGreaterThan(80);
    expect(caseEn.description.length).toBeLessThan(260);
    for (const html of [caseEn.html, caseTr.html]) expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it('has the nine sections in order, each with a heading', () => {
    const ids = ['problem', 'walkthrough', 'architecture', 'nutrition', 'tradeoffs', 'status', 'credits', 'contact'];
    const positions = ids.map((id) => caseEn.html.indexOf(`<section id="${id}"`));
    expect(positions.every((p) => p > 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    for (const id of ids) expect(caseEn.html).toContain(`id="${id}-title"`);
  });

  it('links the public source, the live app, the portfolio and the other language', () => {
    expect(caseEn.html).toContain('href="https://github.com/ozan-ozel/grocery"');
    expect(caseEn.html).toContain('href="https://grocery-five-ecru.vercel.app"');
    expect(caseEn.html).toContain('href="/"');
    expect(caseEn.html).toMatch(/<a href="\/tr\/projects\/grocery\/" hrefLang="tr" lang="tr">TR<\/a>/);
    expect(caseTr.html).toMatch(/<a href="\/tr\/projects\/grocery\/" hrefLang="tr" lang="tr" aria-current="page">TR<\/a>/);
    expect(caseTr.html).toContain('href="/tr/"');
  });

  it('says the live app needs a sign-in and does not offer a demo that does not exist', () => {
    expect(caseEn.html).toContain('needs a Google sign-in');
    expect(caseTr.html).toContain('Google ile giriş yapmak gerekiyor');
    expect(caseEn.html).not.toMatch(/Explore demo|Live demo/);
  });

  it('never calls the suggestions AI or the nutrition logic clinically validated', () => {
    const text = caseEn.html.replace(/<[^>]+>/g, ' ');
    expect(text).toContain('no language model');
    expect(text).toContain('Not clinically validated');
    expect(text).not.toMatch(/AI-powered|AI recommendation|clinically proven|medical-grade/i);
  });

  it('credits the co-developer in both languages', () => {
    expect(caseEn.html).toContain('Ozan Özel started it');
    expect(caseTr.html).toContain('Ozan Özel projeyi');
  });

  it('loads the first screen eagerly, the rest lazily, and never preloads the recording', () => {
    const images = [...caseEn.html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
    expect(images[0]).toContain('loading="eager"');
    for (const img of images.slice(1)) expect(img).toContain('loading="lazy"');
    for (const img of images) expect(img).toMatch(/alt="[^"]{20,}"/);
    expect(caseEn.html).toMatch(/<video\b[^>]*preload="none"/);
    expect(caseEn.html).toMatch(/<video\b[^>]*controls/);
  });

  it('needs no JavaScript: nothing on the page asks to be hydrated', () => {
    expect(caseEn.html).not.toContain('data-hydrate');
  });

  it('opens external links safely and reuses the portfolio contact details', () => {
    for (const a of anchors(caseEn.html).filter((tag) => /href="https?:/.test(tag))) {
      expect(a).toContain('target="_blank"');
      expect(a).toContain('rel="noopener noreferrer"');
    }
    expect(caseEn.html).toContain('href="mailto:egeozeldev@gmail.com"');
    expect(caseEn.html).toContain('href="/cv/ege-ozel-cv-en.pdf"');
    expect(caseTr.html).toContain('href="/cv/ege-ozel-cv-tr.pdf"');
  });
});
