---
title:
  es: "Pronombres personales"
  en: "Personal pronouns"
summary:
  es: "ես, դու, նա, մենք, դուք, նրանք y los demostrativos այս, այդ, այն."
  en: "ես, դու, նա, մենք, դուք, նրանք and the demonstratives այս, այդ, այն."
unit: pronombres
order: 1
objectives:
  - es: "Usar los seis pronombres personales."
    en: "Use the six personal pronouns."
  - es: "Distinguir los tres demostrativos por distancia."
    en: "Tell the three demonstratives apart by distance."
  - es: "Entender por qué el armenio omite pronombres con frecuencia."
    en: "Understand why Armenian often drops pronouns."
vocab:
  - { hy: "ես", roman: "yes", es: "yo", en: "I", kind: word, tags: [pronombres] }
  - { hy: "դու", roman: "du", es: "tú", en: "you (singular)", kind: word, tags: [pronombres] }
  - { hy: "նա", roman: "na", es: "él, ella", en: "he, she", kind: word, tags: [pronombres] }
  - { hy: "մենք", roman: "menk'", es: "nosotros", en: "we", kind: word, tags: [pronombres] }
  - { hy: "դուք", roman: "duk'", es: "vosotros, ustedes", en: "you (plural)", kind: word, tags: [pronombres] }
  - { hy: "նրանք", roman: "nrank'", es: "ellos, ellas", en: "they", kind: word, tags: [pronombres] }
  - { hy: "այս", roman: "ays", es: "este, esta", en: "this", kind: word, tags: [pronombres, demostrativos] }
  - { hy: "այդ", roman: "ayd", es: "ese, esa", en: "that (near you)", kind: word, tags: [pronombres, demostrativos] }
  - { hy: "այն", roman: "ayn", es: "aquel, aquella", en: "that (over there)", kind: word, tags: [pronombres, demostrativos] }
exercises:
  - type: multiple-choice
    id: pro-01-mc-1
    prompt:
      es: "¿Qué significa մենք?"
      en: "What does մենք mean?"
    options: ["nosotros", "ellos", "tú"]
    answer: 0
  - type: multiple-choice
    id: pro-01-mc-2
    prompt:
      es: "¿Cuál de estos significa «tú»?"
      en: "Which of these means «you» (singular)?"
    options: ["դուք", "դու", "նա"]
    answer: 1
  - type: match-pairs
    id: pro-01-mp-1
    prompt:
      es: "Empareja cada pronombre con su significado."
      en: "Match each pronoun with its meaning."
    pairs:
      - { left: "ես", right: "yo" }
      - { left: "դու", right: "tú" }
      - { left: "նա", right: "él, ella" }
      - { left: "մենք", right: "nosotros" }
      - { left: "նրանք", right: "ellos, ellas" }
  - type: order-words
    id: pro-01-ow-1
    prompt:
      es: "Ordena los pronombres: primero el singular, después el plural."
      en: "Arrange the pronouns: singular first, then plural."
    tokens: ["մենք", "նա", "ես", "դուք", "դու", "նրանք"]
    answer: ["ես", "դու", "նա", "մենք", "դուք", "նրանք"]
    hint:
      es: "Pista: yo, tú, él/ella, nosotros, vosotros, ellos."
      en: "Hint: I, you, he/she, we, you (pl.), they."
  - type: typing
    id: pro-01-ty-1
    prompt:
      es: "Escribe el pronombre «nosotros»."
      en: "Type the pronoun «we»."
    answer: ["մենք"]
  - type: fill-blank
    id: pro-01-fb-1
    prompt:
      es: "Completa: «ellos, ellas» se dice ___."
      en: "Complete: «they» is ___."
    template: "«ellos, ellas»: {}"
    answer: ["նրանք"]
---

## Los seis pronombres

| Armenio | Pronunciación | Significado |
|---|---|---|
| ես | yes | yo |
| դու | du | tú |
| նա | na | él, ella |
| մենք | menk' | nosotros |
| դուք | duk' | vosotros, ustedes |
| նրանք | nrank' | ellos, ellas |

Armenio **no distingue género** en los pronombres: `նա` sirve tanto para «él» como para «ella», y
`նրանք` tanto para «ellos» como para «ellas». Tampoco hay una forma distinta para el «usted» de
cortesía: se usa `դուք`, la misma forma del plural.

## Demostrativos

El armenio tiene tres demostrativos, según la distancia:

| Armenio | Pronunciación | Significado |
|---|---|---|
| այս | ays | este, esta (cerca de mí) |
| այդ | ayd | ese, esa (cerca de ti) |
| այն | ayn | aquel, aquella (lejos de los dos) |

## El pronombre se puede omitir

Como el verbo indica la persona, los pronombres se omiten cuando no aportan énfasis. `Ես հայ եմ` y
`հայ եմ` significan lo mismo («soy armenio»); la primera forma simplemente subraya el *yo*.
