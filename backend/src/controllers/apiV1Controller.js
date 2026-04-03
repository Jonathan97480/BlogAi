import pool from '../models/db.js';
import { create as createPost, getById, saveVersion } from '../models/postsModel.js';
import { logError } from '../utils/logger.js';

export async function getArticleByName(req, res) {
    if (!req.apiPerms.read) return res.status(403).json({ message: 'Permission lecture requise' });
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: 'Nom requis' });
    const [rows] = await pool.query('SELECT * FROM posts WHERE title = ?', [name]);
    res.json(rows);
}

export async function getArticleByID(req, res) {
    if (!req.apiPerms.read) return res.status(403).json({ message: 'Permission lecture requise' });
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    res.json(rows[0] || null);
}

export async function setArticle(req, res) {
    if (!req.apiPerms.write) return res.status(403).json({ message: 'Permission écriture requise' });
    try {
        const { title, content, category_id, page_id, excerpt, status, image_url, image_filename } = req.body || {};
        if (!title || !content || !category_id) {
            return res.status(400).json({ message: 'Champs obligatoires manquants (title, content, category_id)' });
        }

        const post = await createPost({
            title,
            category_id,
            excerpt: excerpt || '',
            content,
            status: status || 'brouillon',
            image_url: image_url || null,
            image_filename: image_filename || null
        });

        if (page_id) {
            await pool.query('INSERT INTO page_post (page_id, post_id) VALUES (?, ?)', [page_id, post.id]);
        }

        res.status(201).json({
            id: post.id,
            title,
            category_id,
            page_id: page_id || null,
            media_id: post.media_id || null
        });
    } catch (err) {
        console.error('[apiV1Controller.setArticle]', err);
        res.status(500).json({ message: 'Erreur lors de la création de l\'article', error: err.message });
    }
}

export async function editArticle(req, res) {
    if (!req.apiPerms.write) return res.status(403).json({ message: 'Permission écriture requise' });
    try {
        const { id } = req.params;
        const { title, content, category_id, page_id, excerpt, status, image_url, image_filename } = req.body || {};
        if (!title || !content || !category_id) {
            return res.status(400).json({ message: 'Champs obligatoires manquants (title, content, category_id)' });
        }

        let media_id = null;
        if (image_url && image_filename) {
            const [mediaRes] = await pool.query(
                'INSERT INTO media (filename, url) VALUES (?, ?)',
                [image_filename, image_url]
            );
            media_id = mediaRes.insertId;
        }

        let sql = 'UPDATE posts SET title = ?, category_id = ?, excerpt = ?, content = ?, status = ?';
        const params = [title, category_id, excerpt || '', content, status || 'brouillon'];
        if (media_id) {
            sql += ', media_id = ?';
            params.push(media_id);
        }
        sql += ' WHERE id = ?';
        params.push(id);

        // Sauvegarde de l'ancienne version avant modification
        const currentPost = await getById(id);
        if (currentPost) {
            await saveVersion(id, currentPost);
        }

        const [result] = await pool.query(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Article non trouvé' });
        }

        await pool.query('DELETE FROM page_post WHERE post_id = ?', [id]);
        if (page_id) {
            await pool.query('INSERT INTO page_post (page_id, post_id) VALUES (?, ?)', [page_id, id]);
        }

        res.json({ id: Number(id), title, category_id, page_id: page_id || null, status: status || 'brouillon' });
    } catch (err) {
        logError('apiV1Controller.js', err.message);
        res.status(500).json({ message: 'Erreur lors de la modification de l\'article', error: err.message });
    }
}

export async function getPages(req, res) {
    if (!req.apiPerms.read) return res.status(403).json({ message: 'Permission lecture requise' });
    try {
        const [rows] = await pool.query('SELECT id, titre FROM page ORDER BY titre ASC');
        res.json(rows.map(r => ({ id: r.id, name: r.titre })));
    } catch (err) {
        console.error('[apiV1Controller.getPages]', err);
        res.status(500).json({ message: 'Erreur lors de la récupération des pages', error: err.message });
    }
}

export async function getCategories(req, res) {
    if (!req.apiPerms.read) return res.status(403).json({ message: 'Permission lecture requise' });
    try {
        const [rows] = await pool.query('SELECT id, name FROM categorie ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error('[apiV1Controller.getCategories]', err);
        res.status(500).json({ message: 'Erreur lors de la récupération des catégories', error: err.message });
    }
}

export async function iaOptimiseText(req, res) {
    if (!req.apiPerms.ia) return res.status(403).json({ message: 'Permission IA requise' });
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Texte requis' });
    res.json({ optimised: text + ' [optimisé]' });
}

export async function setAdminUser(req, res) {
    if (!req.apiPerms.admin) return res.status(403).json({ message: 'Permission admin requise' });
    const { username, password_hash } = req.body;
    if (!username || !password_hash) return res.status(400).json({ message: 'Champs manquants' });
    const [result] = await pool.query('INSERT INTO admin (username, password_hash) VALUES (?, ?)', [username, password_hash]);
    res.status(201).json({ id: result.insertId });
}

export async function getAdminUser(req, res) {
    if (!req.apiPerms.admin) return res.status(403).json({ message: 'Permission admin requise' });
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, username FROM admin WHERE id = ?', [id]);
    res.json(rows[0] || null);
}

export async function getArticleVersion(req, res) {
    if (!req.apiPerms.read) return res.status(403).json({ message: 'Permission lecture requise' });
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT id, id_article, article, modified_at FROM post_versions WHERE id = ?',
            [id]
        );
        if (!rows[0]) return res.status(404).json({ message: 'Version non trouvée' });
        const version = rows[0];
        const article = typeof version.article === 'string' ? JSON.parse(version.article) : version.article;
        res.json({ id: version.id, id_article: version.id_article, modified_at: version.modified_at, article });
    } catch (err) {
        logError('apiV1Controller.js', err.message);
        res.status(500).json({ message: 'Erreur lors de la récupération de la version' });
    }
}
