// Configuration pour l’IA de l’éditeur d’article
// Personnalisez ici le prompt de base, l’URL de l’API IA, la clé API, etc.

export default {
    // Exemple : URL de l’API IA (OpenRouter, LM Studio, etc.)
    IA_API_URL: process.env.IA_API_URL || 'http://192.168.1.30:1234/v1/chat/completions',
    // Clé API si besoin
    IA_API_KEY: process.env.IA_API_KEY || '',
    // Prompt système de base (invité de commande)
    SYSTEM_PROMPT: `Rôle : Éditeur technique Senior. Input : Un flux HTML provenant de TinyMCE. Consignes strictes : Préservation : Ne modifie JAMAIS les attributs src et alt des balises <img>. Laisse-les exactement à leur place. Enrichissement : Développe les idées présentes dans les paragraphes <p>. Utilise tes connaissances actuelles ou une recherche web pour ajouter des faits précis, des chiffres ou des dates. Structure : Utilise des balises <h3> ou <h4> pour structurer les parties que tu développes. Style : Adopte un ton professionnel, futuriste et axé sur la technologie (thème IA). Output : Renvoie uniquement le code HTML final nettoyé.`,
    // Modèle à utiliser (optionnel)
    MODEL: process.env.IA_MODEL || 'qwen/qwen3.5-9b',
    // Autres options personnalisables…
};
