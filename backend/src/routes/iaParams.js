import express from 'express';
import { getIaConfig } from '../controllers/apiIATextController.js';
import { setIaParams } from '../models/apiIATextModel.js';

const router = express.Router();

// GET /api/ia/params - retourne la config IA fusionnée
router.get('/params', async (req, res) => {
    try {
        const config = await getIaConfig();
        res.json(config);
    } catch (err) {
        res.status(500).json({ message: 'Erreur récupération paramètres IA', error: err.message });
    }
});

// POST /api/ia/params - met à jour la config IA (base)
router.post('/params', async (req, res) => {
    const { url_ia, key_ia, id_IA, pront_ia } = req.body;
    if (!url_ia || !key_ia || !id_IA) {
        return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    try {
        await setIaParams({ url_ia, key_ia, id_IA, pront_ia });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Erreur sauvegarde paramètres IA', error: err.message });
    }
});

export default router;
