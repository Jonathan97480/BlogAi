// Mise à jour d'un article (et de la liaison page_post)
export async function updatePost(req, res) {
    try {
        let image_url = null;
        let image_filename = null;
        let media_id = null;
        if (req.file) {
            image_filename = req.file.filename;
            image_url = `/img/${image_filename}`;
            const [mediaRes] = await pool.query(
                'INSERT INTO media (filename, url) VALUES (?, ?)',
                [image_filename, image_url]
            );
            media_id = mediaRes.insertId;
        }
        const { title, category_id, content, page_id, status } = req.body;
        const { id } = req.params;
        if (!title || !category_id || !content) {
            return res.status(400).json({ message: 'Champs obligatoires manquants.' });
        }
        let updateSql = 'UPDATE posts SET title = ?, category_id = ?, content = ?, status = ?';
        const params = [title, category_id, content, status || 'brouillon'];
        if (media_id) {
            updateSql += ', media_id = ?';
            params.push(media_id);
        }
        updateSql += ' WHERE id = ?';
        params.push(id);
        await pool.query(updateSql, params);

        await pool.query('DELETE FROM page_post WHERE post_id = ?', [id]);
        if (page_id) {
            await pool.query('INSERT INTO page_post (page_id, post_id) VALUES (?, ?)', [page_id, id]);
        }

        res.json({ message: 'Article modifié' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la modification' });
    }
}
import { getAll, getAllAdmin, getById, create, archive, getArchived, unarchive, deletePostAndArchive } from '../models/postsModel.js';

// Retourne tous les articles d'une catégorie (publique)
export async function getPostsByCategory(req, res) {
    try {
        const category = req.params.category;
        const posts = await getAll({ category });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

// Suppression définitive d'un article
export async function deletePostAndArchiveController(req, res) {
    try {
        await deletePostAndArchive(req.params.postId);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression définitive' });
    }
}

// Désarchive un article
export async function unarchivePost(req, res) {
    try {
        await unarchive(req.params.archiveId);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors du désarchivage' });
    }
}

// Liste des articles archivés
export async function getArchivedPosts(req, res) {
    try {
        const posts = await getArchived();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
}
// Archive un article
export async function archivePost(req, res) {
    try {
        await archive(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de l\'archivage' });
    }
}

export async function getAllPosts(req, res) {
    try {
        const { category, title } = req.query;
        const posts = await getAll({ category, title });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

export async function getAllPostsAdmin(req, res) {
    try {
        const posts = await getAllAdmin();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

export async function getPostById(req, res) {
    try {
        const post = await getById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Article non trouvé' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

import pool from '../models/db.js';

export async function updatePostStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    if (status !== 'publi\u00e9' && status !== 'brouillon') {
        return res.status(400).json({ message: 'Statut invalide. Valeurs acceptées : publi\u00e9, brouillon.' });
    }
    try {
        const [result] = await pool.query('UPDATE posts SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Article non trouvé' });
        res.json({ id, status });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
}

export async function createPost(req, res) {
    try {
        let image_url = null;
        let image_filename = null;
        if (req.file) {
            image_filename = req.file.filename;
            image_url = `/img/${image_filename}`;
        }
        const { title, category_id, content, page_id, status } = req.body;
        // Extrait un excerpt automatique si non fourni
        const excerpt = content ? content.replace(/<[^>]+>/g, '').slice(0, 200) : '';
        const post = await create({ title, category_id, excerpt, content, image_url, image_filename, status });

        // Lier à une page si page_id fourni
        if (page_id) {
            await pool.query('INSERT INTO page_post (page_id, post_id) VALUES (?, ?)', [page_id, post.id]);
        }

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
}
