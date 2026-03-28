import React, { useState, useEffect } from 'react';

function RgpdPopup() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Affiche la popup seulement si l'utilisateur ne l'a pas déjà fermée dans cette session
        if (!sessionStorage.getItem('rgpd_popup_closed')) {
            setVisible(true);
        }
    }, []);

    const handleClose = () => {
        setVisible(false);
        sessionStorage.setItem('rgpd_popup_closed', '1');
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
                <h2 className="text-lg font-bold mb-2">Respect de votre vie privée</h2>
                <p className="mb-4 text-gray-700">
                    Ce site n'utilise pas de cookies et aucune information personnelle n'est sauvegardée lors de votre visite.
                </p>
                <button
                    onClick={handleClose}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors font-semibold"
                >
                    OK
                </button>
            </div>
        </div>
    );
}

export default RgpdPopup;
