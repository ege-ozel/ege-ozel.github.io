import { useCallback, useEffect, useRef, useState } from 'react';
import { type PreviewMode, previewGroup, previewMode } from '../preview';

interface Props {
  src: string;
  labels: { play: string; pause: string };
}

/** Share of the clip that must be on screen before an in-view preview starts. */
const IN_VIEW_THRESHOLD = 0.6;

/** Reads the viewer's pointer, motion and data settings once, after hydration. */
export function usePreviewMode(): PreviewMode | null {
  // null during prerender and the first client render, so hydration matches.
  const [mode, setMode] = useState<PreviewMode | null>(null);
  useEffect(() => {
    const matches = (query: string) => window.matchMedia(query).matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setMode(
      previewMode({
        hover: matches('(hover: hover) and (pointer: fine)'),
        reducedMotion: matches('(prefers-reduced-motion: reduce)'),
        saveData: Boolean(connection?.saveData),
      }),
    );
  }, []);
  return mode;
}

/**
 * Silent preview over the poster. Nothing loads until the first intent: hover/focus on
 * precise pointers, scrolling into view on touch screens, otherwise an explicit button.
 */
export function PreviewVideo({ src, labels }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const mode = usePreviewMode();
  const [playing, setPlaying] = useState(false);

  const start = useCallback(() => {
    const video = ref.current;
    if (!video) return;
    if (!video.getAttribute('src')) video.src = src;
    void previewGroup.play(video);
  }, [src]);

  const stop = useCallback(() => {
    if (ref.current) previewGroup.stop(ref.current);
  }, []);

  useEffect(() => {
    const card = ref.current?.closest('article');
    if (mode !== 'hover' || !card) return;
    let timer = 0;
    const enter = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(start, 150);
    };
    const leave = () => {
      window.clearTimeout(timer);
      stop();
    };
    const focusOut = (event: FocusEvent) => {
      if (!card.contains(event.relatedTarget as Node | null)) leave();
    };
    card.addEventListener('pointerenter', enter);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('focusin', enter);
    card.addEventListener('focusout', focusOut);
    return () => {
      window.clearTimeout(timer);
      card.removeEventListener('pointerenter', enter);
      card.removeEventListener('pointerleave', leave);
      card.removeEventListener('focusin', enter);
      card.removeEventListener('focusout', focusOut);
    };
  }, [mode, start, stop]);

  useEffect(() => {
    const video = ref.current;
    if (!video || mode === null) return;
    // In-view mode plays on entry; every mode stops a clip that leaves the screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (mode === 'inView' && entry.intersectionRatio >= IN_VIEW_THRESHOLD) start();
        else if (!entry.isIntersecting || mode === 'inView') stop();
      },
      { threshold: [0, IN_VIEW_THRESHOLD] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [mode, start, stop]);

  return (
    <>
      <video
        ref={ref}
        className={playing ? 'media__video is-playing' : 'media__video'}
        muted
        playsInline
        loop
        preload="none"
        aria-hidden="true"
        data-hydrate=""
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {mode === 'button' && (
        <button
          type="button"
          className="preview-toggle"
          aria-pressed={playing}
          aria-label={playing ? labels.pause : labels.play}
          onClick={playing ? stop : start}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            {playing ? <path d="M3 2h4v12H3zM9 2h4v12H9z" /> : <path d="M4 2l10 6-10 6z" />}
          </svg>
        </button>
      )}
    </>
  );
}
