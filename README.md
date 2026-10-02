# Aprende armenio oriental

Aplicación web para aprender **armenio oriental** (la variante de Armenia, con ortografía reformada):
alfabeto, pronombres, verbos y frases de uso diario, con lecciones guiadas, repaso espaciado y
práctica libre.

Es **100 % estática**: se compila a HTML, CSS y JavaScript y se sirve desde cualquier hosting de
ficheros, sin servidor, sin base de datos y sin cuentas. Todo el progreso vive en el navegador
(`localStorage`), así que la aplicación funciona igual de bien en local, en una memoria USB o en un
CDN.

La prosa y la interfaz están en **español**; el botón `EN` cambia los textos de la interfaz al inglés
y el vocabulario muestra siempre la glosa en ambos idiomas.

## Contenido

| | |
|---|---|
| Alfabeto | Las 39 letras en tres grupos —vocales (8), familiares (15) y nuevas (16)— con nombre, sonido, romanización, equivalencia ISO y valor numérico cuando lo tienen |
| Unidades | 4 (`alfabeto`, `pronombres`, `verbos`, `frases`) |
| Lecciones | 15, escritas en Markdown con frontmatter YAML |
| Vocabulario | 203 entradas con forma armenia, romanización y glosa ES/EN |
| Ejercicios | 86 en 6 formatos: opción múltiple, escritura, rellenar huecos, emparejar, ordenar palabras y tarjeta |
| Repaso | Sistema Leitner de cajas 0-5 con intervalos de 0, 1, 3, 7, 16 y 35 días |
| Audio | Ninguno: es una decisión de diseño, todo el material es visual y escrito |

## Requisitos

- **Node.js >= 22.12.0** (el repositorio incluye un `.nvmrc` con `24`).
- npm (viene con Node).

