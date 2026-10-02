import { el, gloss, i18nText, shortcutButton } from '../lib/dom';
import { checkExercise, type CheckResult } from '../lib/exercises';
import { applyI18n, getLang, STATUS_KEYS, t } from '../lib/i18n';
import { createStore, deriveLessonStatus, recordAnswer } from '../lib/progress';
import { romanize } from '../lib/translit';
import type { Exercise, Rating } from '../lib/types';

type Prerequisite = { id: string; exerciseCount: number };

type Payload = {
  lessonId: string;
  unitId: string;
  exercises: Exercise[];
  nextHref: string | null;
  prerequisites: Prerequisite[];
};

const RATING_OPTIONS: Array<[Rating, string]> = [
  ['again', 'practice.again'],
  ['hard', 'practice.hard'],
  ['good', 'practice.good'],
  ['easy', 'practice.easy'],
];

function romanHint(exercise: Exercise): string | null {
  return exercise.type === 'typing' || exercise.type === 'fill-blank'
    ? romanize(exercise.answer[0] ?? '')
    : null;
}

function mount(root: HTMLElement, payload: Payload): void {
  const store = createStore();
  const byId = new Map(payload.exercises.map((exercise) => [exercise.id, exercise]));
  const total = payload.exercises.length;

  const keyboard = document.querySelector<HTMLElement>('[data-hy-keyboard]');
  const lockNotice = document.querySelector<HTMLElement>('[data-lock-notice]');
  const bypass = document.querySelector<HTMLButtonElement>('[data-bypass-lock]');
  const statusBadge = document.querySelector<HTMLElement>('[data-lesson-status]');

  const bar = el('progress', 'progress-bar');
  bar.max = Math.max(total, 1);
  bar.value = 0;
  const counter = el('span');
  const counterLine = el('p', 'muted');
  counterLine.append(counter);
  const header = el('div', 'runner-header');
  header.append(bar, counterLine);

  const card = el('div');
  const summary = el('div');
  root.replaceChildren(header, card, summary);

  let queue = payload.exercises.map((exercise) => exercise.id);
  let cursor = 0;
  const results = new Map<string, boolean>();
  let activeInput: HTMLInputElement | null = null;

  /* ---------- armenio en pantalla ---------- */

  function insertAtCursor(input: HTMLInputElement, text: string): void {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    const caret = start + text.length;
    input.setSelectionRange(caret, caret);
  }

  function deleteBackwards(input: HTMLInputElement): void {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    if (start !== end) {
      input.value = input.value.slice(0, start) + input.value.slice(end);
      input.setSelectionRange(start, start);
    } else if (start > 0) {
      input.value = input.value.slice(0, start - 1) + input.value.slice(start);
      input.setSelectionRange(start - 1, start - 1);
    }
  }

  keyboard?.addEventListener('click', (event) => {
    if (!activeInput) return;
    const target = event.target as HTMLElement;
    if (target.closest('[data-hy-backspace]')) deleteBackwards(activeInput);
    else if (target.closest('[data-hy-space]')) insertAtCursor(activeInput, ' ');
    else {
      const key = target.closest<HTMLElement>('[data-hy-char]');
      if (key?.dataset.hyChar) insertAtCursor(activeInput, key.dataset.hyChar);
    }
    activeInput.focus();
  });

  /* ---------- estado ---------- */

  function isSolved(exerciseId: string): boolean {
    const result = store.read().lessons[payload.lessonId]?.exercises[exerciseId];
    return Boolean(result && result.correct >= 1);
  }

  function refreshStatus(): void {
    if (!statusBadge) return;
    const status = deriveLessonStatus(store.read().lessons[payload.lessonId], total);
    statusBadge.dataset.i18n = STATUS_KEYS[status];
    statusBadge.textContent = t(STATUS_KEYS[status], getLang());
    statusBadge.className = `status-badge status-badge--${status}`;
  }

  function updateHeader(): void {
    bar.value = Math.min(cursor, total);
    i18nText(counter, 'exercise.progress', {
      n: Math.min(cursor + 1, Math.max(total, 1)),
      total,
    });
  }

  function record(exerciseId: string, correct: boolean): void {
    store.update((state) =>
      recordAnswer(state, payload.lessonId, exerciseId, correct, total, new Date()),
    );
    results.set(exerciseId, correct);
    refreshStatus();
  }

  function showFeedback(box: HTMLElement, result: CheckResult): void {
    box.classList.toggle('is-correct', result.correct);
    box.classList.toggle('is-wrong', !result.correct);
    box.replaceChildren();
    const headline = el('strong');
    i18nText(headline, result.correct ? 'state.correct' : 'state.wrong');
    box.append(headline);
    if (!result.correct) {
      const answer = el('span');
      i18nText(answer, 'state.answer', { answer: result.expected });
      const line = el('p');
      line.append(answer);
      box.append(line);
    }
  }

  /* ---------- ejercicio ---------- */

  function buildExerciseCard(exercise: Exercise): HTMLElement {
    const solved = isSolved(exercise.id);
    const needsText = exercise.type === 'typing' || exercise.type === 'fill-blank';
    const isFlashcard = exercise.type === 'flashcard';

    const prompt = el('p', 'exercise__prompt');
    prompt.append(gloss(exercise.prompt));

    const body = el('div');
    const hintBox = el('p', 'exercise__hint');
    hintBox.hidden = true;
    const feedback = el('div', 'exercise__feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');

    const checkButton = el('button', 'btn btn--primary');
    checkButton.type = 'button';
    i18nText(checkButton, 'action.check');
    const hintButton = el('button', 'btn btn--ghost');
    hintButton.type = 'button';
    i18nText(hintButton, 'action.hint');
    const nextButton = el('button', 'btn');
    nextButton.type = 'button';
    i18nText(nextButton, 'action.next');
    nextButton.hidden = true;
    const showButton = el('button', 'btn btn--primary');
    showButton.type = 'button';
    i18nText(showButton, 'action.show');
    showButton.hidden = !isFlashcard || solved;
    const grades = el('div', 'flashcard__grades');
    grades.hidden = true;
    const controls = el('div', 'exercise__actions');
    controls.append(checkButton, hintButton, showButton, nextButton, grades);

    const wrapper = el('div', 'exercise');
    wrapper.append(prompt, body, hintBox, feedback, controls);

    let read: () => unknown = () => null;
    let lock: () => void = () => {};
    let reveal: (() => void) | null = null;

    if (exercise.type === 'multiple-choice') {
      const list = el('ul', 'choice-list');
      exercise.options.forEach((option, index) => {
        const item = el('li');
        const label = el('label', 'choice');
        const input = el('input');
        input.type = 'radio';
        input.name = `opt-${exercise.id}`;
        input.value = String(index);
        label.append(input, el('span', 'hy', option));
        if (solved) {
          input.disabled = true;
          if (index === exercise.answer) {
            input.checked = true;
            label.classList.add('is-correct');
          }
        }
        item.append(label);
        list.append(item);
      });
      body.append(list);
      read = () => {
        const checked = list.querySelector<HTMLInputElement>('input:checked');
        return checked ? Number(checked.value) : null;
      };
      lock = () =>
        list.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
          input.disabled = true;
        });
    } else if (exercise.type === 'typing' || exercise.type === 'fill-blank') {
      const input = el('input', 'hy-input');
      input.type = 'text';
      input.lang = 'hy';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('aria-label', t('lesson.hy', getLang()));
      input.addEventListener('focus', () => {
        activeInput = input;
      });

      if (exercise.type === 'typing') {
        body.append(input);
      } else {
        const line = el('div', 'sentence-line');
        const [before, after] = exercise.template.split('{}');
        input.style.maxWidth = '12rem';
        line.append(el('span', 'hy', before ?? ''), input, el('span', 'hy', after ?? ''));
        body.append(line);
      }

      if (solved) {
        input.value = exercise.answer[0] ?? '';
        input.disabled = true;
      } else {
        activeInput = input;
      }
      read = () => input.value;
      lock = () => {
        input.disabled = true;
      };
    } else if (exercise.type === 'match-pairs') {
      const grid = el('div', 'match-columns');
      const left = el('div', 'match-column');
      const right = el('div', 'match-column');
      const pairs: Record<number, number> = {};
      let selected: number | null = null;

      exercise.pairs.forEach((pair, index) => {
        const button = el('button', 'match-item hy', pair.left);
        button.type = 'button';
        if (solved) {
          button.classList.add('match-item--done');
          button.disabled = true;
        } else {
          button.addEventListener('click', () => {
            selected = index;
            left
              .querySelectorAll('.match-item')
              .forEach((node) => node.classList.remove('match-item--selected'));
            button.classList.add('match-item--selected');
          });
        }
        left.append(button);
      });

      exercise.pairs.forEach((pair, index) => {
        const button = el('button', 'match-item', pair.right);
        button.type = 'button';
        if (solved) {
          button.classList.add('match-item--done');
          button.disabled = true;
        } else {
          button.addEventListener('click', () => {
            if (selected === null) return;
            pairs[selected] = index;
            const leftButton = left.children[selected] as HTMLButtonElement;
            leftButton.classList.remove('match-item--selected');
            leftButton.classList.add('match-item--done');
            leftButton.disabled = true;
            button.classList.add('match-item--done');
            button.disabled = true;
            selected = null;
          });
        }
        right.append(button);
      });

      grid.append(left, right);
      body.append(grid);
      read = () => pairs;
      lock = () =>
        grid.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
          button.disabled = true;
        });
    } else if (exercise.type === 'order-words') {
      const line = el('div', 'sentence-line');
      const bank = el('div', 'token-bank');
      const chosen: number[] = [];
      const bankButtons: HTMLButtonElement[] = [];

      const paintLine = (): void => {
        line.replaceChildren();
        if (chosen.length === 0) line.append(el('span', 'muted', '…'));
        else chosen.forEach((index) => line.append(el('span', 'hy', exercise.tokens[index])));
      };

      if (solved) {
        exercise.answer.forEach((token) => line.append(el('span', 'hy', token)));
        body.append(line);
      } else {
        paintLine();
        exercise.tokens.forEach((token, index) => {
          const button = el('button', 'token', token);
          button.type = 'button';
          button.addEventListener('click', () => {
            chosen.push(index);
            button.disabled = true;
            paintLine();
          });
          bankButtons.push(button);
          bank.append(button);
        });
        const undo = el('button', 'btn btn--sm');
        undo.type = 'button';
        i18nText(undo, 'action.undo');
        undo.addEventListener('click', () => {
          const last = chosen.pop();
          if (last !== undefined) bankButtons[last].disabled = false;
          paintLine();
        });
        body.append(line, bank, undo);
      }

      read = () => chosen.map((index) => exercise.tokens[index]);
      lock = () =>
        bankButtons.forEach((button) => {
          button.disabled = true;
        });
    } else {
      const face = el('div', 'flashcard__face');
      face.append(el('p', 'hy-lg', exercise.front));
      const back = el('div');
      back.hidden = !solved;
      back.append(el('p', 'hy', exercise.back));
      if (exercise.roman) back.append(el('p', 'muted', exercise.roman));
      face.append(back);
      const flashcard = el('div', 'flashcard');
      flashcard.append(face);
      body.append(flashcard);

      reveal = () => {
        back.hidden = false;
        showButton.hidden = true;
        hintButton.hidden = true;
        grades.hidden = false;
        (grades.querySelector('button') as HTMLButtonElement | null)?.focus();
      };
      checkButton.hidden = true;
      if (!solved) {
        showButton.addEventListener('click', () => reveal?.());
        RATING_OPTIONS.forEach(([rating, key], index) => {
          const button = shortcutButton(String(index + 1), key);
          button.addEventListener('click', () => gradeFlashcard(rating));
          grades.append(button);
        });
      }
      lock = () => {};
      read = () => 'good';
    }

    /* ---------- controles ---------- */

    /** Una ficha nunca cuenta como error; «otra vez» la reencola en la sesión. */
    const gradeFlashcard = (rating: Rating): void => {
      record(exercise.id, true);
      if (rating === 'again') queue.push(exercise.id);
      advance();
    };

    const finish = (response: unknown): void => {
      const result = checkExercise(exercise, response);
      record(exercise.id, result.correct);
      showFeedback(feedback, result);
      lock();
      checkButton.hidden = true;
      hintButton.hidden = true;
      showButton.hidden = true;
      if (keyboard) keyboard.hidden = true;
      nextButton.hidden = false;
      nextButton.focus();
    };

    checkButton.addEventListener('click', () => finish(read()));
    nextButton.addEventListener('click', advance);
    hintButton.addEventListener('click', () => {
      hintBox.hidden = false;
      hintBox.replaceChildren();
      if (exercise.hint) hintBox.append(gloss(exercise.hint));
      else {
        const derived = romanHint(exercise);
        if (derived) hintBox.append(el('span', 'muted', derived));
      }
    });
    hintButton.hidden = exercise.hint === undefined && romanHint(exercise) === null;

    wrapper.addEventListener('keydown', (event) => {
      if (isFlashcard && !grades.hidden) {
        const option = RATING_OPTIONS[Number(event.key) - 1];
        if (option) {
          event.preventDefault();
          gradeFlashcard(option[0]);
        }
        return;
      }
      if (event.key === 'Enter' && needsText && !checkButton.hidden) {
        event.preventDefault();
        finish(read());
      }
    });

    if (solved) {
      checkButton.hidden = true;
      hintButton.hidden = true;
      const note = el('span', 'muted');
      i18nText(note, 'exercise.solved');
      feedback.append(note);
      nextButton.hidden = false;
      if (keyboard) keyboard.hidden = true;
    } else if (keyboard) {
      keyboard.hidden = !needsText;
    }

    return wrapper;
  }

  /* ---------- avance ---------- */

  function renderCurrent(): void {
    const id = queue[cursor];
    const exercise = byId.get(id);
    if (!exercise) {
      cursor += 1;
      if (cursor >= queue.length) renderSummary();
      else {
        updateHeader();
        renderCurrent();
      }
      return;
    }
    card.replaceChildren(buildExerciseCard(exercise));
    applyI18n(root);
    const focusable = card.querySelector<HTMLElement>('input, button:not([hidden])');
    focusable?.focus();
  }

  function advance(): void {
    if (activeInput) activeInput = null;
    cursor += 1;
    if (cursor >= queue.length) {
      renderSummary();
      return;
    }
    updateHeader();
    renderCurrent();
  }

  function renderSummary(): void {
    if (keyboard) keyboard.hidden = true;
    card.replaceChildren();
    const box = el('div', 'card');
    const title = el('h3');
    i18nText(title, 'exercise.finished');
    box.append(title);

    const correct = queue.filter((id) => results.get(id) === true).length;
    const score = el('span');
    i18nText(score, 'exercise.score', { correct, total: queue.length });
    const line = el('p');
    line.append(score);
    box.append(line);

    const failed = queue.filter((id) => results.get(id) === false);
    if (failed.length > 0) {
      const retry = el('button', 'btn');
      retry.type = 'button';
      i18nText(retry, 'action.retryFailed');
      retry.addEventListener('click', () => {
        queue = failed;
        cursor = 0;
        results.clear();
        summary.replaceChildren();
        updateHeader();
        renderCurrent();
      });
      box.append(retry);
    }

    if (payload.nextHref) {
      const link = el('a', 'btn btn--primary');
      link.href = payload.nextHref;
      i18nText(link, 'action.nextLesson');
      box.append(link);
    }

    summary.replaceChildren(box);
    applyI18n(root);
    (box.querySelector('a, button') as HTMLElement | null)?.focus();
  }

  /* ---------- desbloqueo progresivo ---------- */

  const lockedByUnit =
    payload.prerequisites.length > 0 &&
    !payload.prerequisites.every((item) => {
      const progress = store.read();
      return deriveLessonStatus(progress.lessons[item.id], item.exerciseCount) === 'completed';
    });

  if (lockedByUnit) {
    if (lockNotice) lockNotice.hidden = false;
    root.hidden = true;
    bypass?.addEventListener('click', () => {
      root.hidden = false;
      if (lockNotice) lockNotice.hidden = true;
      renderCurrent();
    });
  }

  /* ---------- arranque ---------- */

  window.addEventListener('hy:lang-changed', () => {
    applyI18n(root);
    refreshStatus();
    updateHeader();
  });

  refreshStatus();
  updateHeader();
  if (!lockedByUnit) renderCurrent();
}

const host = document.getElementById('lesson-runner');
const dataScript = document.getElementById('lesson-data');

if (host && dataScript?.textContent) {
  try {
    mount(host, JSON.parse(dataScript.textContent) as Payload);
  } catch (error) {
    host.innerHTML =
      '<p class="notice notice--error">No se pudieron cargar los ejercicios de esta lección.</p>';
    console.error(error);
  }
}
