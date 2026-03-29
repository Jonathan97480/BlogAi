import config from '../IaEditorConfig.js';
import { getIaParams } from '../models/apiIATextModel.js';

// Fonction utilitaire pour construire le prompt système
export async function getSystemPrompt() {
    const dbParams = await getIaParams();
    // Si pas de données en base, on prend tout du fichier
    if (!dbParams) {
        return config.SYSTEM_PROMPT;
    }
    // Si pront_ia (prompt utilisateur) existe, on concatène
    const userPrompt = dbParams.pront_ia?.trim();
    if (userPrompt) {
        // SYSTEM_PROMPT (fichier) + " " + pront_ia (base)
        return config.SYSTEM_PROMPT + ' ' + userPrompt;
    }
    // Sinon, juste le prompt système du fichier
    return config.SYSTEM_PROMPT;
}

// Pour exposer tous les paramètres IA (fusion fichier + base)
export async function getIaConfig() {
    const dbParams = await getIaParams();
    return {
        url_ia: dbParams?.url_ia || config.IA_API_URL,
        key_ia: dbParams?.key_ia || config.IA_API_KEY,
        id_IA: dbParams?.id_IA || config.MODEL,
        system_prompt: await getSystemPrompt()
    };
}
