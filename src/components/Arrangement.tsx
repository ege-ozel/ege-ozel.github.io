import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cssVars } from '../css';
import { activity, activityStart, activityTaken } from '../data/activity';
import { projects } from '../data/projects';
import { createT } from '../i18n';
import type { Locale } from '../types';
import { Icon } from './Icon';

export type Kind = 'web' | 'desktop' | 'audio';
export const kinds: readonly Kind[] = ['web', 'desktop', 'audio'];

/** What each project runs on, for the words above the timeline. */
const runsOn: Record<string, Kind[]> = {
  grocery: ['web'],
  trackmesh: ['desktop', 'audio'],
  metronome: ['web', 'desktop', 'audio'],
  'interval-timer': ['web', 'desktop'],
  desktuk: ['desktop'],
  wsm: ['desktop'],
  'voice-type': ['desktop', 'audio'],
};

/**
 * Each project's note, from A minor pentatonic, so any weeks that sound together form a chord
 * that fits: A3, C4, D4, E4, G4, A4, C5.
 */
const notes: Record<string, number> = {
  grocery: 220,
  'interval-timer': 261.63,
  wsm: 293.66,
  trackmesh: 329.63,
  desktuk: 392,
  metronome: 440,
  'voice-type': 523.25,
};

const DAY = 24 * 3600 * 1000;
const WEEK = 7 * DAY;
/** One week of the timeline per beat while it plays. */
const BEAT = 200;
/** Weeks with a gap of this many quiet weeks or fewer stay one clip. */
const GAP = 2;

const start = Date.parse(`${activityStart}T00:00:00Z`);
const weeks = activity[0]?.counts.length ?? 0;
const peak = Math.max(1, ...activity.flatMap((lane) => lane.counts));
/** Where the playhead rests: the day the counts were taken, as a share of the timeline. */
const now = Math.min(0.995, (Date.parse(`${activityTaken}T00:00:00Z`) - start) / (weeks * WEEK));
const lastWeek = Math.min(weeks - 1, Math.floor(now * weeks));

interface Clip {
  from: number;
  /** Commits per week inside the clip; quiet weeks inside it are 0. */
  bars: number[];
}

/** Runs of active weeks, with short quiet stretches inside a run kept in it. */
function clipsOf(counts: number[]): Clip[] {
  const clips: Clip[] = [];
  let i = 0;
  while (i < counts.length) {
    if (!counts[i]) {
      i++;
      continue;
    }
    let last = i;
    let j = i;
    while (j < counts.length && (counts[j] || j - last <= GAP)) {
      if (counts[j]) last = j;
      j++;
    }
    clips.push({ from: i, bars: counts.slice(i, last + 1) });
    i = last + 1;
  }
  return clips;
}

/** Month labels: where each month starts, as a share of the timeline. */
function months(locale: Locale) {
  const format = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  const end = start + weeks * WEEK;
  const out: { at: number; label: string }[] = [];
  const day = new Date(start);
  day.setUTCDate(1);
  for (let m = day.getTime(); m < end; ) {
    const at = Math.max(0, (m - start) / (end - start));
    if (at < 0.97) out.push({ at, label: format.format(new Date(m)) });
    const next = new Date(m);
    next.setUTCMonth(next.getUTCMonth() + 1);
    m = next.getTime();
  }
  return out;
}

/** Whether a new month begins in this week: the metronome accents it. */
function monthStarts(week: number) {
  if (week === 0) return true;
  return new Date(start + (week - 1) * WEEK).getUTCMonth() !== new Date(start + week * WEEK).getUTCMonth();
}

/** The sound: one shared audio graph, made on the first press (browsers allow sound only then). */
let audio: { ctx: AudioContext; out: GainNode } | null = null;
function sound() {
  if (!audio) {
    const Context =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return null;
    const ctx = new Context();
    const warm = ctx.createBiquadFilter();
    warm.type = 'lowpass';
    warm.frequency.value = 2600;
    const out = ctx.createGain();
    out.gain.value = 0.7;
    out.connect(warm).connect(ctx.destination);
    audio = { ctx, out };
  }
  if (audio.ctx.state === 'suspended') void audio.ctx.resume();
  return audio;
}

