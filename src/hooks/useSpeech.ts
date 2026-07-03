import { useCallback } from "react";

export function useSpeech(lang = "en-US") {
  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    },
    [lang],
  );

  return { speak };
}
