import { useEffect, useRef, useState } from 'react';
import { hero } from '../data/hero';
import { createT } from '../i18n';
import { useLightbox, useLightboxOpen } from '../lightbox';
import type { Locale } from '../types';
import { usePreviewMode } from './PreviewVideo';

const srcSet = (base: string, widths: number[], ext: string) => widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');
const PORTRAIT = '(orientation: portrait)';

/** The TrackMesh film under the header: poster first, silent loop after hydration, full view on click. */
export function HeroVideo({ locale }: { locale: Locale }) {
  const t = createT(locale);
  const ref = useRef<HTMLVideoElement>(null);
  const mode = usePreviewMode();
  const openLightbox = useLightbox();
  const lightboxOpen = useLightboxOpen();
  // Once the film has shown a frame it stays visible, paused or not, instead of jumping back to the poster.
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  // The viewer pressed pause; nothing restarts the film until they press play.
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => setReady(true), []);

  // Same rule as the poster <source media>, so the film always matches the picture.
  const currentFile = () => (window.matchMedia(PORTRAIT).matches ? hero.portrait.video : hero.landscape.video);
  const motionAllowed = mode !== null && mode !== 'button';
  const shouldPlay = motionAllowed && !userPaused && !lightboxOpen;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    const load = () => {
      const next = currentFile();
      if (video.getAttribute('src') !== next) video.src = next;
      video.play().catch(() => {
        // Autoplay refused: the poster stays and the watch button still works.
      });
    };
    load();
    // Turning the phone switches between the 9:16 and 16:9 films.
    const query = window.matchMedia(PORTRAIT);
    query.addEventListener('change', load);
    return () => query.removeEventListener('change', load);
  }, [shouldPlay]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__frame">
        <picture>
          <source media={PORTRAIT} type="image/avif" srcSet={srcSet(hero.portrait.poster, [400, 800], 'avif')} sizes="100vw" />
          <source media={PORTRAIT} type="image/webp" srcSet={srcSet(hero.portrait.poster, [400, 800], 'webp')} sizes="100vw" />
          <source type="image/avif" srcSet={srcSet(hero.landscape.poster, [800, 1600], 'avif')} sizes="(min-width: 1100px) 1036px, 100vw" />
          <source type="image/webp" srcSet={srcSet(hero.landscape.poster, [800, 1600], 'webp')} sizes="(min-width: 1100px) 1036px, 100vw" />
          <img
            className="hero__poster"
            src={`${hero.landscape.poster}-1600.webp`}
            width={1600}
            height={900}
            alt={hero.caption[locale]}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <video
          ref={ref}
          className={started ? 'hero__video is-playing' : 'hero__video'}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          data-hydrate=""
          onPlaying={() => setStarted(true)}
        />
        <button
          type="button"
          className="watch watch--hero"
          hidden={!ready}
          onClick={() => openLightbox({ src: currentFile(), title: hero.title[locale] })}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M4 2l10 6-10 6z" />
          </svg>
          {t('hero.watch')}
        </button>
        <button
          type="button"
          className="hero__toggle"
          hidden={!ready || !motionAllowed}
          aria-pressed={!userPaused}
          aria-label={userPaused ? t('hero.play') : t('hero.pause')}
          onClick={() => setUserPaused((paused) => !paused)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            {userPaused ? <path d="M4 2l10 6-10 6z" /> : <path d="M3 2h4v12H3zM9 2h4v12H9z" />}
          </svg>
        </button>
      </div>
      <div className="hero__text">
        <h2 id="hero-title" className="hero__title">
          {hero.title[locale]}
        </h2>
        <p className="hero__caption">{hero.caption[locale]}</p>
        <a className="hero__link" href={`#${hero.projectId}-title`}>
          {t('hero.toProject')}
        </a>
      </div>
    </section>
  );
}
