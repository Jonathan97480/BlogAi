
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import verifyJWT from '../middleware/verifyJWT.js';
import pool from '../models/db.js';

const router = express.Router();

// Dossier de destination pour les images Quill
const uploadDir = path.join(process.cwd(), 'public', 'img', 'quill');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, name);
    }
});

const upload = multer({ storage });

// POST /api/upload/quill
router.post('/quill', verifyJWT, upload.single('image'), (req, res) => {
    console.log('[UPLOAD] Requête reçue /api/upload/quill');
    if (!req.file) {
        console.log('[UPLOAD] Aucun fichier reçu');
        return res.status(400).json({ message: 'Aucun fichier reçu.' });
    }
    console.log('[UPLOAD] Fichier reçu:', req.file.originalname, '->', req.file.filename);
    // URL accessible côté client
    const url = `/img/quill/${req.file.filename}`;
    console.log('[UPLOAD] URL retournée:', url);
    // Ajout dans la table media
    (async () => {
        try {
            await pool.query('INSERT INTO media (filename, url) VALUES (?, ?)', [req.file.filename, url]);
        } catch (err) {
            console.error('[UPLOAD] Erreur insertion media:', err.message);
        }
        res.json({ location: url });
    })();
});

export default router;
