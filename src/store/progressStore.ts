import { create } from "zustand";
import { getAllProgress, putProgress, putProgressBatch } from "../db";
import { applyStudyResult } from "../features/srs/sm2";
import type { CardProgress, StudyResult } from "../types";

interface ProgressState {
  progressByCardId: Map<number, CardProgress>;
  status: "idle" | "loading" | "ready" | "error";
  fetchProgress: () => Promise<void>;
  answerCard: (cardId: number, result: StudyResult) => Promise<void>;
  toggleFavorite: (cardId: number) => Promise<void>;
  importProgress: (entries: CardProgress[]) => Promise<number>;
}

function createFavoriteOnlyProgress(cardId: number): CardProgress {
  const now = new Date().toISOString();
  return {
    cardId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: now.slice(0, 10),
    isFavorite: true,
    lastResult: null,
    updatedAt: now,
  };
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressByCardId: new Map(),
  status: "idle",

  fetchProgress: async () => {
    if (get().status === "loading" || get().status === "ready") return;

    set({ status: "loading" });
    try {
      const all = await getAllProgress();
      set({
        progressByCardId: new Map(all.map((entry) => [entry.cardId, entry])),
        status: "ready",
      });
    } catch {
      set({ status: "error" });
    }
  },

  answerCard: async (cardId, result) => {
    const previous = get().progressByCardId.get(cardId) ?? null;
    const updated = applyStudyResult(previous, cardId, result);
    await putProgress(updated);
    set((state) => {
      const next = new Map(state.progressByCardId);
      next.set(cardId, updated);
      return { progressByCardId: next };
    });
  },

  toggleFavorite: async (cardId) => {
    const current = get().progressByCardId.get(cardId);
    const updated: CardProgress = current
      ? { ...current, isFavorite: !current.isFavorite, updatedAt: new Date().toISOString() }
      : createFavoriteOnlyProgress(cardId);
    await putProgress(updated);
    set((state) => {
      const next = new Map(state.progressByCardId);
      next.set(cardId, updated);
      return { progressByCardId: next };
    });
  },

  importProgress: async (entries) => {
    const state = get();
    const next = new Map(state.progressByCardId);
    const toPersist: CardProgress[] = [];

    for (const incoming of entries) {
      const existing = next.get(incoming.cardId);
      if (!existing || incoming.updatedAt > existing.updatedAt) {
        next.set(incoming.cardId, incoming);
        toPersist.push(incoming);
      }
    }

    if (toPersist.length > 0) {
      await putProgressBatch(toPersist);
      set({ progressByCardId: next });
    }

    return toPersist.length;
  },
}));
