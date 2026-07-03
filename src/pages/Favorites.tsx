import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCardsStore } from "../store/cardsStore";
import { useProgressStore } from "../store/progressStore";

export function Favorites() {
  const { cards, status: cardsStatus, fetchCards } = useCardsStore();
  const {
    progressByCardId,
    status: progressStatus,
    fetchProgress,
    toggleFavorite,
  } = useProgressStore();

  useEffect(() => {
    fetchCards();
    fetchProgress();
  }, [fetchCards, fetchProgress]);

  if (
    cardsStatus === "idle" ||
    cardsStatus === "loading" ||
    progressStatus === "idle" ||
    progressStatus === "loading"
  ) {
    return <p className="mt-10 text-center text-gray-500">Cargando...</p>;
  }

  const favoriteCards = cards.filter(
    (card) => progressByCardId.get(card.id)?.isFavorite,
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Favoritos</h1>
        {favoriteCards.length > 0 && (
          <Link
            to="/study?favorites=1"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Repasar favoritos
          </Link>
        )}
      </div>

      {favoriteCards.length === 0 ? (
        <p className="text-gray-500">
          Aún no marcaste ninguna tarjeta con ⭐. Puedes hacerlo desde la
          pantalla de Estudiar.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {favoriteCards.map((card) => (
            <li key={card.id} className="flex items-center gap-4 p-4">
              <img
                src={`${import.meta.env.BASE_URL}images/${card.image}`}
                alt={card.word}
                className="h-14 w-14 rounded-lg object-contain"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{card.word}</p>
                <p className="text-sm text-gray-500">{card.translation}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {card.category} · {card.level}
              </span>
              <button
                type="button"
                onClick={() => toggleFavorite(card.id)}
                className="text-2xl leading-none"
                aria-label="Quitar de favoritos"
              >
                ⭐
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
