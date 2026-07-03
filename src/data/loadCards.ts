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
 * Devuelve las 300 tarjetas desde IndexedDB. Si es la primera vez que se
 * abre la app (IndexedDB vacío), hidrata desde el JSON fuente primero.
 */
export async function loadCards(): Promise<Card[]> {
  const existingCount = await countCards();

  if (existingCount === 0) {
    const cards = await fetchCardsFromJSON();
    await putCards(cards);
    return cards;
  }

  return getAllCards();
}
