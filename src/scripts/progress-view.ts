import {
  completionMap,
  firstPending,
  unitState,
  type CurriculumMeta,
} from '../lib/curriculum';
import { getLang, STATUS_KEYS, t } from '../lib/i18n';
import { createStore } from '../lib/progress';
import { href } from '../lib/url';

function readMeta(): CurriculumMeta {
  const el = document.getElementById('curriculum-meta');
  if (!el?.textContent) return { units: [], lessons: [] };
  try {
    return JSON.parse(el.textContent) as CurriculumMeta;
  } catch {
    return { units: [], lessons: [] };
  }
}

function setRing(element: Element, fraction: number, label: string): void {
  const ring = element as HTMLElement;
  ring.style.setProperty('--ring-pct', String(fraction));
  const value = ring.querySelector('[data-ring-label]');
  if (value) value.textContent = label;
}

const store = createStore();
const meta = readMeta();

function paint(): void {
  const progress = store.read();
  const map = completionMap(meta, progress);
  const lang = getLang();

  const total = meta.lessons.length;
  const completed = meta.lessons.filter((lesson) => map[lesson.id] === 'completed').length;
  document.querySelectorAll('[data-global-ring]').forEach((wrapper) => {
    const ring = wrapper.querySelector('[data-ring]') ?? wrapper;
    setRing(ring, total > 0 ? completed / total : 0, `${completed}/${total}`);
  });

  document.querySelectorAll<HTMLElement>('[data-unit-id]').forEach((card) => {
    const unitId = card.dataset.unitId ?? '';
    const state = unitState(meta, unitId, progress);
    const ring = card.querySelector('[data-ring]');
    if (ring) setRing(ring, state.total > 0 ? state.done / state.total : 0, `${state.done}/${state.total}`);
    card.classList.toggle('is-locked', !state.unlocked);
    const lock = card.querySelector<HTMLElement>('[data-unit-lock]');
    if (lock) lock.hidden = state.unlocked;
  });

  document.querySelectorAll<HTMLElement>('[data-lesson-id]').forEach((item) => {
    const status = map[item.dataset.lessonId ?? ''] ?? 'not-started';
    const badge = item.querySelector<HTMLElement>('[data-lesson-status]');
    if (!badge) return;
    badge.dataset.i18n = STATUS_KEYS[status];
    badge.textContent = t(STATUS_KEYS[status], lang);
    badge.className = `status-badge status-badge--${status}`;
  });

  const pending = firstPending(meta, progress);
  document.querySelectorAll<HTMLAnchorElement>('[data-continue]').forEach((link) => {
    const target = pending ?? meta.lessons[0]?.id;
    if (!target) {
      link.hidden = true;
      return;
    }
    link.href = href(`/lecciones/${target}`);
    const label = link.querySelector('[data-continue-label]');
    if (label) label.textContent = t(pending ? 'home.continue' : 'home.start', lang);
  });
}

store.subscribe(paint);
window.addEventListener('hy:lang-changed', paint);
paint();
