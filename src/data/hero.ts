import type { HeroMedia } from '../types';

export const hero: HeroMedia = {
  projectId: 'trackmesh',
  title: {
    en: 'TrackMesh: DAW projects, PC to PC',
    tr: 'TrackMesh: DAW projeleri, bilgisayardan bilgisayara',
  },
  caption: {
    en: 'TrackMesh sends DAW project folders PC to PC. Product film made in Blender.',
    tr: 'TrackMesh, DAW proje klasörlerini bilgisayardan bilgisayara gönderir. Ürün filmi Blender’da hazırlandı.',
  },
  landscape: { video: '/media/hero-16x9.mp4', poster: '/media/hero' },
  portrait: { video: '/media/hero-9x16.mp4', poster: '/media/hero-mobile' },
};
