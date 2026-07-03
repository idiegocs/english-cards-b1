# Diagramas de secuencia — English Cards

Ver también [`architecture.md`](./architecture.md) para el mapa general de
capas y carpetas.

## 1. Primera carga de la app (hidratación del JSON a IndexedDB)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant P as Study.tsx (página)
    participant CS as cardsStore
    participant LC as loadCards.ts
    participant DB as db/index.ts (idb)
    participant IDB as IndexedDB
    participant JSON as public/*.json

    U->>P: Abre /study
    P->>CS: fetchCards()
    CS->>LC: loadCards()
    LC->>DB: countCards()
    DB->>IDB: count("cards")
    IDB-->>DB: 0 (primera vez)
    DB-->>LC: 0
    LC->>JSON: fetch(english_cards_300_words_template.json)
    JSON-->>LC: 300 tarjetas
    LC->>DB: putCards(cards)
    DB->>IDB: tx.put x300
    LC-->>CS: 300 tarjetas
    CS-->>P: status: "ready", cards
    P-->>U: Renderiza la primera tarjeta
```

En arranques siguientes, `countCards()` devuelve 300 y `loadCards()` lee
directo de IndexedDB (`getAllCards()`) sin volver a pedir el JSON.

## 2. Estudiar una tarjeta y responder (SRS + persistencia)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant FC as Flashcard.tsx
    participant SC as Study.tsx
    participant PS as progressStore
    participant SM2 as sm2.ts
    participant DB as db/index.ts
    participant IDB as IndexedDB
    participant LS as localStorage (studySession)

    U->>FC: Click en la tarjeta (voltear)
    FC->>SC: onFlip()
    SC-->>FC: flipped = true (muestra frase + botones Again/Hard/Good/Easy)
    U->>SC: Click "Good"
    SC->>PS: answerCard(cardId, "good")
    PS->>SM2: applyStudyResult(prev, cardId, "good")
    SM2-->>PS: nuevo CardProgress (easeFactor, interval, dueDate)
    PS->>DB: putProgress(nuevo)
    DB->>IDB: put("progress", nuevo)
    PS-->>SC: progressByCardId actualizado
    SC->>SC: index += 1, flipped = false
    SC->>LS: saveStudySession(filtrosKey, cardIds, index)
    SC-->>U: Renderiza la siguiente tarjeta
```

Si la respuesta es "Again", `Study.tsx` no solo avanza el índice: reinserta
la misma tarjeta ~3 posiciones más adelante en la cola de la sesión actual
(no al final del día), para reforzarla pronto sin salir de la sesión.

## 3. Cambiar de filtro / refrescar la página

```mermaid
sequenceDiagram
    actor U as Usuario
    participant SC as Study.tsx
    participant SQ as studyQueue.ts
    participant SS as studySession.ts (localStorage)

    U->>SC: Selecciona categoría "Food"
    SC->>SC: filtersKey cambia
    SC->>SS: loadStudySession("Food|...")
    alt Hay sesión guardada hoy para ese filtro
        SS-->>SC: cola + índice guardados
    else No hay sesión (o es de otro día)
        SC->>SQ: buildStudyQueue(cards, progress, {category: "Food"})
        SQ-->>SC: cola nueva (vencidas + nuevas de Food, barajada)
        SC->>SS: saveStudySession("Food|...", cardIds, 0)
    end
    SC-->>U: Renderiza la primera tarjeta de esa cola
```

Sin filtros, `buildStudyQueue` incluye las 300 tarjetas (vencidas primero,
luego nuevas); con un filtro activo, solo el subconjunto que coincide —
sin un límite diario que oculte tarjetas en ninguno de los dos casos.

## 4. Exportar / importar progreso (respaldo manual entre dispositivos)

```mermaid
sequenceDiagram
    actor U as Usuario
    participant S as Settings.tsx
    participant DB as db/index.ts
    participant IDB as IndexedDB
    participant PS as progressStore

    Note over U,IDB: Exportar (dispositivo A)
    U->>S: Click "Exportar progreso"
    S->>DB: getAllProgress()
    DB->>IDB: getAll("progress")
    IDB-->>DB: CardProgress[]
    DB-->>S: CardProgress[]
    S-->>U: Descarga english-cards-b1-progress-YYYY-MM-DD.json

    Note over U,PS: Importar (dispositivo B)
    U->>S: Selecciona el .json exportado
    S->>PS: importProgress(entries)
    loop por cada CardProgress entrante
        PS->>PS: ¿existe local y es más reciente (updatedAt)?
        alt Entrante es más nuevo o no existe local
            PS->>DB: putProgressBatch([...])
            DB->>IDB: put("progress", entrada)
        else Local es más nuevo
            PS->>PS: se descarta la entrante
        end
    end
    PS-->>S: cantidad de registros importados
    S-->>U: "Se importaron N de M registros"
```
