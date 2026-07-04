import { countCards, getAllCards, putCards } from "../db";
import type { Card } from "../types";

const CARDS_JSON_URL = `${import.meta.env.BASE_URL}english_cards_300_words_template.json`;

async function fetchCardsFromJSON(): Promise<Card[]> {
  const response = await fetch(CARDS_JSON_URL);
  if (!response.ok) {
    throw new Error(
      `No se pudo cargar ${CARDS_JSON_URL}: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

/**
 * Devuelve las tarjetas desde IndexedDB, hidratándolas desde el JSON fuente
 * si hace falta. Compara el conteo local contra el JSON (no solo contra 0)
 * para que las tarjetas agregadas al dataset en el futuro lleguen a
 * navegadores que ya tenían datos guardados, sin duplicar nada (putCards
 * hace upsert por id).
 */
export async function loadCards(): Promise<Card[]> {
  const existingCount = await countCards();
  const cards = await fetchCardsFromJSON();

  if (cards.length > existingCount) {
    await putCards(cards);
    return cards;
  }

  return existingCount === 0 ? cards : getAllCards();
}
