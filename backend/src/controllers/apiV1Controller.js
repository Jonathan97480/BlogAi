import pool from '../models/db.js';

export async function getArticleByName(req, res) {
    if (!req.apiPerms.read) return res.status(403).json({ message: 'Permission lecture requise' });
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: 'Nom requis' });
    const [rows] = await pool.query('SELECT * FROM posts WHERE title = ?', [name]);
    res.json(rows);
}

export async function getArticleByID(req, res) {
    if (!req.apiPerms.read) return res.status(403).json({ message: 'Permission lecture requise' });
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    res.json(rows[0] || null);
}

export async function setArticle(req, res) {
    if (!req.apiPerms.write) return res.status(403).json({ message: 'Permission écriture requise' });
    const { title, content, category } = req.body;
    if (!title || !content || !category) return res.status(400).json({ message: 'Champs manquants' });
    const [result] = await pool.query('INSERT INTO posts (title, content, category) VALUES (?, ?, ?)', [title, content, category]);
    res.status(201).json({ id: result.insertId });
}

export async function editArticle(req, res) {
    if (!req.apiPerms.write) return res.status(403).json({ message: 'Permission écriture requise' });
    const { id } = req.params;
    const { title, content, category } = req.body;
    const [result] = await pool.query('UPDATE posts SET title=?, content=?, category=? WHERE id=?', [title, content, category, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Article non trouvé' });
    res.json({ id });
}

export async function iaOptimiseText(req, res) {
    if (!req.apiPerms.ia) return res.status(403).json({ message: 'Permission IA requise' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Texte requis' });
    res.json({ optimised: text + ' [optimisé]' });
}

export async function setAdminUser(req, res) {
    if (!req.apiPerms.admin) return res.status(403).json({ message: 'Permission admin requise' });
    const { username, password_hash } = req.body;
    if (!username || !password_hash) return res.status(400).json({ message: 'Champs manquants' });
    const [result] = await pool.query('INSERT INTO admin (username, password_hash) VALUES (?, ?)', [username, password_hash]);
    res.status(201).json({ id: result.insertId });
}

export async function getAdminUser(req, res) {
    if (!req.apiPerms.admin) return res.status(403).json({ message: 'Permission admin requise' });
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, username FROM admin WHERE id = ?', [id]);
    res.json(rows[0] || null);
}
