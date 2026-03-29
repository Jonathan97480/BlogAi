import pool from './db.js';

export async function getIaParams() {
    const [rows] = await pool.query('SELECT * FROM ApiIAText LIMIT 1');
    return rows[0] || null;
}

export async function setIaParams({ url_ia, key_ia, id_IA, pront_ia }) {
    // Si une ligne existe, update, sinon insert
    const existing = await getIaParams();
    if (existing) {
        await pool.query('UPDATE ApiIAText SET url_ia=?, key_ia=?, id_IA=?, pront_ia=? WHERE id=?', [url_ia, key_ia, id_IA, pront_ia, existing.id]);
    } else {
        await pool.query('INSERT INTO ApiIAText (url_ia, key_ia, id_IA, pront_ia) VALUES (?, ?, ?, ?)', [url_ia, key_ia, id_IA, pront_ia]);
    }
}
