import express from 'express';

import { getApiKeyPermissions } from '../middleware/validateApiKey.js';
import {
    getArticleByName,
    getArticleByID,
    setArticle,
    editArticle,
    iaOptimiseText,
    setAdminUser,
    getAdminUser
} from '../controllers/apiV1Controller.js';

const router = express.Router();

// Middleware pour vérifier la clé API et charger les permissions
router.use(async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ message: 'Clé API requise' });
    const perms = await getApiKeyPermissions(apiKey);
    if (!perms) return res.status(403).json({ message: 'Clé API invalide' });
    req.apiPerms = perms;
    next();
});

// GET /api/v1/getarticlebyName?name=xxx
router.get('/getarticlebyName', getArticleByName);

// GET /api/v1/getarticlebyID/:id
router.get('/getarticlebyID/:id', getArticleByID);

// POST /api/v1/setArticle
router.post('/setArticle', setArticle);

// PUT /api/v1/editArticle/:id
router.put('/editArticle/:id', editArticle);

// POST /api/v1/IaOptimiseText
router.post('/IaOptimiseText', iaOptimiseText);

// POST /api/v1/setAdminUser
router.post('/setAdminUser', setAdminUser);

// GET /api/v1/getAdminUser/:id
router.get('/getAdminUser/:id', getAdminUser);

export default router;
