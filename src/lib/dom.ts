import { getLang, t } from './i18n';
import type { Localized } from './types';

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Texto traducible: fija la clave y el texto del idioma actual; `applyI18n` lo refresca. */
export function i18nText(node: HTMLElement, key: string, args?: Record<string, string | number>): void {
  node.dataset.i18n = key;
  if (args) node.dataset.i18nArgs = JSON.stringify(args);
  else delete node.dataset.i18nArgs;
  node.textContent = t(key, getLang(), args);
}

/** Contenido bilingüe: ambos idiomas en el DOM y el CSS decide cuál se ve. */
export function gloss(value: Localized): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const es = el('span');
  es.dataset.glossLang = 'es';
  es.textContent = value.es;
  const en = el('span');
  en.dataset.glossLang = 'en';
  en.textContent = value.en;
  fragment.append(es, en);
  return fragment;
}

/** Botón con una tecla de atajo visible que no interfiere con la traducción del rótulo. */
export function shortcutButton(shortcut: string, key: string): HTMLButtonElement {
  const button = el('button', 'btn');
  button.type = 'button';
  const badge = el('span', 'kbd', shortcut);
  badge.setAttribute('aria-hidden', 'true');
  const label = el('span');
  i18nText(label, key);
  button.append(badge, label);
  return button;
}
