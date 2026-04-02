import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook Web Speech API — lecture audio d'un texte.
 * Sélectionne automatiquement une voix française si disponible.
 */
export function useTextToSpeech(text) {
    const [status, setStatus] = useState('idle'); // idle | playing | paused
    const [progress, setProgress] = useState(0);  // index du chunk en cours
    const [total, setTotal] = useState(0);         // nombre total de chunks
    const chunksRef = useRef([]);
    const indexRef = useRef(0);
    const synthRef = useRef(window.speechSynthesis);

    // Découpe le texte en phrases pour un meilleur suivi de progression
    const buildChunks = useCallback((raw) => {
        return raw
            .split(/(?<=[.!?»])\s+/)
            .map(s => s.trim())
            .filter(Boolean);
    }, []);

    // Stop propre sur démontage ou changement d'article
    useEffect(() => {
        return () => {
            synthRef.current.cancel();
        };
    }, [text]);

    const getVoice = useCallback(() => {
        const voices = synthRef.current.getVoices();
        return (
            voices.find(v => v.lang === 'fr-FR') ||
            voices.find(v => v.lang.startsWith('fr')) ||
            null
        );
    }, []);

    const speakChunk = useCallback((chunks, index) => {
        if (index >= chunks.length) {
            setStatus('idle');
            setProgress(0);
            indexRef.current = 0;
            return;
        }
        const utt = new SpeechSynthesisUtterance(chunks[index]);
        const voice = getVoice();
        if (voice) utt.voice = voice;
        utt.lang = 'fr-FR';
        utt.rate = 0.95;

        utt.onstart = () => {
            indexRef.current = index;
            setProgress(index + 1);
        };
        utt.onend = () => {
            speakChunk(chunks, index + 1);
        };
        utt.onerror = () => {
            setStatus('idle');
        };
        synthRef.current.speak(utt);
    }, [getVoice]);

    const play = useCallback(() => {
        const synth = synthRef.current;

        if (status === 'paused') {
            synth.resume();
            setStatus('playing');
            return;
        }

        synth.cancel();
        const chunks = buildChunks(text);
        chunksRef.current = chunks;
        setTotal(chunks.length);
        setProgress(0);
        indexRef.current = 0;
        setStatus('playing');

        // Safari nécessite un léger délai après cancel()
        setTimeout(() => speakChunk(chunks, 0), 50);
    }, [status, text, buildChunks, speakChunk]);

    const pause = useCallback(() => {
        synthRef.current.pause();
        setStatus('paused');
    }, []);

    const stop = useCallback(() => {
        synthRef.current.cancel();
        setStatus('idle');
        setProgress(0);
        indexRef.current = 0;
    }, []);

    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    return { status, progress, total, play, pause, stop, supported };
}
