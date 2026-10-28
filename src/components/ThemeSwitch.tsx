import { createT } from '../i18n';
import { Icon } from './Icon';
import type { Locale } from '../types';

const choices = ['system', 'dark', 'light'] as const;

const icons = { system: 'monitor', dark: 'moon', light: 'sun' } as const;

/**
 * System, dark or light. The inline script in index.html applies the saved choice before the
 * first paint, sets aria-pressed on these buttons and handles their clicks, so the switch also
 * works on the static case study page, which loads no script bundle.
 */
export function ThemeSwitch({ locale }: { locale: Locale }) {
  const t = createT(locale);
  return (
    <div className="switch switch--theme" role="group" aria-label={t('theme.label')}>
      <span className="switch__pill" aria-hidden="true" />
      {choices.map((choice) => (
        <button key={choice} type="button" data-theme-choice={choice} aria-label={t(`theme.${choice}`)} title={t(`theme.${choice}`)}>
          <Icon name={icons[choice]} />
        </button>
      ))}
    </div>
  );
}
