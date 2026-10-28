import type { Locale, Shot as ShotData } from '../types';

interface Props {
  shot: ShotData;
  locale: Locale;
  /** Above the fold: load at once. `priority` also raises the fetch priority (one image per page). */
  eager?: boolean;
  priority?: boolean;
}

/** A real 390×844 phone screen from the Grocery recording, AVIF with a WebP fallback. */
export function Shot({ shot, locale, eager = false, priority = false }: Props) {
  return (
    <picture>
      <source type="image/avif" srcSet={`${shot.base}-390.avif`} />
      <source type="image/webp" srcSet={`${shot.base}-390.webp`} />
      <img
        className="shot"
        src={`${shot.base}-390.webp`}
        width={390}
        height={844}
        alt={shot.alt[locale]}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  );
}
