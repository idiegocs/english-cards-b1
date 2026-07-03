# PROMPT — English Cards B1

Quiero que actúes como un Arquitecto de Software Senior, UX/UI Designer
y Senior Frontend Engineer.

## 1. Visión y usuario objetivo

**English Cards B1** es una app web de flashcards para hispanohablantes que están
aprendiendo inglés desde nivel A1 hasta B1. El diferencial frente a apps genéricas
de flashcards es la **pronunciación adaptada al oído hispanohablante**: cada
palabra y cada frase de ejemplo incluyen un "respelling" fonético en caracteres
españoles (p. ej. `water` → `uó-ter`), además del audio nativo vía TTS.

Objetivos de producto:
- Aprender vocabulario de alta frecuencia con repetición espaciada (no solo
  "pasar tarjetas").
- Practicar oído y pronunciación sin depender de símbolos IPA.
- Funcionar completamente **offline** una vez instalada (PWA).
- Ser 100% gratuita y auto-contenida: sin backend, todo corre en el navegador.

## 2. Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand (estado global)
- Framer Motion (animaciones, flip de tarjetas)
- IndexedDB (persistencia local — progreso, favoritos, estadísticas)
- PWA (service worker + manifest, instalable y offline)
- Web Speech API (`SpeechSynthesis`) para audio TTS del inglés

## 3. Fuente de datos

Todo el contenido léxico vive en `english_cards_300_words_template.json`
(300 tarjetas ya completas), con este esquema:

```json
{
  "id": 1,
  "word": "apple",
  "pronunciation": "Á-pol",
  "translation": "manzana",
  "sentence": "This is an apple.",
  "sentencePronunciation": "Dis iz an Á-pol.",
  "sentenceTranslation": "Esto es una manzana.",
  "image": "apple.jpg",
  "category": "Food",
  "level": "A1"
}
```

- `pronunciation` / `sentencePronunciation`: respelling fonético en español
  (no IPA), pensado para lectura directa por un hispanohablante.
- `level`: CEFR real por palabra (`A1`, `A2`, `B1`), no uniforme — el dataset
  tiene ~194 A1, ~88 A2, ~18 B1, permitiendo progresión real dentro de la app.
- `category`: 24 categorías temáticas (Food, People, Body, Technology, Actions,
  Money, Communication, etc.) usadas para filtros y para agrupar el quiz.
- `image`: nombre de archivo (`word.jpg`) ya presente en `public/images/`
  (300/300 generadas — ver sección 3.1).

En arranque de la app, el JSON se carga una sola vez y se **hidrata en
IndexedDB** (tabla `cards`) junto con una tabla de progreso por tarjeta. Las
ejecuciones siguientes leen de IndexedDB, no del JSON, para soportar edición
de progreso offline.

### 3.1 Imágenes ✅

Las 300 imágenes ya están generadas y ubicadas en `public/images/`, con
nombre exacto igual al campo `image` de cada tarjeta (verificado 1:1 sin
faltantes ni sobrantes). Se generaron gratis con Stable Diffusion
(`stabilityai/sdxl-turbo`) corriendo en Google Colab (GPU gratuita), con un
prompt distinto según el tipo de palabra:
- Sustantivos concretos (Food, Objects, Animals, etc.): estilo ícono plano
  (`"a simple flat icon illustration of {word}, {category} theme..."`).
- Verbos/adjetivos/conceptos abstractos (Actions, Emotions, Adjectives...):
  estilo ilustración de concepto (`"a simple flat illustration representing
  the concept of '{word}'..."`).

El notebook usado para generarlas queda versionado en
`scripts/english_flashcards_image_generator.ipynb`, para poder regenerar o
ajustar el estilo de las imágenes en el futuro sin tener que rehacer el
proceso desde cero.

## 4. Arquitectura de carpetas

```
src/
  components/       # UI reutilizable (Button, Modal, ProgressBar, CardImage...)
  features/
    flashcards/      # Vista de tarjeta, flip, audio, respelling
    quiz/            # Generación y flujo de quiz de opción múltiple
    stats/           # Estadísticas de estudio
    favorites/       # Gestión de favoritos
    srs/             # Lógica de repetición espaciada (algoritmo + scheduler)
  store/             # Slices de Zustand (cards, progress, favorites, session)
  data/              # Carga/parseo del JSON fuente, validación de esquema
  db/                # Wrapper de IndexedDB (idb o Dexie), migraciones
  hooks/             # useCardQueue, useSpeech, useSpacedRepetition, etc.
  pages/             # Rutas: Home, Study, Quiz, Favorites, Stats, Settings
  pwa/               # manifest, registro de service worker
```

