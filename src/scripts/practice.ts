import { el, gloss, i18nText, shortcutButton } from '../lib/dom';
import { applyI18n } from '../lib/i18n';
import { createStore, recordCardGrade, recordFreeGrade } from '../lib/progress';
import { isDue, review, sessionQueue } from '../lib/srs';
import type { Rating, VocabCard } from '../lib/types';

type Payload = {
  pool: VocabCard[];
  units: Array<{ id: string; es: string; en: string }>;
  tags: string[];
};

const RATINGS: Array<[Rating, string]> = [
  ['again', 'practice.again'],
  ['hard', 'practice.hard'],
  ['good', 'practice.good'],
  ['easy', 'practice.easy'],
];

const dataScript = document.getElementById('practice-pool');
const formElement = document.getElementById('practice-controls');
const sessionElement = document.getElementById('practice-session');

if (dataScript?.textContent && formElement instanceof HTMLFormElement && sessionElement) {
  const payload = JSON.parse(dataScript.textContent) as Payload;
  const store = createStore();
  const form = formElement;
  const session = sessionElement;
  const modeSelect = form.querySelector<HTMLSelectElement>('#practice-mode');
  const sourceSelect = form.querySelector<HTMLSelectElement>('#practice-source');
  const sizeSelect = form.querySelector<HTMLSelectElement>('#practice-size');

  let mode: 'review' | 'free' = 'review';
  let queue: VocabCard[] = [];
  let cursor = 0;
  let current: VocabCard | null = null;
  let counts: Record<Rating, number> = { again: 0, hard: 0, good: 0, easy: 0 };

  function filterPool(): VocabCard[] {
    const value = sourceSelect?.value ?? 'all';
    if (value === 'all') return payload.pool;
    if (value === 'starred') {
      const starred = new Set(store.read().starred);
      return payload.pool.filter((card) => starred.has(card.key));
    }
    if (value.startsWith('unit:')) {
      const unitId = value.slice('unit:'.length);
      return payload.pool.filter((card) => card.unitId === unitId);
    }
    if (value.startsWith('tag:')) {
      const tag = value.slice('tag:'.length);
      return payload.pool.filter((card) => card.tags.includes(tag));
    }
    return payload.pool;
  }

  function start(): void {
    mode = modeSelect?.value === 'free' ? 'free' : 'review';
    const limit = Number(sizeSelect?.value ?? '20');
    const pool = filterPool();
    queue =
      mode === 'review'
        ? sessionQueue(pool, store.read().cards, new Date(), limit)
        : limit > 0
          ? pool.slice(0, limit)
          : pool;
    cursor = 0;
    counts = { again: 0, hard: 0, good: 0, easy: 0 };
    render();
  }

  function grade(rating: Rating, card: VocabCard): void {
    counts[rating] += 1;
    const now = new Date();
    if (mode === 'review') {
      store.update((state) =>
        recordCardGrade(state, card.key, review(state.cards[card.key], rating, now), now),
      );
    } else {
      store.update((state) => recordFreeGrade(state, now));
    }
    if (rating === 'again') queue.push(card);
    cursor += 1;
    render();
  }

  function renderSummary(): void {
    const box = el('div', 'card');
    const title = el('h2');
    i18nText(title, 'practice.finished');
    box.append(title);

    const total = counts.again + counts.hard + counts.good + counts.easy;
    const line = el('p');
    const summary = el('span');
    i18nText(summary, 'practice.summary', {
      total,
      again: counts.again,
      good: counts.good,
      easy: counts.easy,
    });
    line.append(summary);
    box.append(line);

    const again = el('button', 'btn btn--primary');
    again.type = 'button';
    i18nText(again, 'practice.newSession');
    again.addEventListener('click', start);
    box.append(again);

    session.replaceChildren(box);
    applyI18n(session);
  }

  function render(): void {
    if (payload.pool.length === 0) {
      const empty = el('p', 'notice');
      i18nText(empty, 'practice.needReview');
      session.replaceChildren(empty);
      applyI18n(session);
      return;
    }
    if (queue.length === 0) {
      const empty = el('p', 'notice');
      i18nText(empty, 'practice.empty');
      session.replaceChildren(empty);
      applyI18n(session);
      return;
    }
    if (cursor >= queue.length) {
      renderSummary();
      return;
    }

    current = queue[cursor];
    const card = current;
    const now = new Date();
    const state = store.read().cards[card.key];

    const cardBox = el('div', 'card');

    const top = el('div', 'row-between');
    const badge = el('span', 'status-badge');
    if (mode === 'review') {
      i18nText(badge, !state || isDue(state, now) ? 'practice.due' : 'practice.fresh');
    } else {
      badge.textContent = card.lessonId;
      badge.classList.add('muted');
    }
    const pending = el('span', 'muted');
    i18nText(pending, 'practice.pending', { n: queue.length - cursor });
    top.append(badge, pending);

    const bar = el('progress', 'progress-bar');
    bar.max = queue.length;
    bar.value = cursor;

    const face = el('div', 'flashcard__face');
    face.append(el('p', 'hy-lg', card.hy));
    const back = el('div');
    back.hidden = true;
    back.append(el('p', 'muted', card.roman));
    const meaning = el('p');
    meaning.append(gloss({ es: card.es, en: card.en }));
    back.append(meaning);
    face.append(back);

    const flashcard = el('div', 'flashcard');
    flashcard.append(face);

    const actions = el('div', 'exercise__actions');
    const show = el('button', 'btn btn--primary');
    show.type = 'button';
    i18nText(show, 'action.show');

    const grades = el('div', 'flashcard__grades');
    grades.hidden = true;
    RATINGS.forEach(([rating, key], index) => {
      const button = shortcutButton(String(index + 1), key);
      button.addEventListener('click', () => grade(rating, card));
      grades.append(button);
    });

    const reveal = (): void => {
      back.hidden = false;
      show.hidden = true;
      grades.hidden = false;
      (grades.querySelector('button') as HTMLButtonElement | null)?.focus();
    };
    show.addEventListener('click', reveal);

    flashcard.addEventListener('keydown', (event) => {
      if (event.key === ' ' && back.hidden) {
        event.preventDefault();
        reveal();
        return;
      }
      if (!grades.hidden) {
        const option = RATINGS[Number(event.key) - 1];
        if (option) {
          event.preventDefault();
          grade(option[0], card);
        }
      }
    });

    actions.append(show, grades);
    cardBox.append(top, bar, flashcard, actions);
    session.replaceChildren(cardBox);
    applyI18n(session);
    show.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    start();
  });

  window.addEventListener('hy:lang-changed', () => {
    applyI18n(session);
    applyI18n(form);
  });

  const message = el('p', 'notice');
  i18nText(message, 'practice.empty');
  session.replaceChildren(message);
  applyI18n(session);
}
