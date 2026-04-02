import pool from './db.js';

export async function getSetting(key) {
    const [rows] = await pool.query('SELECT `value` FROM settings WHERE `key` = ?', [key]);
    return rows[0]?.value ?? null;
}

export async function setSetting(key, value) {
    await pool.query(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, String(value), String(value)]
    );
}
