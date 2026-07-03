import { useEffect, useState } from "react";
import { Flashcard } from "../features/flashcards/Flashcard";
import { useCardsStore } from "../store/cardsStore";

export function Study() {
  const { cards, status, error, fetchCards } = useCardsStore();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  if (status === "idle" || status === "loading") {
    return <p className="mt-10 text-center text-gray-500">Cargando tarjetas...</p>;
  }

  if (status === "error") {
    return (
      <p className="mt-10 text-center text-red-600">
        Error al cargar las tarjetas: {error}
      </p>
    );
  }

  const card = cards[index];

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-10">
      <Flashcard key={card.id} card={card} />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40"
        >
          ← Anterior
        </button>
        <span className="text-gray-500">
          {index + 1} / {cards.length}
        </span>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(cards.length - 1, i + 1))}
          disabled={index === cards.length - 1}
          className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
