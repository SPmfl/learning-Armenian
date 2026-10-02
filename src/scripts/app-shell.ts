import { applyI18n, getLang, setLang, t } from '../lib/i18n';
import { createStore, THEME_KEY } from '../lib/progress';
import type { Lang, Theme } from '../lib/types';

const root = document.documentElement;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Ruta de la app sin el `base`, para comparar con `data-nav-link`. */
function appPath(pathname: string): string {
  const stripped = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const trimmed = stripped.replace(/\/$/, '');
  return trimmed === '' ? '/' : trimmed;
}

const initialLang = getLang();
if (initialLang !== 'es') {
  root.dataset.lang = initialLang;
  root.lang = initialLang;
}
applyI18n(document);

const current = appPath(location.pathname);
document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((link) => {
  const target = link.dataset.navLink ?? '';
  const active =
    target === '/' ? current === '/' : current === target || current.startsWith(`${target}/`);
  if (active) link.setAttribute('aria-current', 'page');
});

const store = createStore();

/* ---------- tema ---------- */

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const themeButton = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const themeLabel = document.querySelector<HTMLElement>('[data-theme-label]');

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'auto' ? (prefersDark.matches ? 'dark' : 'light') : theme;
}

function paintTheme(theme: Theme): void {
  root.dataset.theme = resolveTheme(theme);
  if (themeLabel) themeLabel.textContent = t(`settings.theme.${theme}`, getLang());
  if (themeButton) themeButton.setAttribute('aria-pressed', String(theme !== 'auto'));
}

themeButton?.addEventListener('click', () => {
  const order: Theme[] = ['auto', 'light', 'dark'];
  const next = order[(order.indexOf(readTheme()) + 1) % order.length];
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* almacenamiento no disponible */
  }
  paintTheme(next);
});

prefersDark.addEventListener('change', () => {
  if (readTheme() === 'auto') paintTheme('auto');
});

/* ---------- idioma ---------- */

const langButton = document.querySelector<HTMLButtonElement>('[data-lang-toggle]');

function paintLangButton(lang: Lang): void {
  if (langButton) langButton.textContent = lang === 'es' ? 'EN' : 'ES';
}

langButton?.addEventListener('click', () => {
  const next: Lang = root.dataset.lang === 'en' ? 'es' : 'en';
  setLang(next);
  paintLangButton(next);
  paintTheme(readTheme());
  refreshStreak();
});

/* ---------- racha ---------- */

const streak = document.querySelector<HTMLElement>('[data-streak]');
const streakCounts = document.querySelectorAll<HTMLElement>('[data-streak-count]');

function refreshStreak(): void {
  const days = store.read().stats.streakDays;
  streakCounts.forEach((node) => {
    node.textContent = String(days);
  });
  if (streak) streak.hidden = days === 0;
}

/* ---------- favoritas ---------- */

const starButtons = document.querySelectorAll<HTMLButtonElement>('[data-star]');

function paintStars(): void {
  const state = store.read();
  starButtons.forEach((button) => {
    const key = button.dataset.star ?? '';
    const marked = state.starred.includes(key);
    button.setAttribute('aria-pressed', String(marked));
    button.textContent = marked ? '★' : '☆';
    button.setAttribute('aria-label', t(marked ? 'star.remove' : 'star.add', getLang()));
  });
}

starButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.star ?? '';
    store.update((state) => {
      const index = state.starred.indexOf(key);
      if (index >= 0) state.starred.splice(index, 1);
      else state.starred.push(key);
    });
  });
});

/* ---------- aviso de persistencia ---------- */

const warning = document.querySelector<HTMLElement>('[data-progress-warning]');
if (warning && !store.persistent) {
  warning.hidden = false;
  warning.title = t('progress.memoryUnavailable', getLang());
}

paintTheme(readTheme());
paintLangButton(getLang());
store.subscribe(refreshStreak);
store.subscribe(paintStars);
refreshStreak();
paintStars();
window.addEventListener('hy:lang-changed', () => {
  refreshStreak();
  paintStars();
});
