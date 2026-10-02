import { getLang, setLang } from '../lib/i18n';
import { THEME_KEY } from '../lib/progress';
import type { Lang, Theme } from '../lib/types';

const langSelect = document.querySelector<HTMLSelectElement>('#settings-lang');
const themeSelect = document.querySelector<HTMLSelectElement>('#settings-theme');

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

function applyTheme(theme: Theme): void {
  const resolved =
    theme === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;
  document.documentElement.dataset.theme = resolved;
}

if (langSelect) {
  langSelect.value = getLang();
  langSelect.addEventListener('change', () => setLang(langSelect.value as Lang));
}

if (themeSelect) {
  themeSelect.value = readTheme();
  themeSelect.addEventListener('change', () => {
    const theme = themeSelect.value as Theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* almacenamiento no disponible */
    }
    applyTheme(theme);
  });
}
