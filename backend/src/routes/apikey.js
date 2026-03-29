import express from 'express';
import pool from '../models/db.js';
import verifyJWT from '../middleware/verifyJWT.js';
import crypto from 'crypto';

const router = express.Router();

// GET /api/apikey - Récupérer la clé API et permissions de l'admin connecté (1 seule clé par admin pour ce MVP)
router.get('/', verifyJWT, async (req, res) => {
    try {
        // Pour MVP, on prend la première clé trouvée
        const [rows] = await pool.query('SELECT id, api_key, permissions FROM apiKey LIMIT 1');
        if (rows.length === 0) return res.json(null);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la clé API' });
    }
});

// POST /api/apikey - Générer une nouvelle clé API (remplace l’ancienne)
router.post('/', verifyJWT, async (req, res) => {
    try {
        // Supprimer l’ancienne clé (MVP : une seule clé)
        await pool.query('DELETE FROM apiKey');
        const apiKey = 'sk-' + crypto.randomBytes(16).toString('hex');
        const permissions = '1000'; // Par défaut : lecture seule
        await pool.query('INSERT INTO apiKey (api_key, permissions) VALUES (?, ?)', [apiKey, permissions]);
        res.status(201).json({ api_key: apiKey, permissions });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la génération de la clé API' });
    }
});

// PUT /api/apikey/:id - Modifier les permissions de la clé
router.put('/:id', verifyJWT, async (req, res) => {
    const { permissions } = req.body;
    if (!permissions || typeof permissions !== 'string') {
        return res.status(400).json({ message: 'Permissions invalides' });
    }
    try {
        const [result] = await pool.query('UPDATE apiKey SET permissions = ? WHERE id = ?', [permissions, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Clé API non trouvée' });
        res.json({ id: req.params.id, permissions });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour des permissions' });
    }
});

export default router;
