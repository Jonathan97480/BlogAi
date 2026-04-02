import express from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import { getSetting, setSetting } from '../models/settingsModel.js';
import { logError } from '../utils/logger.js';

const router = express.Router();

// GET /api/settings/:key  — lecture publique (pas besoin d'auth pour page_size)
router.get('/:key', async (req, res) => {
    try {
        const value = await getSetting(req.params.key);
        if (value === null) return res.status(404).json({ message: 'Clé introuvable' });
        res.json({ key: req.params.key, value });
    } catch (err) {
        logError('settings.js', err.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT /api/settings/:key  — écriture protégée par JWT admin
router.put('/:key', verifyJWT, async (req, res) => {
    const { value } = req.body;
    if (value === undefined || value === null) {
        return res.status(400).json({ message: 'Champ value manquant' });
    }
    try {
        await setSetting(req.params.key, value);
        res.json({ key: req.params.key, value: String(value) });
    } catch (err) {
        logError('settings.js', err.message);
        res.status(500).json({ message: 'Erreur lors de la sauvegarde' });
    }
});

export default router;
