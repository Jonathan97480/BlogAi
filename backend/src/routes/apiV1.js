import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../models/db.js';
import { logError } from '../utils/logger.js';
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

router.use(async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ message: 'Clé API requise' });
    const perms = await getApiKeyPermissions(apiKey);
    if (!perms) return res.status(403).json({ message: 'Clé API invalide' });
    req.apiPerms = perms;
    next();
});

const uploadDir = path.resolve('public', 'img', 'api');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('[API V1 UPLOAD] destination=', uploadDir);
            cb(null, uploadDir);
        } catch (err) {
            logError('routes/apiV1.js', '[uploadImage] destination error: ' + (err.stack || err.message));
            cb(err, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '');
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        console.log('[API V1 UPLOAD] generated filename=', name);
        cb(null, name);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/getarticlebyName', getArticleByName);
router.get('/getarticlebyID/:id', getArticleByID);
router.post('/setArticle', setArticle);
router.put('/editArticle/:id', editArticle);
router.post('/IaOptimiseText', iaOptimiseText);
router.post('/setAdminUser', setAdminUser);
router.get('/getAdminUser/:id', getAdminUser);

router.post('/uploadImage', upload.single('image'), async (req, res) => {
    if (!req.apiPerms.write) {
        return res.status(403).json({ message: 'Permission écriture requise' });
    }

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier reçu' });
        }

        const url = `/img/api/${req.file.filename}`;
        const [result] = await pool.query('INSERT INTO media (filename, url) VALUES (?, ?)', [req.file.filename, url]);
        console.log('[API V1 UPLOAD] stored image', JSON.stringify({ filename: req.file.filename, url, media_id: result.insertId }));
        res.status(201).json({
            success: true,
            media_id: result.insertId,
            filename: req.file.filename,
            url
        });
    } catch (err) {
        logError('routes/apiV1.js', '[POST /api/v1/uploadImage] ' + (err.stack || err.message));
        res.status(500).json({ message: 'Erreur lors de l\'upload image', error: err.message });
    }
});

export default router;
