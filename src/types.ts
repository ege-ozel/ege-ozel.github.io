import type { PageId } from './pages';

export type Locale = 'en' | 'tr';
export const locales: readonly Locale[] = ['en', 'tr'];

/** A string in every supported language. */
export type Text = Record<Locale, string>;

export type Status = 'live' | 'preview' | 'prototype' | 'inDevelopment';
export type Device = 'desktop' | 'mobile';
export type LinkKind = 'demo' | 'app' | 'code' | 'marketplace' | 'release' | 'site';

export interface ProjectLink {
  kind: LinkKind;
  href: string;
}

/** Files live at `${base}-${width}.{avif,webp}`; see scripts/build-media.mjs. */
export interface Poster {
  base: string;
  alt: Text;
}

export interface Project {
  id: string;
  title: string;
  placement: 'featured' | 'more';
  device: Device;
  accent: string;
  status?: Status;
  summary: Text;
  myPart: Text;
  notes?: { challenge: Text; approach: Text; status?: Text };
  tags: string[];
  poster: Poster | null;
  /** Silent preview clip, MP4. */
  video?: string;
  links: ProjectLink[];
  /** The project's own case-study page, if it has one. */
  caseStudy?: Exclude<PageId, 'home'>;
}

/** A figure in the header, such as "2 years". */
export interface Stat {
  value: Text;
  label: Text;
}

/** A real app screen: files live at `${base}-390.{avif,webp}` (see scripts/case-media.mjs). */
export interface Shot {
  base: string;
  alt: Text;
}

/** The featured project under the header: a short pitch next to real screens. */
export interface Hero {
  projectId: string;
  kicker: Text;
  title: Text;
  summary: Text;
  shots: Shot[];
}

export interface Job {
  company: string;
  /** Only addresses that were opened and checked. */
  companyUrl?: string;
  role: Text;
  period: Text;
  bullets: Text[];
}

export interface Degree {
  title: Text;
  school: Text;
  year: string;
  link?: { label: Text; href: string };
}
