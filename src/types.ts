export type Locale = 'en' | 'tr';
export const locales: readonly Locale[] = ['en', 'tr'];

/** A string in every supported language. */
export type Text = Record<Locale, string>;

export type Status = 'live' | 'preview' | 'prototype' | 'inDevelopment';
export type Device = 'desktop' | 'mobile';
export type LinkKind = 'demo' | 'code' | 'marketplace' | 'release' | 'site';

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
}

/** A figure in the header, such as "2 years". */
export interface Stat {
  value: Text;
  label: Text;
}

/** The film under the header: a 16:9 cut for wide screens and a 9:16 cut for tall ones. */
export interface HeroMedia {
  projectId: string;
  title: Text;
  caption: Text;
  /** `poster` is a base path; files follow scripts/media-sizes.mjs (.wide / .tall). */
  landscape: { video: string; poster: string };
  portrait: { video: string; poster: string };
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
