import express from 'express';
import pool from '../models/db.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = express.Router();

// Récupérer toutes les catégories
router.get('/', verifyJWT, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, slug, name FROM categorie ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
    }
});

// Créer une nouvelle catégorie
router.post('/', verifyJWT, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Le nom est requis' });
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    try {
        const [result] = await pool.query('INSERT INTO categorie (slug, name) VALUES (?, ?)', [slug, name]);
        res.status(201).json({ id: result.insertId, slug, name });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la création de la catégorie' });
    }
});


// Modifier une catégorie
router.put('/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Le nom est requis' });
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    try {
        const [result] = await pool.query('UPDATE categorie SET name = ?, slug = ? WHERE id = ?', [name, slug, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Catégorie non trouvée' });
        res.json({ id, slug, name });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la modification de la catégorie' });
    }
});

// Supprimer une catégorie
router.delete('/:id', verifyJWT, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM categorie WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Catégorie non trouvée' });
        res.json({ message: 'Catégorie supprimée' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie' });
    }
});

export default router;
