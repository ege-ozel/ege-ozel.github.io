import { pagePath } from './pages';
import type { Locale, Status } from './types';

const en = {
  'meta.title': 'Ege Özel, Software Developer',
  'meta.description':
    'Software developer in Ankara. Two years of professional React and TypeScript work, plus shipped products across web, desktop and audio.',
  skip: 'Skip to projects',
  'profile.label': 'Profile',
  'profile.role': 'Software Developer · React & TypeScript',
  'profile.open': 'Open to work',
  'profile.stats': 'At a glance',
  'profile.strengths': 'Main technologies',
  'profile.location': 'Ankara, Türkiye',
  'lang.label': 'Language',
  'link.github': 'GitHub',
  'link.linkedin': 'LinkedIn',
  'link.email': 'Email',
  'link.cv': 'Download CV',
  'link.demo': 'Live demo',
  'link.code': 'Code',
  'link.marketplace': 'Marketplace',
  'link.release': 'Download',
  'link.site': 'Website',
  'link.newTab': 'opens in a new tab',
  'work.title': 'Selected work',
  'more.title': 'More work',
  'experience.title': 'Experience',
  'education.title': 'Education',
  'contact.title': 'Contact',
  'contact.text': 'Open to frontend, full-stack and product roles. Email is the fastest way to reach me.',
  'card.tags': 'Technologies',
  'card.myPart': 'My part',
  'card.links': 'Links',
  'card.notes': 'Technical notes',
  'card.challenge': 'Challenge',
  'card.approach': 'Approach',
  'card.status': 'Status',
  'status.live': 'Live',
  'status.preview': 'Early preview',
  'status.prototype': 'Prototype',
  'status.inDevelopment': 'In development',
  'media.empty': 'Screenshots coming soon',
  'media.play': 'Play preview',
  'media.pause': 'Pause preview',
  'media.watch': 'Watch video',
  'hero.label': 'Featured project',
  'link.app': 'Live app',
  'link.case': 'Read the case study',
  'link.signIn': 'Google sign-in required',
  'case.skip': 'Skip to the case study',
  'case.back': 'Portfolio',
  'case.toc': 'On this page',
  'case.code': 'View source code',
  'case.app': 'Open live app',
  'case.noVideo': 'Your browser cannot play this video.',
  'lightbox.close': 'Close video',
  'footer.note': '© 2026 Ege Özel. Built with React, TypeScript and Vite.',
} as const;

export type UiKey = keyof typeof en;

const tr: Record<UiKey, string> = {
  'meta.title': 'Ege Özel, Yazılım Geliştirici',
  'meta.description':
    'Ankara’da yazılım geliştirici. React ve TypeScript ile iki yıllık profesyonel deneyim; web, masaüstü ve ses alanında yayınlanmış ürünler.',
  skip: 'Projelere geç',
  'profile.label': 'Profil',
  'profile.role': 'Yazılım Geliştirici · React & TypeScript',
  'profile.open': 'İşe açık',
  'profile.stats': 'Kısaca',
  'profile.strengths': 'Ana teknolojiler',
  'profile.location': 'Ankara, Türkiye',
  'lang.label': 'Dil',
  'link.github': 'GitHub',
  'link.linkedin': 'LinkedIn',
  'link.email': 'E-posta',
  'link.cv': 'CV indir',
  'link.demo': 'Canlı demo',
  'link.code': 'Kod',
  'link.marketplace': 'Marketplace',
  'link.release': 'İndir',
  'link.site': 'Web sitesi',
  'link.newTab': 'yeni sekmede açılır',
  'work.title': 'Seçili projeler',
  'more.title': 'Diğer projeler',
  'experience.title': 'Deneyim',
  'education.title': 'Eğitim',
  'contact.title': 'İletişim',
  'contact.text': 'Frontend, full-stack ve ürün geliştirme rollerine açığım. Bana en hızlı e-postayla ulaşabilirsiniz.',
  'card.tags': 'Teknolojiler',
  'card.myPart': 'Katkım',
  'card.links': 'Bağlantılar',
  'card.notes': 'Teknik notlar',
  'card.challenge': 'Zorluk',
  'card.approach': 'Yaklaşım',
  'card.status': 'Durum',
  'status.live': 'Yayında',
  'status.preview': 'Erken önizleme',
  'status.prototype': 'Prototip',
  'status.inDevelopment': 'Geliştiriliyor',
  'media.empty': 'Ekran görüntüleri yakında',
  'media.play': 'Önizlemeyi oynat',
  'media.pause': 'Önizlemeyi durdur',
  'media.watch': 'Videoyu izle',
  'hero.label': 'Öne çıkan proje',
  'link.app': 'Canlı uygulama',
  'link.case': 'Vaka çalışmasını oku',
  'link.signIn': 'Google ile giriş gerekir',
  'case.skip': 'Vaka çalışmasına geç',
  'case.back': 'Portfolyo',
  'case.toc': 'Bu sayfada',
  'case.code': 'Kaynak kodunu incele',
  'case.app': 'Canlı uygulamayı aç',
  'case.noVideo': 'Tarayıcınız bu videoyu oynatamıyor.',
  'lightbox.close': 'Videoyu kapat',
  'footer.note': '© 2026 Ege Özel. React, TypeScript ve Vite ile geliştirildi.',
};

export const dictionaries: Record<Locale, Record<UiKey, string>> = { en, tr };

export const statusKey: Record<Status, UiKey> = {
  live: 'status.live',
  preview: 'status.preview',
  prototype: 'status.prototype',
  inDevelopment: 'status.inDevelopment',
};

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'tr';
}

export type Translate = (key: UiKey) => string;

export function createT(locale: Locale): Translate {
  const dict = dictionaries[locale];
  return (key) => dict[key];
}

/** Path of the prerendered portfolio page for a locale. */
export function localePath(locale: Locale): string {
  return pagePath('home', locale);
}
