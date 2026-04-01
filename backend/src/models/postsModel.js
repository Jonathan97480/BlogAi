// Supprime définitivement un article (de posts et archives)
export async function deletePostAndArchive(postId) {
    try {
        await pool.query('DELETE FROM archives WHERE post_id = ?', [postId]);
        await pool.query('DELETE FROM posts WHERE id = ?', [postId]);
    } catch (err) {
        logError('postsModel.js', err.message);
        throw err;
    }
}
// Désarchive un article (supprime la ligne dans archives)
export async function unarchive(archiveId) {
    try {
        await pool.query('DELETE FROM archives WHERE id = ?', [archiveId]);
    } catch (err) {
        logError('postsModel.js', err.message);
        throw err;
    }
}

// Récupère tous les articles archivés (avec infos post)
export async function getArchived() {
    try {
        const [rows] = await pool.query(`
            SELECT posts.*, archives.archived_at, archives.id AS archive_id, media.url AS media_url
            FROM posts
            INNER JOIN archives ON posts.id = archives.post_id
            LEFT JOIN media ON posts.media_id = media.id
            ORDER BY archives.archived_at DESC
        `);
        return rows;
    } catch (err) {
        logError('postsModel.js', err.message);
        throw err;
    }
}
// Archive un article (ajoute dans la table archives)
export async function archive(postId) {
    try {
        await pool.query('INSERT INTO archives (post_id) VALUES (?)', [postId]);
        // Optionnel : supprimer l'article de posts si tu veux un vrai archivage (décommenter la ligne suivante)
        // await pool.query('DELETE FROM posts WHERE id = ?', [postId]);
    } catch (err) {
        logError('postsModel.js', err.message);
        throw err;
    }
}
import pool from './db.js';
import { logError } from '../utils/logger.js';

export async function getAll({ category, title }) {
    // Ajoute le titre de la page liée (si existe) et l'id de l'image
    let sql = `SELECT DISTINCT posts.*, media.url AS media_url, media.id AS media_id, categorie.name AS category, page.titre AS page_titre 
        FROM posts 
        LEFT JOIN media ON posts.media_id = media.id 
        LEFT JOIN categorie ON posts.category_id = categorie.id 
        LEFT JOIN page_post ON posts.id = page_post.post_id 
        LEFT JOIN page ON page_post.page_id = page.id 
        WHERE posts.id NOT IN (SELECT post_id FROM archives)`;
    const params = [];
    try {
        if (category) {
            sql += ' AND categorie.name = ?';
            params.push(category);
        }
        if (title) {
            sql += ' AND posts.title LIKE ?';
            params.push(`%${title}%`);
        }
        sql += ' ORDER BY posts.created_at DESC';
        const [rows] = await pool.query(sql, params);
        return rows;
    } catch (err) {
        logError('postsModel.js', err.message);
        throw err;
    }
}

export async function getById(id) {
    try {
        const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
        return rows[0];
    } catch (err) {
        logError('postsModel.js', err.message);
        throw err;
    }
}

export async function create(post) {
    const { title, category_id, excerpt, content, image_url, image_filename, status } = post;
    let media_id = null;
    const conn = pool;
    try {
        if (image_url && image_filename) {
            // Insère dans media
            const [mediaRes] = await conn.query(
                'INSERT INTO media (filename, url) VALUES (?, ?)',
                [image_filename, image_url]
            );
            media_id = mediaRes.insertId;
        }
        const postStatus = status || 'brouillon';
        const [result] = await conn.query(
            'INSERT INTO posts (title, category_id, excerpt, content, media_id, status) VALUES (?, ?, ?, ?, ?, ?)',
            [title, category_id, excerpt, content, media_id, postStatus]
        );
        return { id: result.insertId, ...post, media_id, status: postStatus };
    } catch (err) {
        logError('postsModel.js', err.message);
        throw err;
    }
}