No hace falta ninguna otra herramienta para desarrollar. Para desplegar, consulta
[Despliegue](#despliegue-en-cloudflare-workers).

## Puesta en marcha

```sh
npm install
npm run dev          # servidor de desarrollo en http://localhost:4321
```

Para generar y servir la versión final tal y como se publica:

```sh
npm run build        # genera dist/ (26 páginas)
npm run preview      # sirve dist/ con el servidor de vista previa de Astro
```

Antes de dar algo por terminado, la comprobación completa:

```sh
npm run check        # tipos y diagnósticos de Astro
npm test             # 78 pruebas
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila la web estática en `dist/` |
| `npm run preview` | Sirve `dist/` localmente |
| `npm run preview:cf` | Compila y sirve `dist/` con el runtime real de Cloudflare Workers (puerto 8787) |
| `npm run deploy` | Compila y publica en Cloudflare Workers |
| `npm run check` | `astro check`: errores, avisos y tipos |
| `npm test` | Ejecuta la suite de Vitest una vez |
| `npm run test:watch` | Vitest en modo vigilancia |

## Estructura del proyecto

```
src/
  components/      componentes .astro (sin framework de UI)
  content/
    lessons/*.md   las 15 lecciones: frontmatter YAML + cuerpo Markdown
    units/*.yaml   las 4 unidades
  data/alphabet.ts las 39 letras con su sonido, romanización y valor
  layouts/         MainLayout.astro (cabecera, pie, tema, idioma)
  lib/             lógica pura y testeable, sin dependencias del navegador
  pages/           rutas del sitio
  scripts/         islas de cliente en TypeScript
  styles/          global.css
  content.config.ts colecciones y sus esquemas
tests/             pruebas de Vitest
public/            estáticos: favicon, fuente armenia y _headers
wrangler.jsonc     configuración del Worker de Cloudflare
```

Responsabilidades de `src/lib/`:

| Fichero | Responsabilidad |
|---|---|
| `schemas.ts` | Esquemas Zod del contenido: la única fuente de verdad del frontmatter |
| `content.ts` | Única capa de la aplicación que habla con el módulo virtual `astro:content` |
| `curriculum.ts` | Orden de unidades y lecciones, bloqueos y progreso por unidad |
| `progress.ts` | Estado del progreso en `localStorage`: migración, registro y eventos |
| `srs.ts` | Repaso espaciado: intervalos de caja, tarjetas vencidas y cola de sesión |
| `exercises.ts` | Comprobación de las respuestas de los ejercicios |
| `translit.ts` | Romanización del armenio y su validación |
| `text.ts` | Normalización de texto armenio antes de comparar |
| `i18n.ts` | Diccionario ES/EN y aplicación sobre el DOM |
| `url.ts` | `href()`, que prefija las rutas internas con `BASE_URL` |
| `dom.ts`, `types.ts` | Utilidades de DOM y tipos compartidos |

## Cómo añadir contenido

Los esquemas se validan dos veces: Astro los aplica al construir y `npm test` los vuelve a aplicar
leyendo los ficheros del disco. Un error de formato rompe el build y las pruebas, nunca la web
publicada.

### Una unidad

Añade `src/content/units/<id>.yaml`:

```yaml
title:
  es: El alfabeto armenio
  en: The Armenian alphabet
description:
  es: Las 39 letras, sus nombres, su sonido y sus primeras palabras.
  en: The 39 letters, their names, their sounds and your first words.
order: 1
accent: red            # red | blue | orange
```

### Una lección

Añade `src/content/lessons/<id>.md`. El nombre del fichero es el identificador de la lección y de la
URL (`/lecciones/<id>`). El frontmatter admite:

| Campo | Tipo | Notas |
|---|---|---|
| `title` | `{es, en}` | |
| `summary` | `{es, en}` | Una línea, para las tarjetas del índice |
| `unit` | id de unidad | Debe existir en `src/content/units/` |
| `order` | entero > 0 | Orden dentro de la unidad |
| `objectives` | `[{es, en}]`, mínimo 1 | Lo que se muestra como objetivos |
| `vocab` | lista, mínimo 1 | Entradas de vocabulario (ver abajo) |
| `exercises` | lista, mínimo 3 | Ejercicios (ver abajo) |
| `draft` | booleano, por defecto `false` | |

Cada entrada de `vocab` tiene `hy` (forma armenia canónica), `roman`, la glosa `es` y `en`, un `kind`
(`letter`, `word` o `phrase`, por defecto `word`), etiquetas libres en `tags` y una `note` bilingüe
opcional para explicar irregularidades. Lo que se recolecta de todas las lecciones alimenta el mazo
de práctica libre y el repaso espaciado.

Los ejercicios comparten `id` (en kebab-case minúsculas, único), `prompt` bilingüe y `hint`
opcional. El campo `type` elige el formato:

| `type` | Campos propios |
|---|---|
| `multiple-choice` | `options` (mínimo 2) y `answer` (índice de la opción correcta); `explanation` opcional |
| `typing` | `answer` (lista de variantes aceptadas) y `mode` (`armenian` por defecto, o `roman` para admitir entrada latina) |
| `fill-blank` | `template` con **exactamente un** `{}` y `answer` |
| `match-pairs` | `pairs`: mínimo 3 objetos `{left, right}` |
| `order-words` | `tokens` (el banco, en orden de presentación) y `answer` (una permutación exacta de `tokens`) |
| `flashcard` | `front`, `back` y `roman` opcional |

Ejemplo de los dos formatos más comunes:

```yaml
exercises:
  - type: multiple-choice
    id: alf-01-mc-1
    prompt:
      es: "¿Qué sonido representa ա?"
      en: "What sound does ա represent?"
    options: ["a", "e", "o"]
    answer: 0

  - type: typing
    id: alf-01-ty-1
    prompt:
      es: "Escribe la vocal que suena «i»."
      en: "Type the vowel that sounds «i»."
    answer: ["ի"]
    hint:
      es: "Pista: es la undécima letra del alfabeto."
      en: "Hint: it is the eleventh letter of the alphabet."
```

Después del frontmatter, el cuerpo Markdown es la explicación de la lección: encabezados, tablas y
las negritas que quieras. Se renderiza tal cual debajo de los objetivos.

## Cómo funciona

- **Astro en modo estático** (`output: 'static'`), sin adaptador y sin renderizado en servidor: todo
  el HTML se genera durante el build.
- **Sin framework de UI.** Los componentes interactivos son ficheros `.astro` acompañados de módulos
  TypeScript en `src/scripts/` que se ejecutan en el navegador. No hay React, Vue ni Svelte, ni
  transiciones de vista.
- **El servidor no sabe nada del progreso.** Las páginas serializan una versión compacta del
  currículum y de la lección en el propio HTML, y los scripts pintan el estado leyendo
  `localStorage`. Por eso la web es un montón de ficheros y no necesita API.
- **Los ejercicios de escritura se responden en armenio.** Se rechaza la entrada latina y hay un
  teclado armenio en pantalla; la pista muestra la romanización de la respuesta. Si un ejercicio debe
  aceptar latín, se marca con `mode: roman`.
- **Bilingüe sin duplicar rutas.** El HTML se sirve en español y el idioma se cambia en el cliente:
  los nodos llevan `data-i18n`, `data-i18n-aria-label` o `data-i18n-title`, y las glosas alternan por
  CSS con `data-gloss-lang`. El atributo `lang` del documento se actualiza con el idioma elegido.
- **Cero peticiones a terceros.** La fuente armenia (Noto Sans Armenian, autoalojada) y el favicon se
  sirven desde el propio sitio; no hay analítica ni CDNs.
- **Repaso espaciado tipo Leitner.** Cada tarjeta vive en una caja de 0 a 5 con intervalos de 0, 1, 3,
  7, 16 y 35 días: `again` la devuelve a la caja 0, `hard` la mantiene (mínimo 1), `good` sube una
  caja y `easy` sube dos. La práctica libre cuenta la calificación pero no reprograma la tarjeta.
- **Las unidades se abren en orden.** La primera está disponible siempre; las siguientes se
  desbloquean al completar todas las lecciones de la anterior. Las lecciones bloqueadas se pueden
  estudiar igualmente con el botón *Estudiar de todas formas*.

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Portada con el progreso general y las unidades |
| `/lecciones` | Índice de las 15 lecciones |
| `/lecciones/<id>` | Lección: objetivos, vocabulario, explicación y ejercicios |
| `/unidades/<id>` | Unidad con sus lecciones y su anillo de progreso |
| `/abecedario` | Las 39 letras agrupadas en vocales, familiares y nuevas, en tarjetas desplegables sin JavaScript |
| `/practica` | Práctica libre estilo Anki: todo el mazo, por unidad, por etiqueta o solo tus favoritas |
| `/progreso` | Estadísticas, mapa de actividad, cajas del repaso y exportar/importar/reiniciar |
| `/ajustes` | Tema, idioma y control de los datos locales |
| `/404` | Página de error propia |

## Progreso y datos locales

Todo se guarda en `localStorage`, bajo el origen desde el que abras la web:

| Clave | Contenido |
|---|---|
| `hy:progress:v1` | Progreso: lecciones, intentos por ejercicio, tarjetas del repaso y actividad diaria |
| `hy:theme` | Tema claro u oscuro |
| `hy:lang` | Idioma de la interfaz (`es` o `en`) |

El estado es un documento versionado: si la versión no coincide, se empieza de cero en lugar de
romperse. Cualquier cambio emite el evento `hy:progress-changed`, que es lo que mantiene
sincronizados la cabecera, los anillos y las estadísticas sin recargar.

El progreso **no se sincroniza entre dispositivos ni navegadores**, y borrar los datos del sitio lo
elimina. Para moverlo, `/progreso` permite exportarlo e importarlo como JSON, y `/ajustes` permite
reiniciarlo.

## Tests

`npm test` ejecuta 78 pruebas de Vitest sobre la lógica pura y sobre el contenido:

- **Lógica**: repaso espaciado, migración y registro del progreso, normalización de texto,
  romanización, comprobación de respuestas e idioma.
- **Currículum**: orden, progreso por unidad y desbloqueos.
- **Integridad del contenido**: valida el frontmatter de todas las lecciones y unidades con los
  mismos esquemas que usa Astro, comprueba la unicidad de los identificadores de ejercicio, revisa el
  vocabulario y contrasta la romanización con la tabla del alfabeto.

## Despliegue en Cloudflare Workers

El sitio se publica como **Worker con Static Assets**: `dist/` se sube tal cual y la configuración
vive en `wrangler.jsonc`. El Worker no ejecuta código en ninguna petición, así que no hay
invocaciones facturables ni adaptador de Astro que instalar.

Dos detalles de esa configuración que no conviene cambiar sin querer:

- `html_handling: "drop-trailing-slash"` — los enlaces internos se generan sin barra final, así que
  `/lecciones/alfabeto-01` responde 200 en lugar de redirigir con un 307 en cada navegación.
- `not_found_handling: "404-page"` — sirve el `dist/404.html` con estado 404.

Las cabeceras de caché y seguridad están en `public/_headers`, que Astro copia a `dist/_headers`:
los ficheros de `/_astro/` llevan un hash en el nombre y se cachean un año como inmutables, mientras
que la fuente armenia (sin hash) conserva la revalidación por defecto. No hay `Content-Security-Policy`
a propósito: la página lleva un script en línea para aplicar el tema antes del primer pintado.

### Publicar con la integración Git (recomendado)

En el panel de Cloudflare, **Workers & Pages → Create application → Import a repository**:

| Ajuste | Valor |
|---|---|
| Repositorio | este repositorio |
| Rama de producción | `main` |
| Nombre del Worker | `learn-armenian` (debe coincidir con `name` de `wrangler.jsonc`) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Cloudflare instala las dependencias y gestiona el token por su cuenta, y usa la versión de Wrangler
fijada en `package.json`. La imagen de build ya trae Node 24, así que el `.nvmrc` solo fija la
versión de forma explícita.

### Publicar desde tu máquina

```sh
npx wrangler login      # una sola vez
npm run deploy          # build + wrangler deploy
```

`npm run preview:cf` levanta el mismo runtime en `http://localhost:8787` para comprobar rutas y
cabeceras antes de publicar.

Para servir el sitio en un subdirectorio basta con ajustar `base` en `astro.config.mjs`: `href()`
prefija todas las rutas internas automáticamente.

## Licencia

MIT © 2026 Matheo Franco. Consulta [LICENSE](LICENSE).
