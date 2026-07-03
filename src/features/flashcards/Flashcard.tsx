import { motion } from "framer-motion";
import { useState } from "react";
import { useSpeech } from "../../hooks/useSpeech";
import type { Card } from "../../types";

interface FlashcardProps {
  card: Card;
}

export function Flashcard({ card }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const { speak } = useSpeech();

  return (
    <div className="mx-auto w-full max-w-sm [perspective:1200px]">
      <motion.div
        className="relative aspect-[3/4] w-full cursor-pointer [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onClick={() => setFlipped((f) => !f)}
        role="button"
        tabIndex={0}
        aria-label="Voltear tarjeta"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setFlipped((f) => !f);
        }}
      >
        {/* Frente */}
        <div className="absolute inset-0 flex flex-col items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-lg [backface-visibility:hidden]">
          <img
            src={`${import.meta.env.BASE_URL}images/${card.image}`}
            alt={card.word}
            className="h-36 w-36 object-contain"
          />
          <div className="flex flex-col items-center gap-1 text-center">
            <h2 className="text-3xl font-semibold text-gray-900">
              {card.word}
            </h2>
            <p className="text-gray-500">{card.pronunciation}</p>
            <p className="text-lg text-gray-700">{card.translation}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speak(card.word);
            }}
            className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            aria-label={`Escuchar pronunciación de ${card.word}`}
          >
            🔊 Escuchar
          </button>
        </div>

        {/* Dorso */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-indigo-50 p-6 text-center shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-xl font-medium text-gray-900">{card.sentence}</p>
          <p className="text-gray-500">{card.sentencePronunciation}</p>
          <p className="text-lg text-gray-700">{card.sentenceTranslation}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speak(card.sentence);
            }}
            className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            aria-label="Escuchar frase de ejemplo"
          >
            🔊 Escuchar frase
          </button>
        </div>
      </motion.div>
    </div>
  );
}
