export type CEFRLevel = "A1" | "A2" | "B1";

export interface Card {
  id: number;
  word: string;
  pronunciation: string;
  translation: string;
  sentence: string;
  sentencePronunciation: string;
  sentenceTranslation: string;
  image: string;
  category: string;
  level: CEFRLevel;
}

export type StudyResult = "again" | "hard" | "good" | "easy";

export interface CardProgress {
  cardId: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string;
  isFavorite: boolean;
  lastResult: StudyResult | null;
  updatedAt: string;
}
