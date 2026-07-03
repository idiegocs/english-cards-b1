import type { Card, CardProgress, CEFRLevel } from "../../types";

export interface StudyQueueFilters {
  category?: string;
  level?: CEFRLevel;
  favoritesOnly?: boolean;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleGroupedByDueDate(due: { card: Card; dueDate: string }[]): Card[] {
  const groups = new Map<string, Card[]>();
  for (const { card, dueDate } of due) {
    const group = groups.get(dueDate) ?? [];
    group.push(card);
    groups.set(dueDate, group);
  }

  const orderedDates = [...groups.keys()].sort();
  return orderedDates.flatMap((date) => shuffle(groups.get(date)!));
}

/**
 * Construye la cola de estudio (sección 5.2 del plan):
 * 1. Tarjetas vencidas primero, las más atrasadas antes.
 * 2. Luego las tarjetas nuevas (nunca estudiadas).
 * 3. Filtradas por categoría/nivel/favoritos si aplica; sin filtro se
 *    incluyen las 300.
 * 4. Barajadas dentro de cada grupo de prioridad.
 */
export function buildStudyQueue(
  cards: Card[],
  progressByCardId: Map<number, CardProgress>,
  filters: StudyQueueFilters = {},
): Card[] {
  const todayISO = new Date().toISOString().slice(0, 10);

  const filtered = cards.filter((card) => {
    if (filters.category && card.category !== filters.category) return false;
    if (filters.level && card.level !== filters.level) return false;
    if (filters.favoritesOnly && !progressByCardId.get(card.id)?.isFavorite) {
      return false;
    }
    return true;
  });

  const due: { card: Card; dueDate: string }[] = [];
  const newCards: Card[] = [];

  for (const card of filtered) {
    const progress = progressByCardId.get(card.id);
    if (!progress) {
      newCards.push(card);
      continue;
    }
    if (progress.dueDate <= todayISO) {
      due.push({ card, dueDate: progress.dueDate });
    }
  }

  const dueQueue = shuffleGroupedByDueDate(due);
  const newQueue = shuffle(newCards);

  return [...dueQueue, ...newQueue];
}
