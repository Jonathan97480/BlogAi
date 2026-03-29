
import express from 'express';
import pool from '../models/db.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = express.Router();

// GET /api/pages/:id - infos d'une page (publique)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT id, titre, description FROM page WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Page non trouvée' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la page' });
    }
});

// GET /api/pages/:id/posts - articles liés à une page (publique)
router.get('/:id/posts', async (req, res) => {
    const { id } = req.params;
    try {
        // On suppose qu'il existe une table page_post (page_id, post_id)
        // et que les articles sont dans la table posts
        // On joint aussi media et categorie pour avoir image et catégorie
        const [rows] = await pool.query(`
                        SELECT p.*, m.url AS media_url, c.name AS category
                        FROM posts p
                        INNER JOIN page_post pp ON pp.post_id = p.id
                        LEFT JOIN media m ON p.media_id = m.id
                        LEFT JOIN categorie c ON p.category_id = c.id
                        LEFT JOIN archives a ON a.post_id = p.id
                        WHERE pp.page_id = ?
                            AND a.post_id IS NULL
                        ORDER BY p.id DESC
                `, [id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des articles liés à la page' });
    }
});


// PUT /api/pages/:id - éditer une page
router.put('/:id', verifyJWT, async (req, res) => {
    const { titre, description } = req.body;
    const { id } = req.params;
    if (!titre) return res.status(400).json({ message: 'Le titre est requis' });
    try {
        const [result] = await pool.query('UPDATE page SET titre = ?, description = ? WHERE id = ?', [titre, description, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Page non trouvée' });
        res.json({ id, titre, description });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la modification de la page' });
    }
});

// DELETE /api/pages/:id - supprimer une page
router.delete('/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM page WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Page non trouvée' });
        res.json({ message: 'Page supprimée' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la page' });
    }
});

// GET /api/pages - liste toutes les pages (publique)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, titre, description FROM page ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des pages' });
    }
});

// POST /api/pages - créer une page
router.post('/', verifyJWT, async (req, res) => {
    const { titre, description } = req.body;
    if (!titre) return res.status(400).json({ message: 'Le titre est requis' });
    try {
        const [result] = await pool.query('INSERT INTO page (titre, description) VALUES (?, ?)', [titre, description]);
        res.status(201).json({ id: result.insertId, titre, description });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la création de la page' });
    }
});

export default router;
