import { useRef, useState } from "react";
import { getAllProgress } from "../db";
import { useProgressStore } from "../store/progressStore";
import type { CardProgress } from "../types";

function isCardProgressArray(value: unknown): value is CardProgress[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as CardProgress).cardId === "number" &&
        typeof (item as CardProgress).updatedAt === "string",
    )
  );
}

export function Settings() {
  const { importProgress } = useProgressStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    const entries = await getAllProgress();
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);

    const link = document.createElement("a");
    link.href = url;
    link.download = `english-cards-b1-progress-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setMessage(`Progreso exportado: ${entries.length} tarjetas.`);
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);

      if (!isCardProgressArray(parsed)) {
        setMessage("El archivo no tiene el formato esperado de progreso.");
        return;
      }

      const importedCount = await importProgress(parsed);
      setMessage(
        `Se importaron ${importedCount} de ${parsed.length} registros (se conservó el más reciente por tarjeta).`,
      );
    } catch {
      setMessage("No se pudo leer el archivo. Verifica que sea un JSON válido.");
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Ajustes</h1>

      <section className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-medium text-gray-900">
          Exportar / Importar progreso
        </h2>
        <p className="text-sm text-gray-600">
          El progreso se guarda automáticamente en este navegador. Si cambias
          de navegador o dispositivo, exporta un respaldo aquí y luego
          impórtalo del otro lado.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Exportar progreso
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Importar progreso
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {message && <p className="text-sm text-gray-600">{message}</p>}
      </section>
    </div>
  );
}
