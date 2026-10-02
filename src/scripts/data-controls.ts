import { getLang, t } from '../lib/i18n';
import { createStore } from '../lib/progress';

const store = createStore();
const exportButton = document.querySelector<HTMLButtonElement>('[data-export]');
const importInput = document.querySelector<HTMLInputElement>('[data-import]');
const resetButton = document.querySelector<HTMLButtonElement>('[data-reset]');
const status = document.querySelector<HTMLElement>('[data-data-status]');
const warning = document.querySelector<HTMLElement>('[data-progress-warning-full]');

function setStatus(key: string, tone: 'ok' | 'error' | 'muted' = 'muted'): void {
  if (!status) return;
  status.textContent = t(key, getLang());
  status.className = tone === 'muted' ? 'muted' : tone === 'ok' ? '' : 'notice--error';
  status.style.color = tone === 'error' ? 'var(--error)' : '';
}

exportButton?.addEventListener('click', () => {
  const blob = new Blob([store.export()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `learn-armenian-progreso-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus('progress.exported', 'ok');
});

importInput?.addEventListener('change', async () => {
  const file = importInput.files?.[0];
  if (!file) return;
  const text = await file.text();
  const result = store.import(text);
  setStatus(result.ok ? 'progress.imported' : 'progress.importError', result.ok ? 'ok' : 'error');
  importInput.value = '';
});

resetButton?.addEventListener('click', () => {
  if (!window.confirm(t('settings.confirmReset', getLang()))) return;
  store.reset();
  setStatus('progress.resetDone', 'ok');
});

if (warning && !store.persistent) warning.hidden = false;