/** One week's sound at time `at`: a quiet tick, and each active project's note, louder for more commits. */
function playWeek(week: number, at: number, bus: AudioNode, ctx: AudioContext, kind: Kind | null) {
  const accent = monthStarts(week);
  const tick = ctx.createOscillator();
  const tickLevel = ctx.createGain();
  tick.frequency.value = accent ? 2400 : 1800;
  tickLevel.gain.setValueAtTime(0.0001, at);
  tickLevel.gain.exponentialRampToValueAtTime(accent ? 0.08 : 0.04, at + 0.002);
  tickLevel.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
  tick.connect(tickLevel).connect(bus);
  tick.start(at);
  tick.stop(at + 0.04);
  for (const lane of activity) {
    const count = lane.counts[week] ?? 0;
    if (!count || (kind && !(runsOn[lane.id] ?? []).includes(kind))) continue;
    const level = 0.03 + 0.16 * Math.sqrt(count / peak);
    const voice = ctx.createGain();
    voice.gain.setValueAtTime(0.0001, at);
    voice.gain.exponentialRampToValueAtTime(level, at + 0.006);
    voice.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    voice.connect(bus);
    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.value = notes[lane.id] ?? 440;
    const shine = ctx.createOscillator();
    shine.frequency.value = (notes[lane.id] ?? 440) * 2;
    const shineLevel = ctx.createGain();
    shineLevel.gain.value = 0.25;
    body.connect(voice);
    shine.connect(shineLevel).connect(voice);
    for (const osc of [body, shine]) {
      osc.start(at);
      osc.stop(at + 0.52);
    }
  }
}

/**
 * My projects as an arrangement in a music app: a lane per project, a clip for each stretch of
 * work, and inside each clip one bar per week, as tall as that week's commits. The timeline is
 * also an instrument. Each project has a note; a week sounds the notes of the projects worked on
 * that week, louder for more commits, over a quiet metronome tick. Play sweeps the playhead to
 * today; the ruler can be dragged (or stepped with the arrow keys) to hear and read any week.
 * The words above (in QuickScan) dim, and silence, the projects that do not run there.
 */
