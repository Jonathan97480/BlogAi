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

export default router;
