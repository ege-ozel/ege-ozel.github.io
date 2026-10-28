import { useEffect, useState, type MouseEvent } from 'react';

interface Props {
  email: string;
  label: string;
  copied: string;
}

/**
 * Copies the address instead of opening a mail app, which many visitors don't have set up.
 * Without script, or if the clipboard is blocked, it stays a plain mailto link.
 */
export function CopyEmail({ email, label, copied }: Props) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setDone(false), 2000);
    return () => clearTimeout(id);
  }, [done]);

  async function copy(event: MouseEvent<HTMLAnchorElement>) {
    if (!navigator.clipboard) return;
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setDone(true);
    } catch {
      location.href = `mailto:${email}`;
    }
  }

  return (
    <a className="btn" href={`mailto:${email}`} onClick={copy} title={email}>
      <span aria-live="polite">{done ? copied : label}</span>
    </a>
  );
}
