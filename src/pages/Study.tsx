import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiltersBar, type CardFilters } from "../features/filters/FiltersBar";
import { Flashcard } from "../features/flashcards/Flashcard";
import { buildStudyQueue } from "../features/srs/studyQueue";
import { loadStudySession, saveStudySession } from "../features/srs/studySession";
import { useSpeech } from "../hooks/useSpeech";
import { useCardsStore } from "../store/cardsStore";
import { useProgressStore } from "../store/progressStore";
import type { Card, StudyResult } from "../types";

const RESULT_BUTTONS: { result: StudyResult; label: string; className: string }[] = [
  { result: "again", label: "Again", className: "bg-red-100 text-red-700 hover:bg-red-200" },
  { result: "hard", label: "Hard", className: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  { result: "good", label: "Good", className: "bg-green-100 text-green-700 hover:bg-green-200" },
  { result: "easy", label: "Easy", className: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
];

export function Study() {
  const { cards, status: cardsStatus, error, fetchCards } = useCardsStore();
  const {
    progressByCardId,
    status: progressStatus,
    fetchProgress,
    answerCard,
    toggleFavorite,
  } = useProgressStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<CardFilters>({
    category: searchParams.get("category") ?? "",
    level: "",
  });
  const [favoritesOnly, setFavoritesOnly] = useState(
    searchParams.get("favorites") === "1",
  );
  const [queue, setQueue] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const { speak, cancel } = useSpeech();
  const { speak: speakEs, cancel: cancelEs } = useSpeech("es-ES");

  useEffect(() => {
    fetchCards();
    fetchProgress();
  }, [fetchCards, fetchProgress]);

  useEffect(() => {
    const current = queue[index];
    if (!current) return;
    speak(current.word);
    // Cancela el audio si la tarjeta vuelve a cambiar (o se desmonta)
    // antes de terminar. Sin esto, el doble-invocado de efectos de
    // StrictMode en desarrollo dispara dos speak() seguidos para la
    // misma tarjeta y a veces se alcanza a oír un resto de la voz por
    // defecto del sistema antes de que la segunda llamada la corte.
    return () => cancel();
    // Solo debe sonar cuando cambia la tarjeta mostrada, no en cada
    // render (p. ej. al marcar favorito).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue[index]?.id]);

  useEffect(() => {
    // En modo autoplay, dos segundos después de la palabra en inglés se
    // dice también la traducción en español, antes de que se cumplan
    // los 5s totales para avanzar de tarjeta.
    if (!autoplay) return;
    const current = queue[index];
    if (!current) return;

    const timeoutId = setTimeout(() => {
      speakEs(current.translation);
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
      cancelEs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, queue[index]?.id]);

  useEffect(() => {
    // No avanza mientras la tarjeta está volteada (mostrando la
    // respuesta): se pausa hasta que vuelva al frente.
    if (!autoplay || queue.length === 0 || flipped) return;

    const id = setInterval(() => {
      setIndex((i) => {
        if (i + 1 >= queue.length) {
          setAutoplay(false);
          return i;
        }
        return i + 1;
      });
    }, 5000);

    return () => clearInterval(id);
  }, [autoplay, queue.length, flipped]);

  const categories = useMemo(
    () => [...new Set(cards.map((card) => card.category))].sort(),
    [cards],
  );

  useEffect(() => {
    // Refleja la categoría elegida en la URL para que un refresh (o un
    // enlace copiado) conserve el filtro actual en vez de volver siempre
    // al que traía la URL original.
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (filters.category) {
          next.set("category", filters.category);
        } else {
          next.delete("category");
        }
        return next;
      },
      { replace: true },
    );
  }, [filters.category, setSearchParams]);

  const filtersKey = `${filters.category}|${filters.level}|${favoritesOnly}`;
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (cardsStatus !== "ready" || progressStatus !== "ready") return;

    // La sesión guardada solo se restaura en la carga inicial (para que
    // refrescar /study retome donde ibas). Si el usuario cambia de filtro
    // durante la sesión, siempre arranca en la primera tarjeta de ese
    // filtro, aunque ya lo hubiera terminado antes hoy mismo.
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      const saved = loadStudySession(filtersKey);
      if (saved) {
        const cardById = new Map(cards.map((c) => [c.id, c]));
        const restored = saved.cardIds
          .map((id) => cardById.get(id))
          .filter((c): c is Card => c !== undefined);

        if (restored.length === saved.cardIds.length && restored.length > 0) {
          setQueue(restored);
          setIndex(Math.min(saved.index, restored.length - 1));
          setFlipped(false);
          return;
        }
      }
    }

    const built = buildStudyQueue(cards, progressByCardId, {
      category: filters.category || undefined,
      level: filters.level || undefined,
      favoritesOnly,
    });
    setQueue(built);
    setIndex(0);
    setFlipped(false);
    // Solo se reconstruye (o recupera de localStorage) al cambiar de filtros
    // o al cargar por primera vez; no en cada respuesta, para no reordenar
    // la sesión de estudio en curso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsStatus, progressStatus, filtersKey]);

  useEffect(() => {
    if (queue.length === 0) return;
    saveStudySession(
      filtersKey,
      queue.map((c) => c.id),
      index,
    );
  }, [queue, index, filtersKey]);

  if (cardsStatus === "idle" || cardsStatus === "loading" || progressStatus === "idle" || progressStatus === "loading") {
    return <p className="mt-10 text-center text-gray-500">Cargando tarjetas...</p>;
  }

  if (cardsStatus === "error") {
    return (
      <p className="mt-10 text-center text-red-600">
        Error al cargar las tarjetas: {error}
      </p>
    );
  }

  const card = queue[index];

  async function handleAnswer(result: StudyResult) {
    if (!card) return;
    await answerCard(card.id, result);

    if (result === "again") {
      setQueue((currentQueue) => {
        const rest = currentQueue.filter((_, i) => i !== index);
        const insertAt = Math.min(rest.length, index + 3);
        return [...rest.slice(0, insertAt), card, ...rest.slice(insertAt)];
      });
    } else {
      setIndex((i) => i + 1);
    }
    setFlipped(false);
  }

  function handleNext() {
    if (!card) return;
    setIndex((i) => i + 1);
    setFlipped(false);
  }

  function handlePrevious() {
    setIndex((i) => Math.max(0, i - 1));
    setFlipped(false);
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 pb-28 pt-6">
      <FiltersBar
        categories={categories}
        filters={filters}
        onChange={setFilters}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
      />

      {!card ? (
        <p className="mt-10 max-w-sm text-center text-gray-500">
          No hay tarjetas pendientes con estos filtros por hoy. Prueba a
          cambiar los filtros o vuelve mañana para repasar las siguientes.
        </p>
      ) : (
        <>
          <Flashcard
            key={card.id}
            card={card}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
            isFavorite={progressByCardId.get(card.id)?.isFavorite ?? false}
            onToggleFavorite={() => toggleFavorite(card.id)}
            onPrevious={handlePrevious}
            onNext={handleNext}
            hasPrevious={index > 0}
            autoplay={autoplay}
            onToggleAutoplay={() => setAutoplay((a) => !a)}
          />

          <span className="text-sm text-gray-500">
            {index + 1} / {queue.length}
          </span>
        </>
      )}

      {/* Barra fija: siempre visible sin necesidad de scroll, sin importar
          el alto del viewport ni el tamaño de la tarjeta. */}
      {card && (
        <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-sm flex-wrap items-center justify-center gap-3">
            {flipped ? (
              RESULT_BUTTONS.map(({ result, label, className }) => (
                <button
                  key={result}
                  type="button"
                  onClick={() => handleAnswer(result)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${className}`}
                >
                  {label}
                </button>
              ))
            ) : (
              <p className="text-sm text-gray-400">
                Toca la tarjeta para ver la respuesta, o usa ‹ › para
                avanzar/retroceder sin responder
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
