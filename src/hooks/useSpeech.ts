import { useCallback } from "react";

let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

// Chrome/Edge devuelven la lista de voces vacía hasta que dispara
// "voiceschanged" de forma asíncrona. Si se llama a speak() antes de eso,
// el navegador usa una voz de sistema por defecto (a veces una masculina
// distinta a la que realmente queremos), lo que sonaba como una voz de
// fondo ocasional. Esperar aquí a que la lista esté poblada evita eso.
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!("speechSynthesis" in window)) return Promise.resolve([]);
  if (voicesReady) return voicesReady;

  voicesReady = new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    // Si "voiceschanged" nunca llega a disparar (p. ej. sin voces TTS
    // instaladas), no debe quedar esperando para siempre: se resuelve
    // con lo que haya tras un breve margen.
    const timeoutId = setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 300);
    const handleVoicesChanged = () => {
      clearTimeout(timeoutId);
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        handleVoicesChanged,
      );
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      handleVoicesChanged,
    );
  });

  return voicesReady;
}

export function useSpeech(lang = "en-US") {
  const speak = useCallback(
    async (text: string) => {
      if (!("speechSynthesis" in window)) return;

      const voices = await loadVoices();
      const voice =
        voices.find((v) => v.lang === lang) ??
        voices.find((v) => v.lang.startsWith(lang.split("-")[0]));

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    },
    [lang],
  );

  const cancel = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
  }, []);

  return { speak, cancel };
}
