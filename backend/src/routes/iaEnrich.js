import express from 'express';
import fetch from 'node-fetch';
import config from '../IaEditorConfig.js';
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

    // Prépare le prompt à envoyer à l’IA
    const systemPrompt = customPrompt || config.SYSTEM_PROMPT;
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content }
    ];

    console.log('[IA ENRICH] Appel IA avec:', {
        url: config.IA_API_URL,
        model: config.MODEL,
        prompt: systemPrompt,
        content: content.slice(0, 200) + (content.length > 200 ? '...' : '')
    });

    try {
        const response = await fetch(config.IA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(config.IA_API_KEY && { 'Authorization': `Bearer ${config.IA_API_KEY}` })
            },
            body: JSON.stringify({
                model: config.MODEL,
                messages
            })
        });
        const raw = await response.clone().text();
        console.log('[IA ENRICH] Réponse brute IA:', raw.slice(0, 500) + (raw.length > 500 ? '...' : ''));
        if (!response.ok) {
            console.log('[DEBUG] Appel logError: erreur IA');
            console.log('[DEBUG] logError content:', `[IA ENRICH] Erreur IA: ${raw}`);
            logError('iaEnrich.js', `[IA ENRICH] Erreur IA: ${raw}`);
            console.log('[DEBUG] logError content:', `[IA ENRICH] Réponse brute IA: ${raw}`);
            logError('iaEnrich.js', `[IA ENRICH] Réponse brute IA: ${raw}`);
            return res.status(500).json({ message: 'Erreur IA', error: raw });
        }
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.log('[DEBUG] Appel logError: erreur parsing JSON');
            console.log('[DEBUG] logError content:', `[IA ENRICH] Erreur parsing JSON: ${e.message} | Réponse: ${raw}`);
            logError('iaEnrich.js', `[IA ENRICH] Erreur parsing JSON: ${e.message} | Réponse: ${raw}`);
            return res.status(500).json({ message: 'Réponse IA non valide', error: e.message });
        }
        // Vérifie si la réponse IA contient une erreur même si HTTP 200
        if (data.error) {
            console.log('[DEBUG] logError content:', `[IA ENRICH] Erreur dans la réponse IA: ${JSON.stringify(data)}`);
            logError('iaEnrich.js', `[IA ENRICH] Erreur dans la réponse IA: ${JSON.stringify(data)}`);
            return res.status(500).json({ message: 'Erreur IA', error: data.error });
        }
        const enriched = data.choices?.[0]?.message?.content || '';
        console.log('[IA ENRICH] Texte enrichi:', enriched.slice(0, 200) + (enriched.length > 200 ? '...' : ''));
        res.json({ enriched });
    } catch (err) {
        console.log('[DEBUG] Appel logError: erreur appel IA');
        console.log('[DEBUG] logError content:', `[IA ENRICH] Erreur appel IA: ${err.message}`);
        logError('iaEnrich.js', `[IA ENRICH] Erreur appel IA: ${err.message}`);
        res.status(500).json({ message: 'Erreur appel IA', error: err.message });
    }
});

export default router;
