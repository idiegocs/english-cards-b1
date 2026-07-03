import { motion } from "framer-motion";
import { useSpeech } from "../../hooks/useSpeech";
import type { Card } from "../../types";

interface FlashcardProps {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
}

export function Flashcard({
  card,
  flipped,
  onFlip,
  isFavorite = false,
  onToggleFavorite,
  onPrevious,
  onNext,
  hasPrevious = false,
}: FlashcardProps) {
  const { speak } = useSpeech();

  const showNav = Boolean(onPrevious || onNext);

  function NavRow({
    onListen,
    listenAriaLabel,
    listenText,
  }: {
    onListen: () => void;
    listenAriaLabel: string;
    listenText: string;
  }) {
    return (
      <div className="flex items-center gap-3">
        {showNav && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious?.();
            }}
            disabled={!hasPrevious}
            className="rounded-full border border-gray-300 px-2.5 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
            aria-label="Tarjeta anterior"
          >
            ‹
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onListen();
          }}
          className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          aria-label={listenAriaLabel}
        >
          {listenText}
        </button>
        {showNav && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            className="rounded-full border border-gray-300 px-2.5 py-2 text-gray-600 hover:bg-gray-50"
            aria-label="Siguiente tarjeta"
          >
            ›
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm [perspective:1200px]">
      <motion.div
        className="relative aspect-[4/5] max-h-[55vh] w-full cursor-pointer [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        aria-label="Voltear tarjeta"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onFlip();
        }}
      >
        {/* Frente */}
        <div className="absolute inset-0 flex flex-col items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-lg [backface-visibility:hidden]">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="absolute right-3 top-3 text-2xl leading-none"
              aria-label={
                isFavorite ? "Quitar de favoritos" : "Marcar como favorito"
              }
            >
              {isFavorite ? "⭐" : "☆"}
            </button>
          )}
          <img
            src={`${import.meta.env.BASE_URL}images/${card.image}`}
            alt={card.word}
            className="h-24 w-24 object-contain sm:h-28 sm:w-28"
          />
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-3xl font-semibold text-gray-900">
              {card.word}
            </h2>
            <p className="text-gray-500">{card.pronunciation}</p>
            <p className="text-lg text-gray-700">{card.translation}</p>
          </div>
          <NavRow
            onListen={() => speak(card.word)}
            listenAriaLabel={`Escuchar pronunciación de ${card.word}`}
            listenText="🔊 Escuchar"
          />
        </div>

        {/* Dorso */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-indigo-50 p-6 text-center shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-xl font-medium text-gray-900">{card.sentence}</p>
          <p className="text-gray-500">{card.sentencePronunciation}</p>
          <p className="text-lg text-gray-700">{card.sentenceTranslation}</p>
          <NavRow
            onListen={() => speak(card.sentence)}
            listenAriaLabel="Escuchar frase de ejemplo"
            listenText="🔊 Escuchar frase"
          />
        </div>
      </motion.div>
    </div>
  );
}
