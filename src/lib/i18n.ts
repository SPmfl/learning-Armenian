import { LANG_KEY } from './progress';
import type { ExerciseStatus, Lang } from './types';

export const DEFAULT_LANG: Lang = 'es';
export const LANGS: Lang[] = ['es', 'en'];

/** Clave de traducción de cada estado de lección; la comparten runner y vistas. */
export const STATUS_KEYS: Record<ExerciseStatus, string> = {
  'not-started': 'state.notStarted',
  'in-progress': 'state.inProgress',
  completed: 'state.completed',
};

export const ui: Record<Lang, Record<string, string>> = {
  es: {
    'app.title': 'Aprende armenio',
    'app.tagline': 'Armenio oriental, paso a paso',

    'nav.home': 'Inicio',
    'nav.lessons': 'Lecciones',
    'nav.alphabet': 'Abecedario',
    'nav.practice': 'Práctica',
    'nav.progress': 'Progreso',
    'nav.settings': 'Ajustes',
    'nav.skip': 'Saltar al contenido',

    'footer.disclaimer':
      'Contenido en armenio oriental (ortografía reformada). Progreso guardado solo en este navegador.',

    'home.start': 'Empezar',
    'home.continue': 'Continuar',
    'home.intro':
      'Cuatro unidades y quince lecciones para aprender armenio oriental desde el alfabeto. El progreso se guarda en tu navegador: no hace falta cuenta ni conexión.',
    'home.units': 'Unidades',
    'home.streak': 'Racha',
    'home.streakDays': '{n} días seguidos',
    'home.noActivity': 'Sin actividad todavía',
    'home.alphabetCard': 'Consulta las 39 letras',
    'home.practiceCard': 'Repasa con tarjetas',

    'lesson.objectives': 'Objetivos',
    'lesson.vocab': 'Vocabulario',
    'lesson.exercises': 'Ejercicios',
    'lesson.summary': 'Resumen',
    'lesson.hy': 'Armenio',
    'lesson.roman': 'Pronunciación',
    'lesson.es': 'Español',
    'lesson.en': 'Inglés',
    'lesson.notes': 'Notas',
    'lesson.unit': 'Unidad',

    'action.check': 'Comprobar',
    'action.hint': 'Pista',
    'action.show': 'Mostrar respuesta',
    'action.next': 'Siguiente',
    'action.retryFailed': 'Repetir solo los fallados',
    'action.nextLesson': 'Siguiente lección',
    'action.studyAnyway': 'Estudiar de todas formas',
    'action.start': 'Empezar',
    'action.restart': 'Reiniciar',
    'action.undo': 'Deshacer',
    'action.export': 'Exportar',
    'action.import': 'Importar',
    'action.reset': 'Reiniciar todo',
    'action.continue': 'Continuar',

    'state.correct': '¡Correcto!',
    'state.wrong': 'Incorrecto',
    'state.completed': 'Completada',
    'state.inProgress': 'En curso',
    'state.notStarted': 'Sin empezar',
    'state.locked': 'Bloqueada',
    'state.lockedHint': 'Termina la unidad anterior para desbloquear esta.',
    'state.answer': 'Respuesta correcta: {answer}',

    'exercise.progress': 'Ejercicio {n} de {total}',
    'exercise.finished': 'Has terminado la lección.',
    'exercise.score': '{correct} de {total} correctos',
    'exercise.flashcardHint': 'Autoevalúate: ¿te acordabas?',
    'exercise.solved': 'Ya resuelto',

    'practice.title': 'Práctica libre',
    'practice.mode': 'Modo',
    'practice.mode.review': 'Repaso (SRS)',
    'practice.mode.free': 'Sesión libre',
    'practice.source': 'Mazo',
    'practice.source.all': 'Todas',
    'practice.source.unit': 'Unidad',
    'practice.source.tag': 'Etiqueta',
    'practice.source.starred': 'Favoritas',
    'practice.size': 'Tarjetas por sesión',
    'practice.size.all': 'Todas',
    'practice.start': 'Empezar sesión',
    'practice.pending': 'Pendientes: {n}',
    'practice.again': 'Otra vez',
    'practice.hard': 'Difícil',
    'practice.good': 'Bien',
    'practice.easy': 'Fácil',
    'practice.due': 'Repaso pendiente',
    'practice.fresh': 'Tarjeta nueva',
    'practice.empty': 'No hay tarjetas para este mazo.',
    'practice.needReview': 'Completa alguna lección para tener vocabulario.',
    'practice.finished': 'Sesión terminada',
    'practice.newSession': 'Nueva sesión',
    'practice.summary': '{total} tarjetas · {again} otra vez · {good} bien · {easy} fácil',

    'progress.title': 'Tu progreso',
    'progress.streak': 'Racha',
    'progress.answered': 'Ejercicios respondidos',
    'progress.accuracy': 'Precisión',
    'progress.cards': 'Tarjetas en repaso',
    'progress.box': 'Caja {n}',
    'progress.boxes': 'Distribución por cajas',
    'progress.dueToday': 'Pendientes hoy',
    'progress.history': 'Actividad diaria',
    'progress.lessonsDone': '{done} de {total} lecciones',
    'progress.memoryUnavailable':
      'Este navegador no guarda el progreso; se perderá al cerrar la pestaña.',
    'progress.memoryShort': 'Sin guardado',
    'progress.empty': 'Todavía no hay actividad.',
    'progress.resetDone': 'Progreso borrado.',
    'progress.imported': 'Progreso importado.',
    'progress.exported': 'Progreso exportado.',
    'progress.importError': 'No se pudo importar el archivo.',

    'settings.title': 'Ajustes',
    'settings.language': 'Idioma',
    'settings.theme': 'Tema',
    'settings.theme.auto': 'Automático',
    'settings.theme.light': 'Claro',
    'settings.theme.dark': 'Oscuro',
    'settings.data': 'Datos',
    'settings.danger': 'Zona peligrosa',
    'settings.confirmReset': '¿Seguro que quieres borrar todo el progreso?',
    'settings.fontFallback': 'La fuente armenia se carga desde Internet en este equipo.',

    'alphabet.title': 'El abecedario armenio',
    'alphabet.intro':
      '39 letras en la ortografía reformada. Cada letra tiene un nombre propio y un valor numérico.',
    'alphabet.name': 'Nombre',
    'alphabet.sound': 'Sonido',
    'alphabet.value': 'Valor numérico',
    'alphabet.group.vowel': 'Vocales',
    'alphabet.group.familiar': 'Sonidos familiares',
    'alphabet.group.new': 'Sonidos nuevos',
    'alphabet.all': 'Todas',
    'alphabet.footnote':
      'La letra ւ no forma parte de las 39 letras del alfabeto reformado: solo aparece dentro de ու.',

    'keyboard.show': 'Mostrar teclado armenio',
    'keyboard.hide': 'Ocultar teclado',
    'keyboard.backspace': 'Borrar',

    'unit.lessons': '{n} lecciones',
    'star.add': 'Marcar como favorita',
    'star.remove': 'Quitar de favoritas',

    '404.title': 'Página no encontrada',
    '404.text': 'La página que buscas no existe.',
    '404.back': 'Volver al inicio',
  },

  en: {
    'app.title': 'Learn Armenian',
    'app.tagline': 'Eastern Armenian, step by step',

    'nav.home': 'Home',
    'nav.lessons': 'Lessons',
    'nav.alphabet': 'Alphabet',
    'nav.practice': 'Practice',
    'nav.progress': 'Progress',
    'nav.settings': 'Settings',
    'nav.skip': 'Skip to content',

    'footer.disclaimer':
      'Eastern Armenian content (reformed orthography). Progress is stored only in this browser.',

    'home.start': 'Get started',
    'home.continue': 'Continue',
    'home.intro':
      'Four units and fifteen lessons to learn Eastern Armenian starting from the alphabet. Progress is stored in your browser: no account or connection needed.',
    'home.units': 'Units',
    'home.streak': 'Streak',
    'home.streakDays': '{n}-day streak',
    'home.noActivity': 'No activity yet',
    'home.alphabetCard': 'Browse the 39 letters',
    'home.practiceCard': 'Review with flashcards',

    'lesson.objectives': 'Objectives',
    'lesson.vocab': 'Vocabulary',
    'lesson.exercises': 'Exercises',
    'lesson.summary': 'Summary',
    'lesson.hy': 'Armenian',
    'lesson.roman': 'Pronunciation',
    'lesson.es': 'Spanish',
    'lesson.en': 'English',
    'lesson.notes': 'Notes',
    'lesson.unit': 'Unit',

    'action.check': 'Check',
    'action.hint': 'Hint',
    'action.show': 'Show answer',
    'action.next': 'Next',
    'action.retryFailed': 'Retry failed only',
    'action.nextLesson': 'Next lesson',
    'action.studyAnyway': 'Study anyway',
    'action.start': 'Start',
    'action.restart': 'Restart',
    'action.undo': 'Undo',
    'action.export': 'Export',
    'action.import': 'Import',
    'action.reset': 'Reset everything',
    'action.continue': 'Continue',

    'state.correct': 'Correct!',
    'state.wrong': 'Incorrect',
    'state.completed': 'Completed',
    'state.inProgress': 'In progress',
    'state.notStarted': 'Not started',
    'state.locked': 'Locked',
    'state.lockedHint': 'Finish the previous unit to unlock this one.',
    'state.answer': 'Correct answer: {answer}',

    'exercise.progress': 'Exercise {n} of {total}',
    'exercise.finished': 'You finished the lesson.',
    'exercise.score': '{correct} of {total} correct',
    'exercise.flashcardHint': 'Grade yourself: did you remember?',
    'exercise.solved': 'Already solved',

    'practice.title': 'Free practice',
    'practice.mode': 'Mode',
    'practice.mode.review': 'Review (SRS)',
    'practice.mode.free': 'Free session',
    'practice.source': 'Deck',
    'practice.source.all': 'All',
    'practice.source.unit': 'Unit',
    'practice.source.tag': 'Tag',
    'practice.source.starred': 'Starred',
    'practice.size': 'Cards per session',
    'practice.size.all': 'All',
    'practice.start': 'Start session',
    'practice.pending': 'Remaining: {n}',
    'practice.again': 'Again',
    'practice.hard': 'Hard',
    'practice.good': 'Good',
    'practice.easy': 'Easy',
    'practice.due': 'Due for review',
    'practice.fresh': 'New card',
    'practice.empty': 'No cards in this deck.',
    'practice.needReview': 'Complete a lesson to get vocabulary.',
    'practice.finished': 'Session finished',
    'practice.newSession': 'New session',
    'practice.summary': '{total} cards · {again} again · {good} good · {easy} easy',

    'progress.title': 'Your progress',
    'progress.streak': 'Streak',
    'progress.answered': 'Exercises answered',
    'progress.accuracy': 'Accuracy',
    'progress.cards': 'Cards in review',
    'progress.box': 'Box {n}',
    'progress.boxes': 'Box distribution',
    'progress.dueToday': 'Due today',
    'progress.history': 'Daily activity',
    'progress.lessonsDone': '{done} of {total} lessons',
    'progress.memoryUnavailable': "This browser doesn't save progress; it will be lost when you close the tab.",
    'progress.memoryShort': 'Not saved',
    'progress.empty': 'No activity yet.',
    'progress.resetDone': 'Progress cleared.',
    'progress.imported': 'Progress imported.',
    'progress.exported': 'Progress exported.',
    'progress.importError': 'Could not import the file.',

    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.theme.auto': 'Auto',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.data': 'Data',
    'settings.danger': 'Danger zone',
    'settings.confirmReset': 'Are you sure you want to delete all progress?',
    'settings.fontFallback': 'The Armenian font is loaded from the Internet on this device.',

    'alphabet.title': 'The Armenian alphabet',
    'alphabet.intro':
      '39 letters in the reformed orthography. Each letter has its own name and a numeric value.',
    'alphabet.name': 'Name',
    'alphabet.sound': 'Sound',
    'alphabet.value': 'Numeric value',
    'alphabet.group.vowel': 'Vowels',
    'alphabet.group.familiar': 'Familiar sounds',
    'alphabet.group.new': 'New sounds',
    'alphabet.all': 'All',
    'alphabet.footnote':
      'The letter ւ is not one of the 39 letters of the reformed alphabet: it only appears inside ու.',

    'keyboard.show': 'Show Armenian keyboard',
    'keyboard.hide': 'Hide keyboard',
    'keyboard.backspace': 'Backspace',

    'unit.lessons': '{n} lessons',
    'star.add': 'Mark as favourite',
    'star.remove': 'Remove from favourites',

    '404.title': 'Page not found',
    '404.text': 'The page you are looking for does not exist.',
    '404.back': 'Back to home',
  },
};

