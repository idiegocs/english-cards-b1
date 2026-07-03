import { motion } from "framer-motion";
import type { ReactNode } from "react";
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
  autoplay?: boolean;
  onToggleAutoplay?: () => void;
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
  autoplay = false,
  onToggleAutoplay,
}: FlashcardProps) {
  const { speak } = useSpeech();

  const showNav = Boolean(onPrevious || onNext);

  function NavRow({
    onListen,
    listenAriaLabel,
    listenText,
    dark = false,
    beforeListen,
  }: {
    onListen: () => void;
    listenAriaLabel: string;
    listenText: string;
    dark?: boolean;
    beforeListen?: ReactNode;
  }) {
    const navButtonClass = dark
      ? "rounded-full border border-white/60 bg-black/30 px-2.5 py-2 text-white backdrop-blur-sm hover:bg-black/50 disabled:opacity-30"
      : "rounded-full border border-gray-300 px-2.5 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-30";

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
            className={navButtonClass}
            aria-label="Tarjeta anterior"
            title="Tarjeta anterior"
          >
            ‹
          </button>
        )}
        {beforeListen}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onListen();
          }}
          className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          aria-label={listenAriaLabel}
          title={listenAriaLabel}
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
            className={navButtonClass}
            aria-label="Siguiente tarjeta"
            title="Siguiente tarjeta"
          >
            ›
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-sm [perspective:1200px]">
      {/* Pila de tarjetas detrás, para dar sensación de mazo */}
      <div className="pointer-events-none absolute inset-0 translate-x-2 translate-y-3 rotate-3 rounded-2xl border border-gray-200 bg-gray-100 shadow-md" />
      <div className="pointer-events-none absolute inset-0 translate-x-1 translate-y-1.5 -rotate-2 rounded-2xl border border-gray-200 bg-white shadow-md" />

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
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-gray-200 shadow-lg [backface-visibility:hidden]">
          {/* Título */}
          <div className="relative shrink-0 bg-slate-900 px-8 py-2 text-center">
            <h3 className="truncate text-sm font-semibold uppercase tracking-wide text-white">
              {card.word}
            </h3>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl leading-none text-white"
                aria-label={
                  isFavorite ? "Quitar de favoritos" : "Marcar como favorito"
                }
                title={
                  isFavorite ? "Quitar de favoritos" : "Marcar como favorito"
                }
              >
                {isFavorite ? "⭐" : "☆"}
              </button>
            )}
          </div>

          {/* Imagen */}
          <div className="relative min-h-0 flex-1">
            <img
              src={`${import.meta.env.BASE_URL}images/${card.image}`}
              alt={card.word}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-center gap-2 rounded-xl bg-slate-900/35 px-3 py-2.5 text-center shadow-lg backdrop-blur-md">
              <p className="text-lg font-semibold text-amber-300 [text-shadow:0_1px_3px_rgb(0_0_0_/_90%)]">
                {card.word}
              </p>
              <span className="text-gray-400">•</span>
              <p className="text-base italic text-sky-300 [text-shadow:0_1px_3px_rgb(0_0_0_/_90%)]">
                /{card.pronunciation}/
              </p>
              <span className="text-gray-400">•</span>
              <p className="text-lg font-medium text-emerald-300 [text-shadow:0_1px_3px_rgb(0_0_0_/_90%)]">
                {card.translation}
              </p>
            </div>
          </div>

          {/* Barra de controles: separada, no tapa la imagen, contrasta con el título */}
          <div className="flex shrink-0 items-center justify-center bg-slate-900 px-3 py-2.5">
            <NavRow
              onListen={() => speak(card.word)}
              listenAriaLabel={`Escuchar pronunciación de ${card.word}`}
              listenText="🔊 Escuchar"
              dark
              beforeListen={
                onToggleAutoplay && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleAutoplay();
                    }}
                    className="rounded-full bg-indigo-600 px-2.5 py-2 text-white hover:bg-indigo-700"
                    aria-label={
                      autoplay
                        ? "Pausar avance automático"
                        : "Iniciar avance automático"
                    }
                    title={
                      autoplay
                        ? "Pausar avance automático"
                        : "Iniciar avance automático"
                    }
                  >
                    {autoplay ? "⏸" : "▶"}
                  </button>
                )
              }
            />
          </div>
        </div>

        {/* Dorso */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl border border-gray-200 bg-[#f6f1e6] shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {/* Textura de papel/cartulina */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch' result='noise'/%3E%3CfeColorMatrix in='noise' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.8 -0.6'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
          {/* Fibra de papel: líneas finas y sutiles */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.01 0.25' numOctaves='2' stitchTiles='stitch' result='noise'/%3E%3CfeColorMatrix in='noise' type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.6 -0.5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E\")",
            }}
          />
          {/* Viñeta sutil para dar sensación de borde/relieve de tarjeta física */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_16px_rgba(0,0,0,0.1)]" />

          <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="text-xl font-medium text-gray-900">
              {card.sentence}
            </p>
            <p className="text-gray-500">{card.sentencePronunciation}</p>
            <p className="text-lg text-gray-700">{card.sentenceTranslation}</p>
            <NavRow
              onListen={() => speak(card.sentence)}
              listenAriaLabel="Escuchar frase de ejemplo"
              listenText="🔊 Escuchar frase"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
