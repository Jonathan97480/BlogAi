// ...existing code...
import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { updatePost, getPostsByCategory, getAllPosts, getAllPostsAdmin, getPostById, createPost, archivePost, getArchivedPosts, unarchivePost, deletePostAndArchiveController } from '../controllers/postsController.js';
import verifyJWT from '../middleware/verifyJWT.js';
import pool from '../models/db.js';

const router = express.Router();

// Endpoint pour permettre à une IA (ou service externe) de poster un article via clé API
router.post('/ia/posts', async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.IA_API_KEY) {
        return res.status(401).json({ message: 'Clé API manquante ou invalide' });
    }
    const { title, excerpt, content, category_id, media_id } = req.body;
    if (!title || !content || !category_id) {
        return res.status(400).json({ message: 'Champs obligatoires manquants (title, content, category_id)' });
    }
    try {
        // Création de l'article (sans gestion d'image uploadée ici)
        const [result] = await req.app.get('db').query(
            'INSERT INTO posts (title, excerpt, content, category_id, media_id, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [title, excerpt || '', content, category_id, media_id || null]
        );
        res.status(201).json({ id: result.insertId, title, excerpt, content, category_id, media_id });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la création de l\'article', error: err.message });
    }
});

// Route pour récupérer tous les articles d'une catégorie (publique)
router.get('/category/:category', getPostsByCategory);

// Route de recherche d'articles non archivés
router.get('/search', async (req, res) => {
    const q = req.query.q || '';
    if (!q.trim()) return res.json([]);
    try {
        // On suppose que les articles archivés sont dans la table archives (clé post_id)
        // et que les articles non archivés sont ceux qui ne sont pas dans archives
        const [rows] = await pool.query(`
            SELECT p.*, m.url AS media_url, c.name AS category
            FROM posts p
            LEFT JOIN media m ON p.media_id = m.id
            LEFT JOIN categorie c ON p.category_id = c.id
            LEFT JOIN archives a ON a.post_id = p.id
            WHERE a.post_id IS NULL
              AND (p.title LIKE ? OR p.content LIKE ?)
            ORDER BY p.created_at DESC
        `, [`%${q}%`, `%${q}%`]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la recherche' });
    }
});


// Config multer pour upload image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('public/img'));
    },
    filename: function (req, file, cb) {
        // Récupère l'id admin depuis le token JWT (middleware verifyJWT doit être appliqué avant upload)
        let adminId = null;
        if (req.user && req.user.id) {
            adminId = req.user.id;
        }
        // Format : YYYYMMDD-HHMMSS-admin<ID>.<ext>
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const ext = path.extname(file.originalname);
        const adminPart = adminId ? `-admin${adminId}` : '';
        cb(null, `${dateStr}${adminPart}${ext}`);
    }
});


const upload = multer({ storage });
// Route pour modifier un article (et gérer la liaison page)
router.put('/:id', verifyJWT, upload.single('image'), updatePost);


// --- ROUTES IMAGES ---
// Route pour lister toutes les images depuis la table media
router.get('/images', (req, res, next) => {
    // Log du header Authorization
    console.log('[DEBUG] /api/posts/images Authorization:', req.headers['authorization']);
    next();
}, verifyJWT, async (req, res) => {
    try {
        // On récupère toutes les images et on ajoute un flag isLinked si l'image est utilisée dans posts ou archives
        const [rows] = await pool.query('SELECT id, filename, url FROM media ORDER BY id DESC');
        // Pour chaque image, vérifier si elle est liée à un post (actif ou archivé)
        const images = await Promise.all(rows.map(async img => {
            // Vérifie si l'image est liée à un post (posts ou archives)
            const [[{ count: postCount }]] = await pool.query('SELECT COUNT(*) as count FROM posts WHERE media_id = ?', [img.id]);
            const [[{ count: archiveCount }]] = await pool.query('SELECT COUNT(*) as count FROM posts INNER JOIN archives ON posts.id = archives.post_id WHERE posts.media_id = ?', [img.id]);
            return {
                ...img,
                url: img.url,
                isLinked: (postCount > 0 || archiveCount > 0)
            };
        }));
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lecture images' });
    }
});

// Route pour supprimer une image
router.delete('/images/:filename', verifyJWT, async (req, res) => {
    const filename = req.params.filename;
    const imgDir = path.resolve('public/img');
    const filePath = path.join(imgDir, filename);
    try {
        await fs.promises.unlink(filePath).catch(err => {
            if (err.code !== 'ENOENT') throw err;
        });
        await pool.query('DELETE FROM media WHERE filename = ?', [filename]);
        res.sendStatus(204);
    } catch (err) {
        console.error('[DELETE /api/posts/images]', err.message);
        res.status(500).json({ message: 'Erreur suppression image' });
    }
});

// Route pour créer un article (avec upload image)
router.post('/', verifyJWT, upload.single('image'), createPost);

// Route pour suppression définitive d'un article archivé
router.delete('/archives/:postId/permanent', verifyJWT, deletePostAndArchiveController);


// Route pour récupérer les articles archivés
router.get('/archives', verifyJWT, getArchivedPosts);

// Route pour désarchiver un article (supprime la ligne d'archive)
router.delete('/archives/:archiveId', verifyJWT, unarchivePost);

// Route admin : tous les articles (brouillons inclus), protégée
router.get('/admin/all', verifyJWT, getAllPostsAdmin);

// Route pour récupérer tous les articles (publique)
router.get('/', getAllPosts);

// Route pour récupérer un article par son id (publique)
router.get('/:id', getPostById);

// Route pour archiver un article
router.post('/:id/archive', verifyJWT, archivePost);

export default router;
