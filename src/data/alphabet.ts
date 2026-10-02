import type { Localized } from '../lib/types';

export type AlphabetGroup = 'vowel' | 'familiar' | 'new';

export type AlphabetEntry = {
  lower: string;
  upper: string;
  name: string;
  nameRoman: string;
  iso: string;
  roman: string;
  sound: Localized;
  value?: number;
  group: AlphabetGroup;
  note?: Localized;
};

/** 39 letras del alfabeto armenio reformado, en orden alfabético. */
export const ALPHABET: AlphabetEntry[] = [
  { lower: 'ա', upper: 'Ա', name: 'այբ', nameRoman: 'ayb', iso: 'a', roman: 'a', group: 'vowel',
    sound: { es: '«a» como en español', en: '"a" as in Spanish' }, value: 1 },
  { lower: 'բ', upper: 'Բ', name: 'բեն', nameRoman: 'ben', iso: 'b', roman: 'b', group: 'familiar',
    sound: { es: '«b»', en: '"b"' }, value: 2 },
  { lower: 'գ', upper: 'Գ', name: 'գիմ', nameRoman: 'gim', iso: 'g', roman: 'g', group: 'familiar',
    sound: { es: '«g» de gato', en: '"g" as in "go"' }, value: 3 },
  { lower: 'դ', upper: 'Դ', name: 'դա', nameRoman: 'da', iso: 'd', roman: 'd', group: 'familiar',
    sound: { es: '«d»', en: '"d"' }, value: 4 },
  { lower: 'ե', upper: 'Ե', name: 'եչ', nameRoman: 'yech', iso: 'e', roman: 'ye / e', group: 'vowel',
    sound: { es: '«ye» al inicio de palabra, «e» en el resto', en: '"ye" at the start of a word, "e" elsewhere' },
    note: {
      es: 'Al inicio de palabra suena «ye»; en el resto, «e». La única excepción es el presente del verbo ser: եմ, ես, ենք…',
      en: 'At the start of a word it sounds "ye"; elsewhere "e". The only exception is the present tense of to be: եմ, ես, ենք…',
    },
    value: 5 },
  { lower: 'զ', upper: 'Զ', name: 'զա', nameRoman: 'za', iso: 'z', roman: 'z', group: 'familiar',
    sound: { es: '«z» sonora (como la «s» de mismo, o la «z» francesa)', en: 'voiced "z" (as in "zoo", or the "s" of "mismo")' },
    value: 6 },
  { lower: 'է', upper: 'Է', name: 'է', nameRoman: 'e', iso: 'ē', roman: 'e', group: 'vowel',
    sound: { es: '«e»', en: '"e"' }, value: 7 },
  { lower: 'ը', upper: 'Ը', name: 'ըթ', nameRoman: 'ët’', iso: 'ë', roman: 'ë', group: 'vowel',
    sound: { es: 'vocal neutra, como la «e» relajada de sofa en inglés', en: 'neutral vowel, like the relaxed "e" of "sofa"' },
    value: 8 },
  { lower: 'թ', upper: 'Թ', name: 'թո', nameRoman: 't’o', iso: 'ṫ', roman: "t'", group: 'new',
    sound: { es: '«t» aspirada, como en inglés top', en: 'aspirated "t", as in English "top"' }, value: 9 },
  { lower: 'ժ', upper: 'Ժ', name: 'ժե', nameRoman: 'zhe', iso: 'ž', roman: 'zh', group: 'new',
    sound: { es: '«zh», como la «j» francesa de jour', en: '"zh", like the "j" of French "jour"' }, value: 10 },
  { lower: 'ի', upper: 'Ի', name: 'ինի', nameRoman: 'ini', iso: 'i', roman: 'i', group: 'vowel',
    sound: { es: '«i»', en: '"i"' }, value: 20 },
  { lower: 'լ', upper: 'Լ', name: 'լյուն', nameRoman: 'lyun', iso: 'l', roman: 'l', group: 'familiar',
    sound: { es: '«l»', en: '"l"' }, value: 30 },
  { lower: 'խ', upper: 'Խ', name: 'խե', nameRoman: 'khe', iso: 'x', roman: 'kh', group: 'new',
    sound: { es: '«j» española gutural, como en jamón', en: 'Spanish guttural "j", as in "jamón"' }, value: 40 },
  { lower: 'ծ', upper: 'Ծ', name: 'ծա', nameRoman: 'tsa', iso: 'ç', roman: 'ts', group: 'new',
    sound: { es: '«ts», como en cats', en: '"ts", as in "cats"' }, value: 50 },
  { lower: 'կ', upper: 'Կ', name: 'կեն', nameRoman: 'ken', iso: 'k', roman: 'k', group: 'familiar',
    sound: { es: '«k»', en: '"k"' }, value: 60 },
  { lower: 'հ', upper: 'Հ', name: 'հո', nameRoman: 'ho', iso: 'h', roman: 'h', group: 'familiar',
    sound: { es: '«h» aspirada, como en inglés house', en: 'aspirated "h", as in English "house"' }, value: 70 },
  { lower: 'ձ', upper: 'Ձ', name: 'ձա', nameRoman: 'dza', iso: 'j', roman: 'dz', group: 'new',
    sound: { es: '«dz», como «ds» de adscribir', en: '"dz", as in "adze"' }, value: 80 },
  { lower: 'ղ', upper: 'Ղ', name: 'ղատ', nameRoman: 'ghat', iso: 'ġ', roman: 'gh', group: 'new',
    sound: { es: '«g» gutural, como la «r» francesa', en: 'guttural "g", like the French "r"' }, value: 90 },
  { lower: 'ճ', upper: 'Ճ', name: 'ճե', nameRoman: 'che', iso: 'č', roman: 'ch', group: 'new',
    sound: { es: '«ch»', en: '"ch"' }, value: 100 },
  { lower: 'մ', upper: 'Մ', name: 'մեն', nameRoman: 'men', iso: 'm', roman: 'm', group: 'familiar',
    sound: { es: '«m»', en: '"m"' }, value: 200 },
  { lower: 'յ', upper: 'Յ', name: 'հի', nameRoman: 'hi', iso: 'y', roman: 'y', group: 'new',
    sound: { es: '«y» de yate; en diptongos suena «i»', en: '"y" as in "yes"; "i" in diphthongs' }, value: 300 },
  { lower: 'ն', upper: 'Ն', name: 'նու', nameRoman: 'nu', iso: 'n', roman: 'n', group: 'familiar',
    sound: { es: '«n»', en: '"n"' }, value: 400 },
  { lower: 'շ', upper: 'Շ', name: 'շա', nameRoman: 'sha', iso: 'š', roman: 'sh', group: 'new',
    sound: { es: '«sh» inglesa, como en shop', en: 'English "sh", as in "shop"' }, value: 500 },
  { lower: 'ո', upper: 'Ո', name: 'ո', nameRoman: 'vo', iso: 'o', roman: 'vo / o', group: 'vowel',
    sound: { es: '«vo» al inicio de palabra, «o» en el resto', en: '"vo" at the start of a word, "o" elsewhere' }, value: 600 },
  { lower: 'չ', upper: 'Չ', name: 'չա', nameRoman: 'ch’a', iso: 'ċ', roman: "ch'", group: 'new',
    sound: { es: '«ch» aspirada', en: 'aspirated "ch"' }, value: 700 },
  { lower: 'պ', upper: 'Պ', name: 'պե', nameRoman: 'pe', iso: 'p', roman: 'p', group: 'familiar',
    sound: { es: '«p»', en: '"p"' }, value: 800 },
  { lower: 'ջ', upper: 'Ջ', name: 'ջե', nameRoman: 'je', iso: 'ǰ', roman: 'j', group: 'new',
    sound: { es: '«y» inglesa de yes (j suave)', en: '"j" as in English "jam"' }, value: 900 },
  { lower: 'ռ', upper: 'Ռ', name: 'ռա', nameRoman: 'rra', iso: 'ṙ', roman: 'rr', group: 'new',
    sound: { es: '«rr» vibrante múltiple, más fuerte que la española', en: 'rolled "rr", stronger than the Spanish one' }, value: 1000 },
  { lower: 'ս', upper: 'Ս', name: 'սե', nameRoman: 'se', iso: 's', roman: 's', group: 'familiar',
    sound: { es: '«s»', en: '"s"' }, value: 2000 },
  { lower: 'վ', upper: 'Վ', name: 'վեվ', nameRoman: 'vev', iso: 'v', roman: 'v', group: 'familiar',
    sound: { es: '«v»', en: '"v"' }, value: 3000 },
  { lower: 'տ', upper: 'Տ', name: 'տյուն', nameRoman: 'tyun', iso: 't', roman: 't', group: 'familiar',
    sound: { es: '«t»', en: '"t"' }, value: 4000 },
  { lower: 'ր', upper: 'Ր', name: 'րե', nameRoman: 're', iso: 'r', roman: 'r', group: 'familiar',
    sound: { es: '«r» simple y suave', en: 'single, soft "r"' },
    note: {
      es: 'En armenio oriental ր es una «r» simple y suave; ռ (n.º 28) es la vibrante múltiple.',
      en: 'In Eastern Armenian ր is a single, soft "r"; ռ (no. 28) is the rolled one.',
    },
    value: 5000 },
  { lower: 'ց', upper: 'Ց', name: 'ցո', nameRoman: 'ts’o', iso: 'ć', roman: "ts'", group: 'new',
    sound: { es: '«ts» aspirada', en: 'aspirated "ts"' }, value: 6000 },
  { lower: 'ու', upper: 'ՈՒ', name: 'ու', nameRoman: 'u', iso: 'u', roman: 'u', group: 'vowel',
    sound: { es: '«u»', en: '"u"' } },
  { lower: 'փ', upper: 'Փ', name: 'փյուր', nameRoman: 'p’yur', iso: 'ṕ', roman: "p'", group: 'new',
    sound: { es: '«p» aspirada', en: 'aspirated "p"' }, value: 8000 },
  { lower: 'ք', upper: 'Ք', name: 'քե', nameRoman: 'k’e', iso: 'ḱ', roman: "k'", group: 'new',
    sound: { es: '«k» aspirada', en: 'aspirated "k"' }, value: 9000 },
  { lower: 'և', upper: 'Եվ', name: 'և', nameRoman: 'yev', iso: 'ew', roman: 'ev', group: 'new',
    sound: { es: '«ev»; «yev» al inicio de palabra', en: '"ev"; "yev" at the start of a word' } },
  { lower: 'օ', upper: 'Օ', name: 'օ', nameRoman: 'o', iso: 'ò', roman: 'o', group: 'vowel',
    sound: { es: '«o»', en: '"o"' } },
  { lower: 'ֆ', upper: 'Ֆ', name: 'ֆե', nameRoman: 'fe', iso: 'f', roman: 'f', group: 'familiar',
    sound: { es: '«f»', en: '"f"' } },
];

/** Signos de puntuación armenios usados en el teclado en pantalla. */
export const HY_PUNCTUATION = ['։', '՝', '՞', '՜'] as const;

/** Letras sueltas, sin `ու` (que se ofrece como una sola tecla de dos caracteres). */
export const HY_LETTERS: string[] = ALPHABET.filter((a) => a.lower !== 'ու').map((a) => a.lower);