## 5. Modelo de datos de progreso (SRS)

Además de la tarjeta estática del JSON, cada `id` tiene un registro de progreso
en IndexedDB (algoritmo SM-2 simplificado):

```ts
interface CardProgress {
  cardId: number;
  easeFactor: number;   // factor de facilidad, inicia en 2.5
  interval: number;     // días hasta la próxima revisión
  repetitions: number;  // aciertos consecutivos
  dueDate: string;      // ISO date de próxima revisión
  isFavorite: boolean;
  lastResult: "again" | "hard" | "good" | "easy" | null;
}
```

Al responder una tarjeta (en modo estudio o quiz), se recalcula `easeFactor`,
`interval` y `dueDate` con SM-2, y se persiste inmediatamente en IndexedDB.

### 5.1 Guardado de progreso — automático, sin cuenta de usuario

No hay botón de "guardar" ni login: cada respuesta a una tarjeta escribe al
instante en IndexedDB. No hay backend ni servidor — todo vive en el
navegador, alineado con el objetivo de app 100% offline y gratuita.

**Limitación conocida:** el progreso queda atado al navegador/dispositivo
donde se usó la app; no hay sincronización automática entre dispositivos.
Para cubrir esto sin agregar backend, se incluye una función de
**exportar/importar progreso como archivo**:
- **Exportar**: botón en Ajustes que descarga un `.json` con todos los
  `CardProgress` (y `isFavorite`) del usuario — un respaldo manual.
- **Importar**: botón que permite cargar ese `.json` (por ejemplo, en otro
  navegador o tras reinstalar) y restaurar el progreso, sobrescribiendo o
  fusionando con lo que haya en IndexedDB (a definir en Fase 2: se
  recomienda fusionar tomando el registro más reciente por `cardId`
  usando una marca de tiempo `updatedAt`, para no perder avance accidental).

### 5.2 Cola de estudio — orden de aparición de las tarjetas

El orden en que se muestran las tarjetas (y por lo tanto las imágenes) no es
aleatorio puro ni sigue el orden del JSON; lo determina el motor de SRS:
1. Se priorizan tarjetas **vencidas** (`dueDate <= hoy`), las más atrasadas primero.
2. Se introducen tarjetas **nuevas** (nunca estudiadas) de a poco, respetando
   un límite diario configurable (por defecto ~10-15 nuevas/día) para no
   abrumar al usuario con las 300 de golpe.
3. Si hay un filtro activo (categoría y/o nivel), la cola se limita a esas
   tarjetas manteniendo la misma prioridad.
4. Dentro de un mismo grupo de prioridad, el orden se baraja para que no sea
   predecible de una sesión a otra.

## 6. Módulos funcionales

### 6.1 Flashcards
- Tarjeta con imagen, palabra, respelling, traducción.
- Flip con Framer Motion (frente: palabra+imagen, dorso: traducción+frase
  de ejemplo+respelling de la frase).
- Botón de audio (TTS nativo `en-US`) para palabra y para frase completa.
- Swipe/botones para marcar dificultad (Again / Hard / Good / Easy) que
  alimentan el SRS.

### 6.2 Repetición espaciada
- Cola de estudio diaria: tarjetas con `dueDate <= hoy`, priorizando las más
  vencidas.
- Nuevas tarjetas se introducen gradualmente (límite diario configurable).

### 6.3 Favoritos
- Toggle de favorito por tarjeta, filtro dedicado, y modo "repasar solo
  favoritos".

### 6.4 Filtros
- Por `category` y por `level` (A1/A2/B1), combinables.

### 6.5 Quiz
- Opción múltiple generado dinámicamente desde el dataset: se toma la
  tarjeta objetivo + 3 distractores de la misma categoría/nivel (para que
  no sean triviales).
- Modos: inglés→español, español→inglés, audio→palabra escrita.

