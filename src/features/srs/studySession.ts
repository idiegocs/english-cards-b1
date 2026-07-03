const STORAGE_PREFIX = "english-cards-b1:study:";

interface StoredSession {
  cardIds: number[];
  index: number;
  savedAt: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isStoredSession(value: unknown): value is StoredSession {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as StoredSession).cardIds) &&
    typeof (value as StoredSession).index === "number" &&
    typeof (value as StoredSession).savedAt === "string"
  );
}

/**
 * Recupera la cola de estudio guardada para un filtro dado, siempre que se
 * haya guardado hoy mismo. Al día siguiente se descarta a propósito, para
 * que la cola vuelva a calcularse con las tarjetas vencidas/nuevas del día.
 */
export function loadStudySession(filtersKey: string): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + filtersKey);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isStoredSession(parsed) || parsed.savedAt !== todayISO()) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function saveStudySession(
  filtersKey: string,
  cardIds: number[],
  index: number,
): void {
  const payload: StoredSession = { cardIds, index, savedAt: todayISO() };
  localStorage.setItem(STORAGE_PREFIX + filtersKey, JSON.stringify(payload));
}
