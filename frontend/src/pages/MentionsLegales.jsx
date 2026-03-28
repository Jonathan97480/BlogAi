import React from 'react';

function MentionsLegales() {
    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Mentions légales</h1>
            <p className="mb-2">Ce site est un blog personnel développé par <span className="font-semibold">jon-dev</span>.</p>
            <p className="mb-2">Aucune donnée personnelle n'est collectée ni stockée. Ce site n'utilise pas de cookies.</p>
            <p className="mb-2">Pour toute question, contactez : <span className="underline">jon-dev@example.com</span></p>
            <p className="text-gray-500 mt-6 text-sm">Dernière mise à jour : 28/03/2026</p>
        </div>
    );
}

export default MentionsLegales;