export function t(key: string, lang: Lang, args?: Record<string, string | number>): string {
  const template = ui[lang]?.[key] ?? ui[DEFAULT_LANG][key] ?? key;
  if (!args) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in args ? String(args[name]) : match,
  );
}

export function getLang(): Lang {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(LANG_KEY) : null;
    return stored === 'en' ? 'en' : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

function currentLang(): Lang {
  if (typeof document !== 'undefined') {
    return document.documentElement.dataset.lang === 'en' ? 'en' : DEFAULT_LANG;
  }
  return getLang();
}

export function applyI18n(scope: ParentNode): void {
  const lang = currentLang();
  const nodes = scope.querySelectorAll<HTMLElement>(
    '[data-i18n], [data-i18n-aria-label], [data-i18n-title]',
  );
  nodes.forEach((el) => {
    const key = el.dataset.i18n;
    if (key) {
      let args: Record<string, string | number> | undefined;
      if (el.dataset.i18nArgs) {
        try {
          args = JSON.parse(el.dataset.i18nArgs) as Record<string, string | number>;
        } catch {
          args = undefined;
        }
      }
      el.textContent = t(key, lang, args);
    }
    if (el.dataset.i18nAriaLabel) el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel, lang));
    if (el.dataset.i18nTitle) el.setAttribute('title', t(el.dataset.i18nTitle, lang));
  });
}

export function setLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // almacenamiento no disponible: el idioma sigue aplicándose en esta sesión
  }
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.lang = lang;
    document.documentElement.lang = lang;
    applyI18n(document);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('hy:lang-changed'));
  }
}
