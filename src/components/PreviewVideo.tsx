import { useCallback, useEffect, useRef, useState } from 'react';
import { type PreviewMode, previewGroup, previewMode } from '../preview';
import { Icon } from './Icon';

interface Props {
  src: string;
  labels: { play: string; pause: string };
}

/** Share of the clip that must be on screen before an in-view preview starts. */
const IN_VIEW_THRESHOLD = 0.6;

const HOVER = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Reads the viewer's pointer, motion and data settings after hydration and follows changes. */
export function usePreviewMode(): PreviewMode | null {
  // null during prerender and the first client render, so hydration matches.
  const [mode, setMode] = useState<PreviewMode | null>(null);
  useEffect(() => {
    const queries = [HOVER, REDUCED_MOTION].map((query) => window.matchMedia(query));
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const update = () =>
      setMode(
        previewMode({
          hover: queries[0].matches,
          reducedMotion: queries[1].matches,
          saveData: Boolean(connection?.saveData),
        }),
      );
    update();
    for (const query of queries) query.addEventListener('change', update);
    return () => {
      for (const query of queries) query.removeEventListener('change', update);
    };
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
  // Paused by a click on the clip: the frame stays on screen until the pointer leaves the card or
  // the clip leaves the screen, and nothing restarts it meanwhile.
  const [held, setHeld] = useState(false);
  const heldRef = useRef(false);
  const hold = useCallback((value: boolean) => {
    heldRef.current = value;
    setHeld(value);
  }, []);

  const start = useCallback(() => {
    const video = ref.current;
    if (!video) return;
    if (!video.getAttribute('src')) video.src = src;
    void previewGroup.play(video);
  }, [src]);

  const stop = useCallback(() => {
    if (ref.current) previewGroup.stop(ref.current);
  }, []);

  // Turning on reduced motion while a clip plays stops it; the button then takes over.
  useEffect(() => {
    if (mode === 'button') stop();
  }, [mode, stop]);

  useEffect(() => {
    const card = ref.current?.closest('article');
    if (mode !== 'hover' || !card) return;
    let timer = 0;
    const enter = () => {
      window.clearTimeout(timer);
      if (!heldRef.current) timer = window.setTimeout(start, 150);
    };
    const leave = () => {
      window.clearTimeout(timer);
      hold(false);
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
  }, [mode, start, stop, hold]);

  // A click (a tap on phones) on the clip pauses it on the current frame; another resumes. Buttons
  // and links in the frame keep their own clicks.
  useEffect(() => {
    const video = ref.current;
    const frame = video?.closest<HTMLElement>('.media__frame');
    if (!video || !frame || mode === null || mode === 'button') return;
    const click = (event: MouseEvent) => {
      if ((event.target as Element).closest('button, a')) return;
      if (!video.paused) {
        hold(true);
        stop();
      } else {
        hold(false);
        start();
      }
    };
    frame.addEventListener('click', click);
    frame.setAttribute('data-toggle', '');
    return () => {
      frame.removeEventListener('click', click);
      frame.removeAttribute('data-toggle');
    };
  }, [mode, start, stop, hold]);

  useEffect(() => {
    const video = ref.current;
    if (!video || mode === null) return;
    // In-view mode plays on entry; every mode stops a clip that leaves the screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) hold(false);
        if (mode === 'inView' && entry.intersectionRatio >= IN_VIEW_THRESHOLD) {
          if (!heldRef.current) start();
        } else if (!entry.isIntersecting || mode === 'inView') stop();
      },
      { threshold: [0, IN_VIEW_THRESHOLD] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [mode, start, stop, hold]);

  // While the clip plays, the frame is marked and a thin bar in the project colour tracks the clip,
  // so it is clear something is playing. The bar is one linear animation as long as the clip, run
  // by the browser off the main thread, and set to the clip's time only when that changes on its
  // own (start, pause, seek, loop), so no script runs per frame. Held on a frame, both stop there.
  const shown = playing || held;
  useEffect(() => {
    const video = ref.current;
    if (!shown || !video) return;
    const frame = video.closest('.media__frame');
    const bar = frame?.querySelector<HTMLElement>('.media__progress-fill');
    frame?.setAttribute('data-playing', '');
    if (!bar) return () => frame?.removeAttribute('data-playing');
    const run = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
      duration: 1000,
      iterations: Infinity,
      easing: 'linear',
    });
    const sync = () => {
      if (!video.duration) return run.pause();
      const length = video.duration * 1000;
      if (run.effect?.getTiming().duration !== length) run.effect?.updateTiming({ duration: length });
      // timeupdate comes a few times a second: correct only a drift the eye could see.
      const drift = Math.abs(((Number(run.currentTime) % length) - video.currentTime * 1000 + length) % length);
      if (Math.min(drift, length - drift) > 80) run.currentTime = video.currentTime * 1000;
      if (video.paused) run.pause();
      else run.play();
    };
    const events = ['playing', 'pause', 'seeked', 'loadedmetadata', 'timeupdate', 'ratechange'];
    for (const name of events) video.addEventListener(name, sync);
    sync();
    return () => {
      for (const name of events) video.removeEventListener(name, sync);
      run.cancel();
      frame?.removeAttribute('data-playing');
    };
  }, [shown]);

  return (
    <>
      <video
        ref={ref}
        className={shown ? 'media__video is-playing' : 'media__video'}
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
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
      )}
    </>
  );
}
