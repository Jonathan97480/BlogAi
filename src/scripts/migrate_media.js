
import mysql from 'mysql2/promise';


import dotenv from 'dotenv';
dotenv.config();
// Connexion via variables d'environnement
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'azerty';
const DB_NAME = process.env.DB_NAME || 'blog_ai_tech';

(async () => {
    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME
    });

    // Vérifie si la table media existe
    const [mediaTable] = await connection.query("SHOW TABLES LIKE 'media'");
    if (mediaTable.length === 0) {
        // Crée la table media
        await connection.query(`CREATE TABLE media (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            url VARCHAR(255) NOT NULL
        )`);
        console.log('Table media créée.');
    } else {
        console.log('Table media déjà existante.');
    }

    // Pour chaque post qui a une image_url mais pas de media_id, migrer l'image
    const [posts] = await connection.query("SELECT id, image_url FROM posts WHERE image_url IS NOT NULL AND (media_id IS NULL OR media_id = 0)");
    for (const post of posts) {
        if (!post.image_url) continue;
        const filename = post.image_url.replace('/img/', '');
        const url = post.image_url;
        // Insère dans media
        const [mediaRes] = await connection.query(
            'INSERT INTO media (filename, url) VALUES (?, ?)',
            [filename, url]
        );
        const media_id = mediaRes.insertId;
        // Met à jour le post
        await connection.query('UPDATE posts SET media_id = ?, image_url = NULL WHERE id = ?', [media_id, post.id]);
        console.log(`Post ${post.id} migré vers media_id ${media_id}`);
    }


    // 1. Ajoute la colonne category_id à posts si elle n'existe pas
    const [cols] = await connection.query("SHOW COLUMNS FROM posts LIKE 'category_id'");
    if (cols.length === 0) {
        await connection.query(`ALTER TABLE posts ADD COLUMN category_id INT NULL, ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categorie(id) ON DELETE SET NULL`);
        console.log('Colonne category_id ajoutée à posts.');
    } else {
        console.log('Colonne category_id déjà existante.');
    }

    // 2. Récupère toutes les catégories distinctes des posts
    const [distinctCats] = await connection.query('SELECT DISTINCT category FROM posts');
    for (const row of distinctCats) {
        if (!row.category) continue;
        // Génère un slug simple (minuscule, tirets)
        const slug = row.category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        // Insère la catégorie si elle n'existe pas déjà
        await connection.query('INSERT IGNORE INTO categorie (slug, name) VALUES (?, ?)', [slug, row.category]);
    }
    console.log('Catégories migrées dans la table categorie.');

    // 3. Met à jour chaque post pour pointer vers le bon category_id
    const [allPosts] = await connection.query('SELECT id, category FROM posts');
    for (const post of allPosts) {
        if (!post.category) continue;
        const slug = post.category.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const [[catRow]] = await connection.query('SELECT id FROM categorie WHERE slug = ?', [slug]);
        if (catRow && catRow.id) {
            await connection.query('UPDATE posts SET category_id = ? WHERE id = ?', [catRow.id, post.id]);
        }
    }
    console.log('Posts reliés à leur catégorie.');

    await connection.end();
    console.log('Migration terminée.');
})();
