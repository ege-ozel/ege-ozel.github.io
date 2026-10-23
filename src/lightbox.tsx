import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { Lightbox, type LightboxItem } from './components/Lightbox';
import { previewGroup } from './preview';

type Open = (item: LightboxItem) => void;

// Outside a provider (single-component renders in tests) opening does nothing.
const LightboxContext = createContext<Open>(() => {});
const LightboxOpenContext = createContext(false);

/** Opens the shared video lightbox. */
export function useLightbox(): Open {
  return useContext(LightboxContext);
}

/** True while the lightbox shows a video, so background films can pause. */
export function useLightboxOpen(): boolean {
  return useContext(LightboxOpenContext);
}

/** Holds the one lightbox on the page and returns focus to whatever opened it. */
export function LightboxProvider({ children, closeLabel }: { children: ReactNode; closeLabel: string }) {
  const [item, setItem] = useState<LightboxItem | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback<Open>((next) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Only one film at a time: a playing card preview stops.
    const playing = previewGroup.current();
    if (playing) previewGroup.stop(playing);
    setItem(next);
  }, []);

  const close = useCallback(() => {
    setItem(null);
    opener.current?.focus();
    opener.current = null;
  }, []);

  return (
    <LightboxContext.Provider value={open}>
      <LightboxOpenContext.Provider value={item !== null}>
        {children}
        <Lightbox item={item} onClose={close} labels={{ close: closeLabel }} />
      </LightboxOpenContext.Provider>
    </LightboxContext.Provider>
  );
}
