# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # tsc -b (type-check) + vite build -> dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint over the project
```

There is no test suite/runner configured in this project.

The app is served under a subpath in production (`base: '/english-cards-b1/'`
in `vite.config.ts`, for GitHub Pages). `npm run dev` still runs at the
repo root path; when testing built output, remember requests are prefixed
with that base.

## Architecture

Full diagrams (Mermaid) live in `docs/architecture.md` and
`docs/sequence-diagrams.md` — read those first for the data-flow story.
The product spec/roadmap lives in `docs/specs/English_Cards_B1_Prompt.md`.

**This is a 100% client-side app: no backend.** React renders the UI,
Zustand holds in-memory state for the session, and IndexedDB (via the
`idb` library) is the only persistence layer, in the browser. There is no
login/account system — everything is local to one browser, with a manual
export/import-as-JSON feature (`src/pages/Settings.tsx`) as the only
cross-device backup path.

### Data flow

- The 300-card dataset is a static JSON file,
  `public/english_cards_300_words_template.json` (it must live under
  `public/` — that's what Vite serves as-is, at the `BASE_URL`, for the
  runtime `fetch`; it is not bundled/imported into the JS). `src/data/loadCards.ts` fetches it **only on first run** (checked
  via `countCards()` in IndexedDB) and writes it into IndexedDB; every
  subsequent load reads from IndexedDB instead of re-fetching the JSON.
- `src/db/index.ts` wraps `idb` with two object stores: `cards` (keyed by
  `id`) and `progress` (keyed by `cardId`, one `CardProgress` record per
  card — see `src/types.ts`).
- Two Zustand stores mediate all reads/writes:
  - `src/store/cardsStore.ts` — loads/exposes the 300 `Card` records.
  - `src/store/progressStore.ts` — exposes `progressByCardId` plus
    `answerCard`, `toggleFavorite`, `importProgress`. Every mutation
    writes to IndexedDB immediately (no explicit save step anywhere).

### Spaced repetition (`src/features/srs/`)

- `sm2.ts` — simplified SM-2: given the previous `CardProgress` (or none)
  and a `StudyResult` (`again | hard | good | easy`), returns the next
  `easeFactor`/`interval`/`dueDate`.
- `studyQueue.ts` — `buildStudyQueue(cards, progressByCardId, filters)`
  orders the study session: overdue cards first (oldest `dueDate` first),
  then never-studied cards, shuffled within each priority group. **No
  daily cap** — with no filter active it returns all 300 cards; a
  category/level/favorites filter narrows the same pool, it doesn't
  additionally limit count. (An earlier per-day new-card limit was
  deliberately removed — see git history / user feedback in this area
  before reintroducing anything like it.)
- `studySession.ts` — persists the current queue (as card IDs) + index in
  `localStorage`, keyed by the active filter combination and scoped to
  the current calendar day. This is what makes refreshing `/study` resume
  at the same card instead of re-shuffling; a new day discards it so
  due/new cards get recalculated.

`src/pages/Study.tsx` wires these together: it tries to restore a saved
session for the current filters first, and only calls `buildStudyQueue`
when there's nothing to restore. On "again" it doesn't just re-show the
card — it splices it back into the in-session queue ~3 cards ahead rather
than sending it to the back of the whole day.

### Flashcard UI (`src/features/flashcards/Flashcard.tsx`)

Controlled component: `flipped` state and prev/next navigation live in
the parent (`Study.tsx`), not inside `Flashcard`, so the parent can
reason about session position. Both the front and back faces render a
`NavRow` (`‹` prev / 🔊 listen / `›` next) — prev/next advance **without**
recording an SRS answer (that only happens via the Again/Hard/Good/Easy
buttons in `Study.tsx`'s fixed bottom bar). Audio uses
`src/hooks/useSpeech.ts`, a thin wrapper over `SpeechSynthesis` (`en-US`).

The answer buttons live in a `fixed`/sticky bottom bar in `Study.tsx`,
not inline in page flow — an earlier inline layout let them render below
the viewport fold on normal screen sizes, making the app look stuck. Keep
any future controls that gate progression in that same fixed bar, or
verify visibility at common viewport heights (~720px) before shipping.

### Routing

`HashRouter` (not `BrowserRouter`) is required — GitHub Pages can't do
SPA server-side rewrites, so hash-based routes are the only way deep
routes survive a refresh. Any internal asset URL (images, the JSON
dataset) must be prefixed with `import.meta.env.BASE_URL`, not assumed to
be root-relative, because of the `/english-cards-b1/` base path.

### Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on push
to `master` via `actions/upload-pages-artifact` /
`actions/deploy-pages` (Pages configured for Actions-based builds, not a
`gh-pages` branch).

### Images

`public/images/*.jpg` (300 files, one per card, filename = `card.image`
field) were generated for free via Stable Diffusion (`sdxl-turbo`) on
Google Colab. The notebook is versioned at
`scripts/english_flashcards_image_generator.ipynb` for regenerating or
restyling images later without rebuilding the pipeline from scratch.
