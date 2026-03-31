
import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../models/db.js';
import {
    getAllIdeas,
    getIdeaById,
    createIdea,
    updateIdea,
    deleteIdea,
    markIdeaProcessed
} from '../models/ideaModel.js';

const router = express.Router();

// Multer config pour upload image d'idée
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('public/img'));
    },
    filename: function (req, file, cb) {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const ext = path.extname(file.originalname);
        cb(null, `${dateStr}-idea${ext}`);
    }
});
const upload = multer({ storage });

// GET toutes les idées
router.get('/', async (req, res) => {
    const ideas = await getAllIdeas();
    res.json(ideas);
});

// GET une idée par id
router.get('/:id', async (req, res) => {
    const idea = await getIdeaById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idée non trouvée' });
    res.json(idea);
});

// POST créer une idée (support FormData + image)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        let image_url = null;
        let image_filename = null;
        let media_id = null;
        if (req.file) {
            image_filename = req.file.filename;
            image_url = `/img/${image_filename}`;
            // Insère dans media
            const [mediaRes] = await pool.query(
                'INSERT INTO media (filename, url) VALUES (?, ?)',
                [image_filename, image_url]
            );
            media_id = mediaRes.insertId;
        } else if (req.body.media_id) {
            media_id = req.body.media_id;
        }
        const { title, category_id, excerpt, content } = req.body;
        if (!title || !category_id || !content) return res.status(400).json({ message: 'Champs obligatoires manquants' });
        const result = await createIdea({ title, category_id, excerpt, content, media_id });
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la création de l\'idée', error: err.message });
    }
});

// PUT éditer une idée (support FormData + image)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        let image_url = null;
        let image_filename = null;
        let media_id = null;
        if (req.file) {
            image_filename = req.file.filename;
            image_url = `/img/${image_filename}`;
            // Insère dans media
            const [mediaRes] = await pool.query(
                'INSERT INTO media (filename, url) VALUES (?, ?)',
                [image_filename, image_url]
            );
            media_id = mediaRes.insertId;
        } else if (req.body.media_id) {
            media_id = req.body.media_id;
        }
        const { title, category_id, excerpt, content } = req.body;
        await updateIdea(req.params.id, { title, category_id, excerpt, content, media_id });
        res.json({ message: 'Idée mise à jour' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la modification de l\'idée', error: err.message });
    }
});

// DELETE supprimer une idée
router.delete('/:id', async (req, res) => {
    await deleteIdea(req.params.id);
    res.json({ message: 'Idée supprimée' });
});

// PATCH marquer une idée comme traitée
router.patch('/:id/processed', async (req, res) => {
    await markIdeaProcessed(req.params.id);
    res.json({ message: 'Idée marquée comme traitée' });
});

export default router;
