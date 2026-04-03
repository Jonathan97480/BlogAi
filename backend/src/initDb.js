import mysql from 'mysql2/promise';


import dotenv from 'dotenv';
dotenv.config();
// Connexion via variables d'environnement
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'azerty';
const DB_NAME = process.env.DB_NAME || 'blog_ai_tech';

const schemas = [
    `CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS page (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        description TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS categorie (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        media_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'brouillon',
        FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL
    )`,
    // Table idea (Idée d'article)
    `CREATE TABLE IF NOT EXISTS idea (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category_id INT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        media_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_processed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (category_id) REFERENCES categorie(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS archives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )`,
    // Table de liaison page <-> post
    `CREATE TABLE IF NOT EXISTS page_post (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id INT NOT NULL,
        post_id INT NOT NULL,
        FOREIGN KEY (page_id) REFERENCES page(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        UNIQUE KEY unique_page_post (page_id, post_id)
    )`,
    // Nouvelle table pour stocker les paramètres IA personnalisés
    `CREATE TABLE IF NOT EXISTS ApiIAText (
        id INT AUTO_INCREMENT PRIMARY KEY,
        url_ia VARCHAR(255) NOT NULL,
        key_ia VARCHAR(255) NOT NULL,
        id_IA VARCHAR(100),
        pront_ia TEXT
    )`,
    // Table pour stocker les liens réseaux sociaux
    `CREATE TABLE IF NOT EXISTS socialLink (
        id INT AUTO_INCREMENT PRIMARY KEY,
        x_twitter_url VARCHAR(255) DEFAULT NULL,
        facebook_url VARCHAR(255) DEFAULT NULL,
        reddit_url VARCHAR(255) DEFAULT NULL,
        instagram_url VARCHAR(255) DEFAULT NULL,
        discord_url VARCHAR(255) DEFAULT NULL,
        youtube_url VARCHAR(255) DEFAULT NULL,
        tiktok_url VARCHAR(255) DEFAULT NULL
    )`,
    // Table pour stocker les clés API et permissions associées
    `CREATE TABLE IF NOT EXISTS apiKey (
        id INT AUTO_INCREMENT PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL UNIQUE,
        permissions VARCHAR(8) NOT NULL
    )`,
    // Table de paramètres génériques (clé/valeur)
    `CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`value\` TEXT NOT NULL
    )`,
    // Table de versioning des articles (sauvegarde avant chaque modification)
    `CREATE TABLE IF NOT EXISTS post_versions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_article INT NOT NULL,
        article JSON NOT NULL,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_article) REFERENCES posts(id) ON DELETE CASCADE
    )`
];

(async () => {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME
        });
        for (const sql of schemas) {
            await connection.query(sql);
        }
        // Suppression des doublons dans page_post (sécurité migration)
        try {
            await connection.query(`
                DELETE t1 FROM page_post t1
                INNER JOIN page_post t2
                WHERE t1.id > t2.id AND t1.page_id = t2.page_id AND t1.post_id = t2.post_id;
            `);
        } catch (err) {
            console.warn('Avertissement : doublons page_post non supprimés', err.message);
        }
        // Ajout de la contrainte d'unicité (si absente)
        try {
            await connection.query('ALTER TABLE page_post ADD UNIQUE KEY unique_page_post (page_id, post_id)');
        } catch (err) {
            if (!err.message.includes('Duplicate key name')) {
                console.warn('Avertissement : contrainte unique_page_post non ajoutée', err.message);
            }
        }
        // Valeur par défaut pour settings
        await connection.query(
            'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = `value`',
            ['admin_page_size', '8']
        );
        // Ajout d'une clé API de test avec toutes les permissions si pas en production
        if (process.env.NODE_ENV !== 'production') {
            const testKey = 'sk-test-allperms';
            const testPerms = '1111';
            const [rows] = await connection.query('SELECT * FROM apiKey WHERE api_key = ?', [testKey]);
            if (rows.length === 0) {
                await connection.query('INSERT INTO apiKey (api_key, permissions) VALUES (?, ?)', [testKey, testPerms]);
                console.log('Clé API de test insérée :', testKey, testPerms);
            }
        }
        console.log('Base de données initialisée avec succès.');
        await connection.end();
    } catch (err) {
        console.error('Erreur lors de l\'initialisation de la base :', err.message);
        process.exit(1);
    }
})();
