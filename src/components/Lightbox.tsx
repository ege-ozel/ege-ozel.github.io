import { useEffect, useRef } from 'react';
import { Icon } from './Icon';

export interface LightboxItem {
  src: string;
  title: string;
  /** A still picture instead of a video; the alt text describes it. */
  image?: { alt: string; width: number; height: number };
  /** A portrait clip, such as a phone recording: the dialog takes the video's width. */
  tall?: boolean;
}

interface Props {
  item: LightboxItem | null;
  onClose(): void;
  labels: { close: string };
}

/**
 * A native modal dialog with one video or one picture. The browser traps focus and closes it on Escape;
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
      className={item?.image ? 'lightbox lightbox--image' : item?.tall ? 'lightbox lightbox--tall' : 'lightbox'}
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
            <Icon name="close" />
          </button>
          {item.image ? (
            <img
              key={item.src}
              src={item.src}
              alt={item.image.alt}
              width={item.image.width}
              height={item.image.height}
              className="lightbox__image"
            />
          ) : (
            <video ref={video} key={item.src} src={item.src} controls autoPlay muted playsInline className="lightbox__video" />
          )}
          <p className="lightbox__title">{item.title}</p>
        </div>
      )}
    </dialog>
  );
}
