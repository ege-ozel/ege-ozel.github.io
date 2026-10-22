import { useEffect, useRef } from 'react';

export interface LightboxItem {
  src: string;
  title: string;
}

interface Props {
  item: LightboxItem | null;
  onClose(): void;
  labels: { close: string };
}

/**
 * A native modal dialog with one video. The browser traps focus and closes it on Escape;
 * a click on the backdrop or the close button closes it too.
 */
export function Lightbox({ item, onClose, labels }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (item && !element.open) element.showModal();
    if (!item && element.open) element.close();
  }, [item]);

  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label={item?.title}
      onClose={() => {
        video.current?.pause();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      {item && (
        <div className="lightbox__body">
          <button type="button" className="lightbox__close" aria-label={labels.close} onClick={() => dialog.current?.close()}>
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
          <video ref={video} key={item.src} src={item.src} controls autoPlay muted playsInline className="lightbox__video" />
          <p className="lightbox__title">{item.title}</p>
        </div>
      )}
    </dialog>
  );
}
