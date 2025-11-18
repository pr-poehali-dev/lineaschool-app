import { useCallback, useEffect, useRef } from 'react';

export const useSpeech = () => {
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const setRussianVoice = () => {
        const voices = synthRef.current?.getVoices() || [];
        const russianVoices = voices.filter((voice) =>
          voice.lang.startsWith('ru')
        );
        
        const preferredVoice = russianVoices.find(
          (voice) => voice.name.includes('Google') || voice.name.includes('Yandex')
        ) || russianVoices.find(
          (voice) => voice.name.includes('Milena') || voice.name.includes('Irina')
        ) || russianVoices[0];
        
        voiceRef.current = preferredVoice || voices[0] || null;
      };

      setRussianVoice();
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = setRussianVoice;
      }
    }
  }, []);

  const speak = useCallback((text: string, rate: number = 0.85) => {
    if (!synthRef.current) {
      console.warn('Speech synthesis not supported');
      return;
    }

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    synthRef.current.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    synthRef.current?.cancel();
  }, []);

  return { speak, cancel };
};