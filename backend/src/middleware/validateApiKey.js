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

    const [rows] = await pool.query('SELECT permissions FROM apiKey WHERE api_key = ?', [apiKey]);
    if (!rows.length) return null;
    return decodePermissions(rows[0].permissions);
}
