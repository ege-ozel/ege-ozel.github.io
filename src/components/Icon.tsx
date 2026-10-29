/**
 * The site's icons, drawn as one set: a 16px grid, a 1.5px round stroke, shapes kept inside a
 * 1.5px margin. Play and pause are solid, as media controls usually are; their stroke rounds the
 * corners. Size and stroke live in base.css (.icon), so every icon sits on the text the same way.
 */
const paths = {
  chevronLeft: <path d="M10 3.5 5.5 8l4.5 4.5" />,
  chevronRight: <path d="M6 3.5 10.5 8 6 12.5" />,
  arrowLeft: <path d="M13 8H3m4-4.5L2.5 8 7 12.5" />,
  arrowsLeftRight: <path d="M2.5 8h11m-8-3-3 3 3 3m5-6 3 3-3 3" />,
  close: <path d="m4 4 8 8m0-8-8 8" />,
  // The triangle sits a little right of the middle, where it looks centred.
  play: <path d="M5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.9 2.7a.6.6 0 0 0-.9.5Z" />,
  pause: <path d="M4.5 3h2v10h-2zm5 0h2v10h-2z" />,
  monitor: <path d="M2.75 3h10.5c.7 0 1.25.55 1.25 1.25v6c0 .7-.55 1.25-1.25 1.25H2.75c-.7 0-1.25-.55-1.25-1.25v-6C1.5 3.55 2.05 3 2.75 3ZM5.5 14h5M8 11.5V14" />,
  moon: <path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1Z" />,
  // Eight rays of one length at one distance, the diagonals included.
  sun: (
    <>
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.5V3m0 10v1.5M1.5 8H3m10 0h1.5M3.4 3.4l1.06 1.06m7.08 7.08 1.06 1.06M3.4 12.6l1.06-1.06m7.08-7.08 1.06-1.06" />
    </>
  ),
};

export type IconName = keyof typeof paths;

const solid = new Set<IconName>(['play', 'pause']);

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const classes = ['icon', solid.has(name) && 'icon--solid', className].filter(Boolean).join(' ');
  return (
    <svg className={classes} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}
