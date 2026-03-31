import express from 'express';
import pool from '../models/db.js';
import verifyJWT from '../middleware/verifyJWT.js';
import crypto from 'crypto';
import { logError } from '../utils/logger.js';

const router = express.Router();

router.get('/', verifyJWT, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, api_key, permissions FROM apiKey LIMIT 1');
        if (rows.length === 0) return res.json(null);
        res.json(rows[0]);
    } catch (err) {
        logError('routes/apikey.js', '[GET /api/apikey] ' + (err.stack || err.message));
        res.status(500).json({ message: 'Erreur lors de la récupération de la clé API' });
    }
});

router.post('/', verifyJWT, async (req, res) => {
    try {
        await pool.query('DELETE FROM apiKey');
        const apiKey = 'sk-' + crypto.randomBytes(16).toString('hex');
        const permissions = '1000';
        await pool.query('INSERT INTO apiKey (api_key, permissions) VALUES (?, ?)', [apiKey, permissions]);
        console.log('[APIKEY] generated new key');
        res.status(201).json({ api_key: apiKey, permissions });
    } catch (err) {
        logError('routes/apikey.js', '[POST /api/apikey] ' + (err.stack || err.message));
        res.status(500).json({ message: 'Erreur lors de la génération de la clé API' });
    }
});

router.put('/:id', verifyJWT, async (req, res) => {
    const { permissions } = req.body;
    if (!permissions || typeof permissions !== 'string') {
        return res.status(400).json({ message: 'Permissions invalides' });
    }
    try {
        const [result] = await pool.query('UPDATE apiKey SET permissions = ? WHERE id = ?', [permissions, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Clé API non trouvée' });
        console.log('[APIKEY] permissions updated', req.params.id, permissions);
        res.json({ id: req.params.id, permissions });
    } catch (err) {
        logError('routes/apikey.js', '[PUT /api/apikey/:id] ' + (err.stack || err.message));
        res.status(500).json({ message: 'Erreur lors de la mise à jour des permissions' });
    }
});

export default router;
