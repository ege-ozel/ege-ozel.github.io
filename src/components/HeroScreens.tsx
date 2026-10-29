import { useEffect, useRef, useState } from 'react';
import { cssVars } from '../css';
import { createT } from '../i18n';
import type { Locale, Shot as ShotData } from '../types';
import { Icon } from './Icon';
import { Shot } from './Shot';

/** Where the screens start: the middle one (the meal plan) in front. */
const START = 1;
/** Movement under this many pixels is a tap, not a drag. */
const TAP = 6;
/**
 * The spring that settles the ring, in Apple's terms: a 0.55s response with a damping ratio of
 * 0.86, a barely felt overshoot. As mass-spring constants: stiffness (2π/0.55)², damping 4π·0.86/0.55.
 */
const STIFFNESS = 130;
const DAMPING = 19.6;
/** How far ahead a released drag's speed carries the snap, in seconds of travel. */
const THROW = 0.18;
/** A sideways trackpad gesture snaps once its events stop for this long. */
const WHEEL_IDLE = 120;

const mod = (value: number, n: number) => ((value % n) + n) % n;

/**
 * Grocery's three screens on a turning ring: the front one large, the others further back.
 * The ring's turn is one number, `pos`, counted in screens. A spring carries it to the next
 * whole screen; a drag or a sideways trackpad gesture moves it directly and is then thrown to the
 * nearest screen with its speed. Scrolling the page past the ring adds up to one more screen.
 * Each screen's place is an angle on itself (--a, see hero.css), written straight to its style
 * every frame, so React does not re-render while it moves.
 */
