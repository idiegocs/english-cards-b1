import type { CardProgress, StudyResult } from "../../types";

const MIN_EASE_FACTOR = 1.3;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function createInitialProgress(cardId: number): CardProgress {
  const now = new Date().toISOString();
  return {
    cardId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: todayISO(),
    isFavorite: false,
    lastResult: null,
    updatedAt: now,
  };
}

/**
 * SM-2 simplificado: recalcula easeFactor, interval y dueDate a partir del
 * progreso previo (o crea uno nuevo si la tarjeta nunca se estudió).
 */
export function applyStudyResult(
  previous: CardProgress | null,
  cardId: number,
  result: StudyResult,
): CardProgress {
  const prev = previous ?? createInitialProgress(cardId);
  let { easeFactor, interval, repetitions } = prev;

  if (result === "again") {
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }

    const easeDelta = { hard: -0.15, good: 0, easy: 0.15 }[result];
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + easeDelta);
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return {
    cardId,
    easeFactor,
    interval,
    repetitions,
    dueDate: dueDate.toISOString().slice(0, 10),
    isFavorite: prev.isFavorite,
    lastResult: result,
    updatedAt: new Date().toISOString(),
  };
}