export function Arrangement({ locale, kind }: { locale: Locale; kind: Kind | null }) {
  const t = createT(locale);
  const [playing, setPlaying] = useState(false);
  const [week, setWeek] = useState(lastWeek);
  const [touched, setTouched] = useState(false);
  const box = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const run = useRef<{ stop: () => void } | null>(null);
  const kindRef = useRef(kind);
  kindRef.current = kind;
  const pos = useRef(now);
  const drag = useRef<number | null>(null);

  useEffect(() => () => run.current?.stop(), []);

  /** Moves the playhead without React: a transform on a rail-wide element, and the lit weeks. */
  const place = (at: number) => {
    pos.current = at;
    head.current?.style.setProperty('--pos', String(at));
    box.current?.style.setProperty('--cur', String(Math.min(weeks - 1, Math.floor(at * weeks))));
  };

  const hear = (w: number) => {
    const a = sound();
    if (a) playWeek(w, a.ctx.currentTime + 0.005, a.out, a.ctx, kindRef.current);
  };

  const stop = () => {
    run.current?.stop();
    run.current = null;
    setPlaying(false);
  };

  const play = () => {
    if (playing) return stop();
    setTouched(true);
    const from = Math.floor(pos.current * weeks) >= lastWeek ? 0 : Math.floor(pos.current * weeks);
    const span = lastWeek - from + 1;
    const length = span * BEAT;
    const startAt = from / weeks;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    place(startAt);
    setWeek(from);

    // The playhead runs on the compositor; the clicks and notes run on the audio clock.
    const sweep = still
      ? null
      : head.current?.animate(
          [{ transform: `translateX(${startAt * 100}%)` }, { transform: `translateX(${now * 100}%)` }],
          { duration: length, easing: 'linear' },
        );
    const a = sound();
    const bus = a?.ctx.createGain();
    if (a && bus) {
      bus.connect(a.out);
      const t0 = a.ctx.currentTime + 0.05;
      for (let w = from; w <= lastWeek; w++) playWeek(w, t0 + ((w - from) * BEAT) / 1000, bus, a.ctx, kindRef.current);
    }
    // The lit weeks and the readout follow the beat.
    const timers: number[] = [];
    for (let w = from; w <= lastWeek; w++) {
      timers.push(
        window.setTimeout(() => {
          box.current?.style.setProperty('--cur', String(w));
          setWeek(w);
        }, 50 + (w - from) * BEAT),
      );
    }
    const done = window.setTimeout(() => {
      place(now);
      stop();
    }, length + 120);
    run.current = {
      stop() {
        timers.forEach((id) => window.clearTimeout(id));
        window.clearTimeout(done);
        if (sweep) {
          // Leave the playhead where it was when stopped.
          const at = getComputedStyle(head.current as Element).transform;
          sweep.cancel();
          const m = /matrix\(([^)]+)\)/.exec(at);
          const width = rail.current?.getBoundingClientRect().width ?? 1;
          if (m) place(Math.max(0, Math.min(now, Number(m[1].split(',')[4]) / width)));
        }
        bus?.disconnect();
      },
    };
    setPlaying(true);
  };

  /** Dragging the ruler: the playhead follows, and each new week sounds and shows its commits. */
  const seek = (clientX: number) => {
    const r = rail.current?.getBoundingClientRect();
    if (!r) return;
    const at = Math.max(0, Math.min(now, (clientX - r.left) / r.width));
    place(at);
    const w = Math.min(lastWeek, Math.floor(at * weeks));
    if (w !== drag.current) {
      drag.current = w;
      setWeek(w);
      hear(w);
    }
  };
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (playing) stop();
    setTouched(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = null;
    seek(event.clientX);
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) seek(event.clientX);
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, PageDown: -4, PageUp: 4 };
    let w = week;
    if (event.key in steps) w += steps[event.key];
    else if (event.key === 'Home') w = 0;
    else if (event.key === 'End') w = lastWeek;
    else return;
    event.preventDefault();
    if (playing) stop();
    setTouched(true);
    w = Math.max(0, Math.min(lastWeek, w));
    place(Math.min(now, (w + 0.5) / weeks));
    setWeek(w);
    hear(w);
  };

  const byId = new Map(projects.map((project) => [project.id, project]));
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const weekName = t('arr.week').replace('{d}', day.format(new Date(start + week * WEEK)));
  const worked = activity
    .filter((lane) => lane.counts[week])
    .map((lane) => `${byId.get(lane.id)?.title ?? lane.id} ${lane.counts[week]}`);
  const readout = `${weekName}: ${worked.length ? worked.join(', ') : t('arr.quiet')}`;
  const live = touched && (playing || week < lastWeek);

  return (
    <section
      ref={box}
      className={['arr', playing && 'is-playing', live && 'is-live'].filter(Boolean).join(' ')}
      aria-labelledby="arr-title"
      style={cssVars({ '--cur': String(lastWeek) })}
    >
      <div className="arr__head">
        <h2 id="arr-title" className="arr__title">
          {t('arr.title')}
        </h2>
        <p className="arr__note" aria-live="polite">
          {touched ? readout : t('arr.note')}
        </p>
        <button type="button" className="arr__play" aria-pressed={playing} onClick={play}>
          <Icon name={playing ? 'pause' : 'play'} />
          {playing ? t('arr.stop') : t('arr.play')}
        </button>
      </div>
      <div className="arr__body">
        <div
          className="arr__ruler"
          role="slider"
          tabIndex={0}
          aria-label={t('arr.seek')}
          aria-valuemin={0}
          aria-valuemax={lastWeek}
          aria-valuenow={week}
          aria-valuetext={weekName}
          onPointerDown={down}
          onPointerMove={move}
          onKeyDown={key}
        >
          {months(locale).map((month) => (
            <span key={month.label} aria-hidden="true" style={cssVars({ '--at': String(month.at) })}>
              {month.label}
            </span>
          ))}
        </div>
        <ol className="arr__lanes">
          {activity.map((lane) => {
            const project = byId.get(lane.id);
            if (!project) return null;
            const total = lane.counts.reduce((sum, n) => sum + n, 0);
            const dim = kind !== null && !(runsOn[lane.id] ?? []).includes(kind);
            return (
              <li key={lane.id} className={dim ? 'arr__lane is-dim' : 'arr__lane'} style={cssVars({ '--c': project.accent })}>
                <a href={`#${lane.id}`} className="arr__link">
                  <span className="arr__name">
                    <strong>{project.title}</strong>
                    <span>
                      {total} {t('arr.commits')}
                    </span>
                  </span>
                  <span className="arr__track" aria-hidden="true">
                    {clipsOf(lane.counts).map((clip) => (
                      <span
                        key={clip.from}
                        className="arr__clip"
                        style={cssVars({ '--from': String(clip.from / weeks), '--span': String(clip.bars.length / weeks) })}
                      >
                        {clip.bars.map((count, i) => (
                          <i
                            key={i}
                            className={count ? 'arr__bar' : 'arr__bar arr__bar--quiet'}
                            style={cssVars({
                              '--h': String(count ? Math.max(0.12, Math.sqrt(count / peak)) : 0.04),
                              '--w': String(clip.from + i),
                            })}
                          />
                        ))}
                      </span>
                    ))}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
        <div className="arr__rail" ref={rail} aria-hidden="true">
          <span className="arr__head-line" ref={head} style={cssVars({ '--pos': String(now) })} />
        </div>
      </div>
    </section>
  );
}
