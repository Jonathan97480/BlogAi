import express from 'express';
import fetch from 'node-fetch';
import config from '../IaEditorConfig.js';
import { getIaConfig } from '../controllers/apiIATextController.js';
import { logError } from '../utils/logger.js';

const router = express.Router();

// POST /api/ia/enrich
// Body: { content: "texte à enrichir" }
router.post('/enrich', async (req, res) => {
    const { content, customPrompt } = req.body;
    if (!content) {
        logError('iaEnrich.js', '[IA ENRICH] Requête sans contenu');
        return res.status(400).json({ message: 'Contenu requis' });
    }
    // Récupère la config fusionnée (fichier + base)
    const iaConfig = await getIaConfig();
    // Prompt système : priorité customPrompt, sinon fusion fichier/base
    const systemPrompt = customPrompt || iaConfig.system_prompt;
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
    ];
    console.log('[IA ENRICH] Appel IA avec:', {
        url: iaConfig.url_ia,
        model: iaConfig.id_IA,
        prompt: systemPrompt,
        content: content.slice(0, 200) + (content.length > 200 ? '...' : '')
    });
    try {
        const response = await fetch(iaConfig.url_ia, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(iaConfig.key_ia && { 'Authorization': `Bearer ${iaConfig.key_ia}` })
            },
            body: JSON.stringify({
                model: iaConfig.id_IA,
                messages
            })
        });
        const raw = await response.clone().text();
        console.log('[IA ENRICH] Réponse brute IA:', raw.slice(0, 500) + (raw.length > 500 ? '...' : ''));
        if (!response.ok) {
            logError('iaEnrich.js', `[IA ENRICH] Erreur IA: ${raw}`);
            logError('iaEnrich.js', `[IA ENRICH] Réponse brute IA: ${raw}`);
            return res.status(500).json({ message: 'Erreur IA', error: raw });
        }
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            logError('iaEnrich.js', `[IA ENRICH] Erreur parsing JSON: ${e.message} | Réponse: ${raw}`);
            return res.status(500).json({ message: 'Réponse IA non valide', error: e.message });
        }
        if (data.error) {
            logError('iaEnrich.js', `[IA ENRICH] Erreur dans la réponse IA: ${JSON.stringify(data)}`);
            return res.status(500).json({ message: 'Erreur IA', error: data.error });
        }
        const enriched = data.choices?.[0]?.message?.content || '';
        console.log('[IA ENRICH] Texte enrichi:', enriched.slice(0, 200) + (enriched.length > 200 ? '...' : ''));
        res.json({ enriched });
    } catch (err) {
        logError('iaEnrich.js', `[IA ENRICH] Erreur appel IA: ${err.message}`);
        res.status(500).json({ message: 'Erreur appel IA', error: err.message });
    }
});

export default router;
