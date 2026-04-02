import React, { useState } from 'react';
import { FaVolumeHigh, FaPause, FaStop } from 'react-icons/fa6';
import { useTextToSpeech } from '../hooks/useTextToSpeech.js';

/**
 * Barre de lecture audio d'un article via Web Speech API.
 * Props :
 *   - title  : titre de l'article (lu en premier)
 *   - content : HTML brut du contenu (balises supprimées avant lecture)
 */
export default function AudioReader({ title, content }) {
    // Supprime les balises img, figure, figcaption et leurs contenus entiers
    // puis retire toutes les autres balises HTML
    const cleaned = (content || '')
        .replace(/<img[^>]*>/gi, ' ')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, ' ')
        .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, ' ')
        .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Décode les entités HTML (&nbsp; &eacute; &agrave; &rsquo; etc.)
    const decoded = (() => {
        const txt = document.createElement('textarea');
        txt.innerHTML = cleaned;
        return txt.value;
    })();

    const rawText = [title || '', decoded].join('. ');

    const { status, progress, total, play, pause, stop, supported } = useTextToSpeech(rawText);

    const isDev = import.meta.env.VITE_APP_ENV === 'development';
    const [showDebug, setShowDebug] = useState(false);

    if (!supported) return null;

    const isPlaying = status === 'playing';
    const isPaused = status === 'paused';
    const isActive = isPlaying || isPaused;

    return (
        <div>
            <div className="flex items-center gap-3 flex-wrap">
                {/* Bouton principal : lecture / pause */}
                <button
                    onClick={isPlaying ? pause : play}
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        }`}
                    title={isPlaying ? 'Mettre en pause' : isPaused ? 'Reprendre la lecture' : 'Écouter cet article'}
                >
                    {isPlaying ? (
                        <>
                            <FaPause size={13} />
                            <span>Pause</span>
                        </>
                    ) : (
                        <>
                            <FaVolumeHigh size={14} className={isPaused ? 'text-yellow-300' : ''} />
                            <span>{isPaused ? 'Reprendre' : 'Écouter l\'article'}</span>
                        </>
                    )}
                </button>

                {/* Bouton stop — visible seulement pendant la lecture */}
                {isActive && (
                    <button
                        onClick={stop}
                        type="button"
                        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-gray-700 hover:bg-red-700 text-gray-400 hover:text-white transition-colors"
                        title="Arrêter la lecture"
                    >
                        <FaStop size={12} />
                        <span>Arrêter</span>
                    </button>
                )}

                {/* Progression */}
                {isActive && total > 0 && (
                    <span className="text-xs text-gray-400">
                        {progress} / {total} phrases
                    </span>
                )}
            </div>

            {/* Panneau debug TTS — dev uniquement */}
            {isDev && (
                <div className="mt-3">
                    <button
                        type="button"
                        onClick={() => setShowDebug(v => !v)}
                        className="text-xs text-yellow-400 underline hover:text-yellow-300"
                    >
                        {showDebug ? 'Masquer' : 'Voir'} le texte envoyé au lecteur (dev)
                    </button>
                    {showDebug && (
                        <pre className="mt-2 p-3 bg-gray-900 border border-yellow-700 rounded text-xs text-yellow-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {rawText}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}
