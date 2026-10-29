import { useEffect, useState } from 'react';
import { createT } from '../i18n';
import { useLightbox } from '../lightbox';
import type { Device, Locale, Poster as PosterData, Project } from '../types';
import { Icon } from './Icon';
import { PreviewVideo } from './PreviewVideo';

const POSTER = {
  desktop: { widths: [800, 1600], width: 1600, height: 1000, sizes: '(min-width: 960px) 760px, 100vw' },
  mobile: { widths: [400, 800], width: 800, height: 1733, sizes: '(min-width: 960px) 240px, 45vw' },
} as const;

function Poster({ poster, device, alt, eager }: { poster: PosterData; device: Device; alt: string; eager: boolean }) {
  const spec = POSTER[device];
  const srcSet = (ext: string) => spec.widths.map((w) => `${poster.base}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={spec.sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={spec.sizes} />
      <img
        src={`${poster.base}-${spec.widths[1]}.webp`}
        width={spec.width}
        height={spec.height}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  );
}

interface Props {
  project: Project;
  locale: Locale;
  eager: boolean;
}

export function ProjectMedia({ project, locale, eager }: Props) {
  const t = createT(locale);
  const openLightbox = useLightbox();
  // The watch button only works after hydration, so it stays hidden in the prerendered page.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const video = project.poster ? project.video : undefined;
  const preview = video && <PreviewVideo src={video} labels={{ play: t('media.play'), pause: t('media.pause') }} />;
  return (
    <div className={`media media--${project.device}`}>
      <div className="media__frame">
        <div className="media__screen">
          {project.poster ? (
            project.device === 'mobile' ? (
              // Poster and clip share one phone frame, so the clip lands exactly on the poster.
              <div className="media__phone">
                <Poster poster={project.poster} device="mobile" alt={project.poster.alt[locale]} eager={eager} />
                {preview}
              </div>
            ) : (
              <>
                <Poster poster={project.poster} device="desktop" alt={project.poster.alt[locale]} eager={eager} />
                {preview}
              </>
            )
          ) : (
            <p className="media__empty">{t('media.empty')}</p>
          )}
          {video && (
            <span className="media__progress" aria-hidden="true">
              <span className="media__progress-fill" />
            </span>
          )}
          {video && (
            <button
              type="button"
              className="watch"
              hidden={!ready}
              onClick={() => openLightbox({ src: video, title: project.title, tall: project.device === 'mobile' })}
            >
              <Icon name="play" />
              {t('media.watch')}
              <span className="sr-only">: {project.title}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
