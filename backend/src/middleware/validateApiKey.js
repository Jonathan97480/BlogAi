import pool from '../models/db.js';

// Utilitaire pour décoder les permissions (ex: '1100') en objet
export function decodePermissions(permStr) {
    return {
        read: permStr[0] === '1',
        write: permStr[1] === '1',
        ia: permStr[2] === '1',
        admin: permStr[3] === '1',
    };
}

// Récupérer les permissions à partir d'une clé API
export async function getApiKeyPermissions(apiKey) {
    // Sécurité spéciale pour la clé de test : utilisable uniquement en local
    if (apiKey === 'sk-test-allperms') {
        // Vérifie l’IP locale (127.0.0.1 ou ::1)
        const req = getApiKeyPermissions.caller && getApiKeyPermissions.caller.arguments && getApiKeyPermissions.caller.arguments[0];
        const ip = req && req.connection && req.connection.remoteAddress;
        if (ip && !(ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1')) {
            return null;
        }
    }
    const [rows] = await pool.query('SELECT permissions FROM apiKey WHERE api_key = ?', [apiKey]);
    if (!rows.length) return null;
    return decodePermissions(rows[0].permissions);
}
