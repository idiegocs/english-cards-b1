import { create } from "zustand";
import { loadCards } from "../data/loadCards";
import type { Card } from "../types";

interface CardsState {
  cards: Card[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  fetchCards: () => Promise<void>;
}

export const useCardsStore = create<CardsState>((set, get) => ({
  cards: [],
  status: "idle",
  error: null,

  fetchCards: async () => {
    if (get().status === "loading" || get().status === "ready") return;

    set({ status: "loading", error: null });
    try {
      const cards = await loadCards();
      set({ cards, status: "ready" });
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  },
}));
