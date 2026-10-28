import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  /** Heading in its own column beside the content on wide screens. */
  split?: boolean;
  children: ReactNode;
}

/** tabIndex -1 lets the skip link move focus here, not just scroll. */
export function Section({ id, title, split = false, children }: Props) {
  return (
    <section
      id={id}
      className={split ? 'section section--split' : 'section'}
      aria-labelledby={`${id}-title`}
      tabIndex={-1}
    >
      <h2 id={`${id}-title`} className="section__title">
        {title}
      </h2>
      {children}
    </section>
  );
}
