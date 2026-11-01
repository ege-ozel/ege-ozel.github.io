import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as groceryCase from '../src/data/groceryCase';
import { hero } from '../src/data/hero';
import { degrees, jobs, profile } from '../src/data/profile';
import { featuredProjects, moreProjects, projects, shippedCount } from '../src/data/projects';

/**
 * Featured projects whose recordings wait on Ege (desktop shoot, Grocery local demo,
 * Interval Timer fixes). Empty this list as the media lands; it must be empty before release.
 */
/** Public CVs wait on Ege's approval (Plan 3 Task 6). Set to false once both PDFs exist. */
const isText = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && Object.keys(value).sort().join() === 'en,tr';

/** Every {en, tr} pair anywhere inside a value. */
function texts(value: unknown, path = ''): Array<[string, Record<string, unknown>]> {
  if (isText(value)) return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, i) => texts(item, `${path}[${i}]`));
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, item]) => texts(item, `${path}.${key}`));
  }
  return [];
}

describe('project data', () => {
  it('has unique ids', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('features Grocery first, then the session manager and the timer, with TrackMesh after them', () => {
    expect(featuredProjects.map((p) => p.id)).toEqual(['grocery', 'wsm', 'trackmesh', 'metronome']);
  });

  it('lists the smaller projects in the agreed order and drops World of Cards', () => {
    expect(moreProjects.map((p) => p.id)).toEqual(['interval-timer', 'desktuk', 'pdf-reader', 'woodcraft', 'voice-type', 'mert-ozkan', 'trackmesh-film']);
    expect(projects.some((p) => p.id === 'world-of-cards')).toBe(false);
  });

  it('fills every English and Turkish string', () => {
    const all = texts({ profile, jobs, degrees, projects, hero, groceryCase });
    expect(all.length).toBeGreaterThan(150);
    for (const [path, text] of all) {
      expect(String(text.en).trim(), `${path}.en`).not.toBe('');
      expect(String(text.tr).trim(), `${path}.tr`).not.toBe('');
    }
  });

  it('links only to https addresses', () => {
    for (const project of projects) {
      for (const link of project.links) expect(link.href, project.id).toMatch(/^https:\/\//);
    }
    for (const job of jobs) if (job.companyUrl) expect(job.companyUrl).toMatch(/^https:\/\//);
    for (const degree of degrees) if (degree.link) expect(degree.link.href).toMatch(/^https:\/\//);
  });

  it('never links a private repository', () => {
    const privateRepos = ['track-mesh', 'grocery', 'cv', 'your-plugin-stack-react', 'poker-tracker'];
    const hrefs = projects.flatMap((p) => p.links.map((l) => l.href));
    for (const repo of privateRepos) {
      expect(hrefs.filter((h) => h.replace(/\/$/, '').endsWith(`github.com/ege-ozel/${repo}`))).toEqual([]);
    }
  });

  it('has every poster file the markup asks for', () => {
    for (const project of projects) {
      if (!project.poster) continue;
      const widths = project.device === 'desktop' ? [800, 1600] : [400, 800];
      for (const width of widths) {
        for (const ext of ['avif', 'webp']) {
          const file = join('public', `${project.poster.base}-${width}.${ext}`);
          expect(existsSync(file), file).toBe(true);
        }
      }
    }
  });

  it('gives every featured project a poster and a preview clip that exist', () => {
    for (const p of featuredProjects) {
      expect(p.poster, p.id).not.toBeNull();
      expect(Boolean(p.video && existsSync(join('public', p.video))), p.id).toBe(true);
    }
  });

  it('has a clip file for every project that names one', () => {
    for (const p of projects) if (p.video) expect(existsSync(join('public', p.video)), p.video).toBe(true);
  });
});

describe('hero and profile data', () => {
  it('leads with Grocery and three real screens that exist', () => {
    expect(hero.projectId).toBe('grocery');
    expect(hero.shots).toHaveLength(3);
    for (const shot of hero.shots) {
      for (const ext of ['avif', 'webp']) expect(existsSync(join('public', `${shot.base}-390.${ext}`)), shot.base).toBe(true);
    }
  });

  it('links Grocery to its case study, the live app and the public repository', () => {
    const grocery = projects.find((p) => p.id === 'grocery');
    expect(grocery?.caseStudy).toBe('grocery');
    expect(grocery?.links).toEqual([
      { kind: 'app', href: 'https://grocery-five-ecru.vercel.app' },
      { kind: 'code', href: 'https://github.com/ozan-ozel/grocery' },
    ]);
    expect(grocery?.myPart.en).toContain('Ozan Özel');
    expect(grocery?.myPart.tr).toContain('Ozan Özel');
  });

  it('has every case-study screen and the recording', () => {
    const shots = [groceryCase.intro.shot, ...groceryCase.walkthrough.steps.flatMap((step) => step.shots)];
    for (const shot of shots) {
      for (const ext of ['avif', 'webp']) expect(existsSync(join('public', `${shot.base}-390.${ext}`)), shot.base).toBe(true);
    }
    expect(existsSync(join('public', groceryCase.walkthrough.video.src))).toBe(true);
    expect(existsSync(join('public', groceryCase.walkthrough.video.poster))).toBe(true);
  });

  it('counts all 112 decisions from the register', () => {
    expect(groceryCase.decisionStatus.reduce((sum, s) => sum + s.count, 0)).toBe(112);
  });

  it('has the link previews', () => {
    for (const file of ['og.png', 'og-grocery.png']) expect(existsSync(join('public', file)), file).toBe(true);
  });

  it('has three stats, the last one counting shipped projects', () => {
    expect(profile.stats).toHaveLength(3);
    expect(profile.stats[2].value.en).toBe(String(shippedCount));
    expect(shippedCount).toBeGreaterThanOrEqual(6);
  });

  it('points the public CVs at /cv/ and has both files once approved', () => {
    expect(profile.publicCv).toEqual({ en: '/cv/ege-ozel-cv-en.pdf', tr: '/cv/ege-ozel-cv-tr.pdf' });
    for (const file of Object.values(profile.publicCv)) expect(existsSync(join('public', file)), file).toBe(true);
  });

  it('links the thesis project from the master degree', () => {
    expect(degrees[0].link?.href).toBe('https://github.com/ege-ozel/gencomparator-frontend');
  });
});
