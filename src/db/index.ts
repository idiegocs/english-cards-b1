import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Card, CardProgress } from "../types";

interface EnglishCardsDB extends DBSchema {
  cards: {
    key: number;
    value: Card;
  };
  progress: {
    key: number;
    value: CardProgress;
  };
}

const DB_NAME = "english-cards-b1";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<EnglishCardsDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<EnglishCardsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("cards")) {
          db.createObjectStore("cards", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: "cardId" });
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllCards(): Promise<Card[]> {
  const db = await getDB();
  return db.getAll("cards");
}

export async function putCards(cards: Card[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("cards", "readwrite");
  await Promise.all(cards.map((card) => tx.store.put(card)));
  await tx.done;
}

export async function countCards(): Promise<number> {
  const db = await getDB();
  return db.count("cards");
}

export async function getAllProgress(): Promise<CardProgress[]> {
  const db = await getDB();
  return db.getAll("progress");
}

export async function getProgress(
  cardId: number,
): Promise<CardProgress | undefined> {
  const db = await getDB();
  return db.get("progress", cardId);
}

export async function putProgress(progress: CardProgress): Promise<void> {
  const db = await getDB();
  await db.put("progress", progress);
}