export function HeroScreens({ shots, locale }: { shots: ShotData[]; locale: Locale }) {
  const t = createT(locale);
  const n = shots.length;
  const [front, setFront] = useState(START);
  const ring = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const api = useRef<{ step: (by: number) => void } | null>(null);

  useEffect(() => {
    const el = ring.current;
    if (!el) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    let pos = START;
    let vel = 0;
    let target = START;
    let scroll = 0;
    let frame = 0;
    let last = 0;
    let shown = START;

    // One screen of turn is the distance from the front screen to a side one.
    const stepPx = () => (items.current[0]?.offsetWidth ?? 200) * 0.91;

    const paint = () => {
      const turn = pos + scroll;
      items.current.forEach((item, i) => item?.style.setProperty('--a', `${((i - turn) * 360) / n}deg`));
      const now = mod(Math.round(turn), n);
      if (now !== shown) setFront((shown = now));
    };

    const tick = (time: number) => {
      // Small fixed steps keep the spring stable when a frame comes late.
      let dt = Math.min((time - last) / 1000, 0.064);
      last = time;
      while (dt > 0) {
        const h = Math.min(dt, 1 / 240);
        vel += (-STIFFNESS * (pos - target) - DAMPING * vel) * h;
        pos += vel * h;
        dt -= h;
      }
      if (Math.abs(pos - target) < 0.0005 && Math.abs(vel) < 0.002) {
        pos = target;
        vel = 0;
        frame = 0;
      } else frame = requestAnimationFrame(tick);
      paint();
    };
    const settle = () => {
      if (still.matches) {
        pos = target;
        vel = 0;
        paint();
        return;
      }
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    // Lets go of a direct move: the speed carries on into the snap, at most one screen further.
    const release = () => {
      const base = Math.round(pos);
      target = Math.max(base - 1, Math.min(base + 1, Math.round(pos + vel * THROW)));
      settle();
    };

    api.current = {
      step(by) {
        target = Math.round(target) + by;
        settle();
      },
    };

    // Drag, with a finger or the mouse. Vertical finger moves stay with the page (touch-action:
    // pan-y in hero.css); the browser then cancels the pointer.
    let drag: { id: number; x: number; from: number; lastX: number; lastT: number; on: boolean; item: number } | null =
      null;
    const down = (event: PointerEvent) => {
      if (drag || (event.pointerType === 'mouse' && event.button !== 0)) return;
      const item = (event.target as Element).closest<HTMLElement>('.ring__item');
      drag = {
        id: event.pointerId,
        x: event.clientX,
        from: pos,
        lastX: event.clientX,
        lastT: event.timeStamp,
        on: false,
        item: item ? Number(item.dataset.index) : -1,
      };
    };
    const move = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      if (!drag.on) {
        if (Math.abs(dx) < TAP) return;
        drag.on = true;
        drag.x = event.clientX;
        drag.from = pos;
        el.setPointerCapture(event.pointerId);
        el.classList.add('is-dragging');
        stop();
        return;
      }
      const dt = Math.max((event.timeStamp - drag.lastT) / 1000, 0.001);
      const v = -(event.clientX - drag.lastX) / stepPx() / dt;
      vel = vel * 0.6 + v * 0.4;
      drag.lastX = event.clientX;
      drag.lastT = event.timeStamp;
      pos = drag.from - dx / stepPx();
      paint();
    };
    const up = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const was = drag;
      drag = null;
      el.classList.remove('is-dragging');
      if (was.on) {
        // A pause before letting go means no throw.
        if (event.timeStamp - was.lastT > 80) vel = 0;
        release();
      } else if (event.type === 'pointerup' && was.item >= 0 && was.item !== shown) {
        // A tap on a side screen brings it to the front, the short way round.
        let by = was.item - shown;
        if (by > n / 2) by -= n;
        if (by < -n / 2) by += n;
        api.current?.step(by);
      }
    };

    // A sideways trackpad gesture turns the ring and is kept from the browser, which would
    // otherwise take it as back or forward. Up and down still scroll the page.
    let wheelTimer = 0;
    let wheelT = 0;
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const dx = event.deltaX * (event.deltaMode === 1 ? 16 : 1);
      const dt = Math.max((event.timeStamp - wheelT) / 1000, 0.008);
      wheelT = event.timeStamp;
      stop();
      vel = vel * 0.6 + (dx / stepPx() / dt) * 0.4;
      pos += dx / stepPx();
      paint();
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(release, WHEEL_IDLE);
    };

    // Scrolling the page turns the ring by one screen, from when its middle passes the middle of
    // the window to when it has left at the top. Far from the window it skips the work; the
    // observer runs it once more on leaving, so the ring settles at the end of its turn.
    let near = true;
    const nearby = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        update();
      },
      { rootMargin: '50% 0px' },
    );
    nearby.observe(el);
    const onScroll = () => {
      if (near) update();
    };
    const update = () => {
      if (still.matches) {
        if (scroll) {
          scroll = 0;
          paint();
        }
        return;
      }
      const box = el.getBoundingClientRect();
      const middle = box.top + window.scrollY + box.height / 2;
      const from = Math.max(0, middle - innerHeight / 2);
      const to = middle + box.height / 2;
      const next = Math.min(1, Math.max(0, (window.scrollY - from) / (to - from)));
      if (next !== scroll) {
        scroll = next;
        if (!frame) paint();
      }
    };

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      stop();
      window.clearTimeout(wheelTimer);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('wheel', wheel);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      nearby.disconnect();
      api.current = null;
    };
  }, [n]);

  return (
    <div className="hero__screens" role="group" aria-roledescription={t('hero.carousel')} aria-label={t('hero.screens')}>
      <div className="ring" ref={ring}>
        {shots.map((shot, i) => {
          const isFront = i === front;
          return (
            <div
              key={shot.base}
              ref={(node) => {
                items.current[i] = node;
              }}
              data-index={i}
              className={isFront ? 'phone ring__item is-front' : 'phone ring__item'}
              // The place at load; from then on the script above writes --a directly.
              style={cssVars({ '--a': `${((i - START) * 360) / n}deg` })}
              aria-hidden={!isFront}
            >
              {/* The screen in front at load is the one image fetched with high priority. */}
              <Shot shot={shot} locale={locale} eager priority={i === START} />
            </div>
          );
        })}
      </div>
      {/* Back, where we are, forward: the dots say there are three screens and which is in front,
          which the arrows alone left open. Screen readers get the same as "2 / 3". */}
      <div className="ring__controls">
        <button type="button" className="ring__arrow" aria-label={t('hero.prev')} onClick={() => api.current?.step(-1)}>
          <Icon name="chevronLeft" />
        </button>
        <span className="ring__dots" aria-hidden="true">
          {shots.map((shot, i) => (
            <span key={shot.base} className={i === front ? 'ring__dot is-front' : 'ring__dot'} />
          ))}
        </span>
        <button type="button" className="ring__arrow" aria-label={t('hero.next')} onClick={() => api.current?.step(1)}>
          <Icon name="chevronRight" />
        </button>
        <p className="sr-only" aria-live="polite">
          {front + 1} / {n}
        </p>
      </div>
    </div>
  );
}
