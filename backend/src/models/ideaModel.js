import pool from './db.js';

export async function getAllIdeas() {
    const [rows] = await pool.query('SELECT * FROM idea');
    return rows;
}

export async function getIdeaById(id) {
    const [rows] = await pool.query('SELECT * FROM idea WHERE id = ?', [id]);
    return rows[0];
}

export async function createIdea({ title, category, excerpt, content, media_id }) {
    const [result] = await pool.query(
        'INSERT INTO idea (title, category, excerpt, content, media_id) VALUES (?, ?, ?, ?, ?)',
        [title, category, excerpt, content, media_id]
    );
    return { id: result.insertId };
}

export async function updateIdea(id, { title, category, excerpt, content, media_id }) {
    await pool.query(
        'UPDATE idea SET title = ?, category = ?, excerpt = ?, content = ?, media_id = ? WHERE id = ?',
        [title, category, excerpt, content, media_id, id]
    );
}

export async function deleteIdea(id) {
    await pool.query('DELETE FROM idea WHERE id = ?', [id]);
}

export async function markIdeaProcessed(id) {
    await pool.query('UPDATE idea SET is_processed = TRUE WHERE id = ?', [id]);
}