### 6.6 Estadísticas
- Racha de días de estudio, tarjetas dominadas (`repetitions` altas),
  precisión (%), tiempo de estudio, progreso por categoría/nivel.

### 6.7 Exportar / Importar progreso (Ajustes)
- Botón "Exportar progreso": descarga un `.json` con el estado completo de
  `CardProgress` de todas las tarjetas (respaldo manual, sin backend).
- Botón "Importar progreso": permite seleccionar ese `.json` y restaurar el
  avance en el dispositivo actual, fusionando por `cardId` usando el registro
  más reciente (`updatedAt`) para evitar sobrescribir avance nuevo con uno
  viejo.
- Pensado para: cambiar de navegador/computador, o como respaldo antes de
  borrar datos del navegador.

### 6.8 Modo offline / PWA
- Manifest + ícono + service worker (Workbox o `vite-plugin-pwa`).
- Cache-first para el shell de la app, el JSON de datos y las imágenes.
- Instalable en escritorio y móvil.

## 7. Roadmap por fases

- **Fase 0 — Datos** ✅: dataset de 300 palabras completo y validado, más
  las 300 imágenes generadas (`english_cards_300_words_template.json` +
  `public/images/` + `scripts/english_flashcards_image_generator.ipynb`).

- **Fase 1 — Scaffold + Flashcards** (siguiente fase, detalle de tareas):
  1. Crear proyecto con Vite (`react-ts` template) y confirmar React 19 +
     TypeScript funcionando (`npm run dev`).
  2. Instalar y configurar Tailwind CSS.
  3. Instalar React Router y crear el esqueleto de rutas/páginas vacías:
     Home, Study, Quiz, Favorites, Stats, Settings (sección 4).
  4. Instalar Zustand y crear el store inicial (slice `cards`).
  5. Crear el wrapper de IndexedDB (con `idb`) definiendo las tablas
     `cards` y `progress` (esquema de la sección 5).
  6. Lógica de carga inicial: `fetch` del JSON desde `public/`, chequeo de
     "¿ya está hidratado IndexedDB?" y seed si es la primera vez.
  7. Componente `Flashcard`: imagen (`public/images/{image}`), palabra,
     pronunciation, translation.
  8. Flip con Framer Motion (frente/dorso) mostrando `sentence`,
     `sentencePronunciation`, `sentenceTranslation` en el dorso.
  9. Botón de audio con `SpeechSynthesis` (`en-US`) para palabra y frase.
  10. Página `Study` mínima: recorre las tarjetas desde el store
      (sin lógica SRS todavía — eso es Fase 2), navegación Anterior/Siguiente.

  Al final de esta fase: se puede abrir la app, ver una tarjeta con su
  imagen real, voltearla, y escuchar el audio — sin repetición espaciada
  ni persistencia de progreso todavía.

- **Fase 2 — SRS + persistencia**: algoritmo SM-2, cola de estudio diaria
  (sección 5.2), favoritos, filtros por categoría/nivel, exportar/importar
  progreso (sección 6.7).
- **Fase 3 — Quiz + Estadísticas**: generación de quiz, pantalla de stats,
  rachas.
- **Fase 4 — PWA + pulido**: offline completo, manifest/ícono, animaciones
  finales, responsive, accesibilidad (teclado, aria-labels), README.

## 8. Entregables

- Proyecto completo (React 19 + TS + Vite) funcionando localmente.
- README con instrucciones de instalación, build y estructura del proyecto.
- Código funcional, tipado, sin errores de lint/build.
- Arquitectura limpia siguiendo la carpeta descrita en la sección 4.
- Dataset de 300 palabras (`english_cards_300_words_template.json`) como
  única fuente de verdad de contenido.

## 9. Criterios de aceptación

- La app carga y funciona sin conexión tras la primera visita.
- Cada tarjeta reproduce audio TTS correctamente y muestra el respelling.
- El progreso (favoritos, SRS, stats) persiste entre sesiones vía IndexedDB,
  sin requerir cuenta de usuario ni login.
- El progreso se puede exportar a un archivo y volver a importar en otro
  navegador/dispositivo sin perder avance (fusión por `cardId`/`updatedAt`).
- El quiz nunca repite la tarjeta objetivo como distractor y siempre ofrece
  4 opciones coherentes con la categoría/nivel.
- Filtros por categoría y nivel funcionan de forma combinada.
