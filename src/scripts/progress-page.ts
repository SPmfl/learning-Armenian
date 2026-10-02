import { el, i18nText } from '../lib/dom';
import { addDays, createStore, todayKey } from '../lib/progress';
import { isDue } from '../lib/srs';

const store = createStore();
const WEEKS = 26;

function setStat(key: string, value: string): void {
  const node = document.querySelector(`[data-stat="${key}"]`);
  if (node) node.textContent = value;
}

function heatLevel(count: number): number {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

function paint(): void {
  const state = store.read();
  const now = new Date();
  const cards = Object.values(state.cards);
  const answered = state.stats.exercisesAnswered;
  const correct = state.stats.exercisesCorrect;

  setStat('streak', String(state.stats.streakDays));
  setStat('answered', String(answered));
  setStat('accuracy', answered > 0 ? `${Math.round((correct / answered) * 100)}%` : '—');
  setStat('cards', String(cards.length));
  setStat('due', String(cards.filter((card) => isDue(card, now)).length));

  const boxes = document.querySelector('[data-boxes]');
  if (boxes) {
    boxes.replaceChildren();
    for (let box = 0; box <= 5; box++) {
      const chip = el('div', 'stat');
      chip.append(el('div', 'stat__value', String(cards.filter((card) => card.box === box).length)));
      const label = el('div', 'stat__label');
      i18nText(label, 'progress.box', { n: box });
      chip.append(label);
      boxes.append(chip);
    }
  }

  const heatmap = document.querySelector('[data-heatmap]');
  if (heatmap) {
    heatmap.replaceChildren();
    const days = 7 * WEEKS;
    const start = addDays(now, -(days - 1));
    for (let index = 0; index < days; index++) {
      const key = todayKey(addDays(start, index));
      const count = state.stats.history[key] ?? 0;
      const cell = el('span', 'heatmap__cell');
      cell.dataset.level = String(heatLevel(count));
      cell.title = `${key}: ${count}`;
      heatmap.append(cell);
    }
  }
}

store.subscribe(paint);
window.addEventListener('hy:lang-changed', paint);
paint();
